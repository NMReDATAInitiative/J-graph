import { GraphBase } from './graphBase.js';
import { updateColumnsPositions } from './updateColumnsPositions.js';
import { updateColumnsAction } from './updateColumnsAction.js';
import { updateBlockPosition } from './updateBlockPosition.js';
import { AssignedCouplings } from './assignedCouplings.js';
import { jmolUnselectAll } from './jmolInterface.js';
import { getJgraphColor } from './getJgraphColor.js';
import { jmolSelectAtom } from './jmolInterface.js';
import { jmolGetNBbonds } from './jmolInterface.js';
import { jmolGetInfo } from './jmolInterface.js';

export class NmrAssignment extends GraphBase {
	constructor(jGraphData, svg, jgraphObj, settings) {
  // data for base which takes care of communication between classes
    const name = 'nameIsWiredInConstructor_NmrSpectrum1';
    super(name, {
      dataTypesSend: [''],
      dataTypesReceive: [''],
    });
    this.svg = svg;
    this.jgraphObj = jgraphObj;

//prepareVisualisationJgraph() {
    const processedData = this.processCSVData(jGraphData);
    // const unassignedCouplings = new UnassignedCouplings(processedData); // Adjust based on actual data needs
    let arrayColumns = [];
    let labelColumnArray = [];
    let chemColumnArray = [];
    let indexAtomMol = []; // atom index in the mol structure

    // Mapping fields from each row to new arrays
    jGraphData.forEach((d) => {
      const index1 = d.indexColumn1 - 1; // Adjusting index to 0-based
      const index2 = d.indexColumn2 - 1;

      arrayColumns[index1] = d.chemShift1;
      arrayColumns[index2] = d.chemShift2;

      labelColumnArray[index1] = d.labelColumn1;
      labelColumnArray[index2] = d.labelColumn2;

      indexAtomMol[index1] = d.indexInMolFile1;
      indexAtomMol[index2] = d.indexInMolFile2;

      chemColumnArray[index1] = d.chemShift1;
      chemColumnArray[index2] = d.chemShift2;
    });
    // sort arrayColumns by decreasing values of chemical shift
    var len = arrayColumns.length;
    var indices = new Array(len);
    for (var i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) {
      return arrayColumns[a] < arrayColumns[b]
        ? 1
        : arrayColumns[a] > arrayColumns[b]
        ? -1
        : 0;
    });
    var indicesSorted = new Array(len);
    for (i = 0; i < len; ++i) indicesSorted[indices[i]] = i;

    function populateDataColumns(
      processedData,
      jGraphData,
      chemColumnArray,
      labelColumnArray,
      indicesSorted,
      indexAtomMol,
      updateBlockPosition,
      minSpaceBetweekCircles,
      minSpaceBetweekBlocks,
    ) {
      let dataColumns = [];
      for (let i = 0; i < processedData.arrayColumns.length; i++) {
        let listOfJs = [];

        jGraphData.forEach((d, i1) => {
          const condition = d.Label !== 'noAssignement';

          if (i + 1 === +d.indexColumn1) {
            listOfJs.push({
              isAssigned: condition,
              indexInAssignmentList: i1,
              isFirstInAssignmentIndex: true,
              Jvalue: +d.Jvalue,
              JlevelAvoidContact: Math.abs(+d.Jvalue),
            });
          }
          if (i + 1 === +d.indexColumn2) {
            listOfJs.push({
              isAssigned: condition,
              indexInAssignmentList: i1,
              isFirstInAssignmentIndex: false,
              Jvalue: +d.Jvalue,
              JlevelAvoidContact: Math.abs(+d.Jvalue),
            });
          }
        });

        listOfJs.sort((a, b) => a.JlevelAvoidContact - b.JlevelAvoidContact);

        listOfJs = updateBlockPosition(
          listOfJs,
          minSpaceBetweekCircles,
          minSpaceBetweekBlocks,
        );

        dataColumns.push({
          chemShift: chemColumnArray[i],
          labelColumn: labelColumnArray[i],
          MyIndex: indicesSorted[i],
          atomIndexMol: indexAtomMol[i],
          listOfJs: listOfJs,
        });
      }

      dataColumns.sort((a, b) =>
        a.chemShift < b.chemShift ? 1 : a.chemShift > b.chemShift ? -1 : 0,
      );

      return dataColumns;
    }

    jgraphObj.dataColumns = populateDataColumns(
      processedData,
      jGraphData,
      chemColumnArray,
      labelColumnArray,
      indicesSorted,
      indexAtomMol,
      updateBlockPosition,
      settings.jGraph.minSpaceBetweekCircles,
      settings.jGraph.minSpaceBetweekBlocks,
    );

    jgraphObj.assignedCouplings = new AssignedCouplings(jgraphObj.dataColumns);
    //assignedCouplings.consconstructFromJgraphtructor(jGraph);  // obsolete

    /*  var dataUnassignedCoupCircles = [];
     for (i = 0; i < unassignedCouplings.content.length; i++) {
       const inInd1 = indicesSorted[unassignedCouplings.content[i].colNumber1];
       const inInd2 = indicesSorted[unassignedCouplings.content[i].colNumber2];
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd1],
         'value': unassignedCouplings.content[i].Jvalue,
         'MyIndex': inInd1,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd2],
         'value': unassignedCouplings.content[i].Jvalue,
         'MyIndex': inInd2,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
     }*/
    function populateDataUnassignedCoupCircles(dataColumns) {
      let dataUnassignedCoupCircles = [];
      for (let indexList1 = 0; indexList1 < dataColumns.length; indexList1++) {
        for (let i1 = 0; i1 < dataColumns[indexList1].listOfJs.length; i1++) {
          if (!dataColumns[indexList1].listOfJs[i1].isAssigned) {
            dataUnassignedCoupCircles.push({
              chemShift: dataColumns[indexList1].chemShift,
              valueOnBar:
                dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact,
              value: dataColumns[indexList1].listOfJs[i1].Jvalue,
              MyIndex: indexList1,
              dataColIndex1: indexList1,
              dataColIndex2: i1,
              uniqIndex: dataUnassignedCoupCircles.length,
              indexAtomMol: dataColumns[indexList1].atomIndexMol,
            });
          }
        }
      }
      return dataUnassignedCoupCircles;
    }
    jgraphObj.dataUnassignedCoupCircles = populateDataUnassignedCoupCircles(
      jgraphObj.dataColumns,
    );

    function populateDataAssignedCoupBlocks(dataColumns) {
      let dataAssignedCoupBlocks = [];
      for (let indexList1 = 0; indexList1 < dataColumns.length; indexList1++) {
        for (let i1 = 0; i1 < dataColumns[indexList1].listOfJs.length; i1++) {
          if (dataColumns[indexList1].listOfJs[i1].isAssigned) {
            dataAssignedCoupBlocks.push({
              chemShift: dataColumns[indexList1].chemShift,
              value: dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact,
              trueValue: dataColumns[indexList1].listOfJs[i1].Jvalue,
              MyIndex: indexList1,
              uniqIndex: dataAssignedCoupBlocks.length,
            });
          }
        }
      }
      return dataAssignedCoupBlocks;
    }

    jgraphObj.dataAssignedCoupBlocks = populateDataAssignedCoupBlocks(
      jgraphObj.dataColumns,
    );

    jgraphObj.assignedCouplings.udateLineTrajectory(
      settings.jGraph.spaceBlock,
      2.0 * settings.spectrum.lineWidth * settings.jGraph.nbHzPerPoint,
      settings.jGraph.spaceCircle,
      jgraphObj.dataColumns,
    );
    //u console.log("TassignedCouplings 1 :" + JSON.stringify(assignedCouplings));

    // Make list of positions according to size of jGraphData
    const numberItem = arrayColumns.length;
    jgraphObj.smallSpace = settings.spectrum.widthOfThePlot / (numberItem + 1); // five items, six spaces
    if (
      jgraphObj.smallSpace > settings.jGraph.preferedDistanceInPtBetweenColumns
    ) {
      jgraphObj.smallSpace = settings.jGraph.preferedDistanceInPtBetweenColumns;
    }

    var leftPosColumns = [];
    var rightPosColumns = [];
    for (let i = 0; i < numberItem; i++) {
      const curPosLeft = (i + 0.5) * jgraphObj.smallSpace;
      const curPosRight =
        settings.spectrum.widthOfThePlot -
        (numberItem - i - 0.5) * jgraphObj.smallSpace;
      leftPosColumns.push(curPosLeft);
      rightPosColumns.push(curPosRight);
    }
    jgraphObj.leftPosColumns = leftPosColumns;
    jgraphObj.rightPosColumns = rightPosColumns;

    jgraphObj.yJs = d3
      .scaleLinear()
      .domain([0, settings.jGraph.maxScaleJ])
      .range([
        settings.jGraph.heightJscale + settings.jGraph.positionJscale,
        settings.jGraph.positionJscale,
      ]);
    //jgraphObj.pathFun = pathFun;
jgraphObj.highlightColumn = (event, d) => {
  jmolUnselectAll();
  const number = d.atomIndexMol; // Assuming 'atomIndexMol' is a property of 'd'
  const atomColorHighlightSingle = [127, 255, 127];
  jmolSelectAtom(number, atomColorHighlightSingle);
  setTimeout(() => {
    jmolUnselectAll();
  }, 3200);
};


    // Unhighlight
    /*

     var doNotHighlightLines = function (toto) {

    //           jmolUnselectAll();

        d3.selectAll(".line")
          .transition().duration(200).delay(300)
          //   .style("stroke", function (d) { return (color(d.Label)) })
          // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, settings.jGraph.darkMode) })
          .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), settings.jGraph.darkMode); })
          .style("opacity", "1")
     };
*/

    //  Unhighlight
    /*    var doNotHighlightDot = function (d) {
           d3.selectAll(".circleL")
             .transition().duration(200).delay(300)
             .style("opacity", "1")
           selected_specie = "textCircle" + d.uniqIndex;
   
           d3.selectAll("." + selected_specie)
             .transition().duration(200).delay(3000)
             // .style("stroke", color(selected_specie))
             .style("opacity", "0")
   
           d3.selectAll(".rulerClass")
             .transition().duration(200).delay(3000)
             .attr("y1", yJs(0.0))
             .attr("y2", yJs(0.0))
             .style("opacity", '0.0')
         }
   */

    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
  /*}


  buildGraph() {
  */


jgraphObj.spreadPositionsUU = updateColumnsPositions(
        jgraphObj.dataColumns,
        jgraphObj.leftPosColumns,
        jgraphObj.x,
        jgraphObj.rightPosColumns,
        jgraphObj.smallSpace,
      );




this.settings = settings;
    this.theColumnsConnectColumnToSpectrumPosition = svg
      .selectAll('columnns')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'ColunnSegment1')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return (
          settings.jGraph.pointingLineColum + settings.jGraph.positionJscale
        );
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);
    // streight down
    this.theColumnsVerticalInSpectrum = svg
      .selectAll('ColunnSegment2')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.pointingLineColum + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return settings.spectrum.height;
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    this.theColumnsMainVerticalBackLine = svg
      .selectAll('ColunnSegment9')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.topJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('stroke', settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    this.theColumnLabel = svg
      .selectAll('textc')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('text')
      .attr('class', function (d) {
        return 'textColumn' + d.uniqIndex;
      })
      .attr('x', function (d) {
        return jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y', function (d) {
        return (
          -3 +
          settings.jGraph.topJGraphYposition +
          settings.jGraph.positionJscale
        );
      })
      // .text(function (d) { return "" + d.chemShift; })
      .text(function (d) {
        return '' + d.labelColumn;
      })
      .attr('dx', -1.0 * settings.jGraph.generalUseWidth)
      .style('font-size', settings.jGraph.generalUseWidth * 2.5)
      .style('font-family', 'Helvetica')
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    //.style("font-weight", "2pt")
    // Lines

    this.theColumns = {
      theColumnsConnectColumnToSpectrumPosition:
        this.theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum: this.theColumnsVerticalInSpectrum,
      theColumnLabel: this.theColumnLabel,
      theColumnsMainVerticalBackLine: this.theColumnsMainVerticalBackLine,
    };

    this.theColumns = {
      theColumnsConnectColumnToSpectrumPosition:
        this.theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum: this.theColumnsVerticalInSpectrum,
      theColumnLabel: this.theColumnLabel,
      theColumnsMainVerticalBackLine: this.theColumnsMainVerticalBackLine,
    };

    this.jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      theColumns: this.theColumns,
    };
  }

  getTheColumns() {
    return this.theColumns;
  }

  updateJgraphObj(jgraphObj) {
	this.jgraphObj = jgraphObj;
  }

  updateVisu() {
    var spreadPositionsZZ = updateColumnsPositions(
      this.jgraphObj.dataColumns,
      this.jgraphObj.leftPosColumns,
      this.jgraphObj.x,
      this.jgraphObj.rightPosColumns,
      this.jgraphObj.smallSpace,
    );

    updateColumnsAction(
      spreadPositionsZZ,
      0,
      this.settings.jGraph.positionJscale,
      this.settings.jGraph.topJGraphYposition,
      this.settings.jGraph.jGraphParameters.colorShowLine,
      this.settings.jGraph.jGraphParameters.colorHideLine,
      this.settings.jGraph.generalUseWidth,
      this.jgraphObj.x,
      this.settings.spectrum.widthOfThePlot,
      this.jgraphObj,
      this.settings.jGraph.blockWidth,
      this.jgraphObj.yJs,
    );

  }

   processCSVData(jGraphData) {
    return jGraphData.reduce(
      (acc, cur) => {
        ['1', '2'].forEach((index) => {
          const chemShiftKey = `chemShift${index}`;
          const labelKey = `labelColumn${index}`;
          const indexKey = `indexColumn${index}`;
          const indexInMolFileKey = `indexInMolFile${index}`;

          acc.arrayColumns[cur[indexKey] - 1] = cur[chemShiftKey];
          acc.labelColumnArray[cur[indexKey] - 1] = cur[labelKey];
          acc.indexAtomMol[cur[indexKey] - 1] = cur[indexInMolFileKey];
          acc.chemColumnArray[cur[indexKey] - 1] = cur[chemShiftKey];
        });
        return acc;
      },
      {
        arrayColumns: [],
        labelColumnArray: [],
        chemColumnArray: [],
        indexAtomMol: [],
      },
    );
  }



   visualizeJgraph() {
    var yAxisn = this.svg.append('g').call(d3.axisLeft(this.jgraphObj.yJs).ticks(3));

var yAxisn2 = this.svg
  .append('g')
  .attr('transform', () => {
    return 'translate(' + this.settings.spectrum.widthOfThePlot + ')';
  })
  .call(d3.axisRight(this.jgraphObj.yJs).ticks(3));

var theTicksCouplings = this.svg
  .selectAll('tickLines')
  .data(this.settings.jGraph.jGraphParameters.dataTicksCouplings)
  .enter()
  .append('line')
  .attr('class', 'Grid')
  .attr('x1', this.settings.spectrum.lineWidth)
  .attr('y1', (d) => {
    return this.jgraphObj.yJs(d);
  })
  .attr('x2', this.settings.spectrum.widthOfThePlot)
  .attr('y2', (d) => {
    return this.jgraphObj.yJs(d);
  })
  .attr('stroke', '#EEEEEE')
  .style('stroke-width', this.settings.spectrum.lineWidth);

var theGridLinesCouplings = this.svg
  .selectAll('theRuler')
  .data(this.settings.jGraph.jGraphParameters.dataTicksCouplings)
  .enter()
  .append('line')
  .attr('class', 'rulerClass')
  .attr('x1', () => this.settings.spectrum.lineWidth)
  .attr('y1', () => this.jgraphObj.yJs(0.0))
  .attr('x2', () => this.settings.spectrum.widthOfThePlot)
  .attr('y2', () => this.jgraphObj.yJs(0.0))
  .attr('stroke', 'red')
  .style('stroke-dasharray', [
    this.settings.spectrum.lineWidth * 2,
    this.settings.spectrum.lineWidth * 2,
  ])
  .style('stroke-width', this.settings.spectrum.lineWidth)
  .style('opacity', '0.0');

    /*
         var dimensions = [1, 1.2, 1.3, 2, 3, 5];
         var yn = {};
         for (i in dimensions) {
           var name = dimensions[i];
           yn[name] = d3.scaleLinear()
             .domain([0.0, 22.0]) // --> Same axis range for each group
             // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
             .range([settings.spectrum.height / 3.0, settings.spectrum.height / 6.0]);
         }
         */

    // Columns

    // oblique
    //    assignedCouplings.spreadPositionsZZ = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, jgraphObj.smallSpace);
    this.jgraphObj.spreadPositionsUU = updateColumnsPositions(
      this.jgraphObj.dataColumns,
      this.jgraphObj.leftPosColumns,
      this.jgraphObj.x,
      this.jgraphObj.rightPosColumns,
      this.jgraphObj.smallSpace,
    );

 
var theColumnsMainVerticalLine = this.svg
  .selectAll('ColunnSegment3')
  .data(this.jgraphObj.dataColumns)
  .enter()
  .append('line')
  .attr('class', 'Colunn')
  .attr('x1', (d) => this.jgraphObj.spreadPositionsUU[d.MyIndex])
  .attr('x2', (d) => this.jgraphObj.spreadPositionsUU[d.MyIndex])
  .attr('y1', (d) => this.settings.jGraph.topJGraphYposition + this.settings.jGraph.positionJscale)
  .attr('y2', (d) => this.settings.jGraph.bottomJGraphYposition + this.settings.jGraph.positionJscale)
  .attr('stroke', 'black') // just sketched... update will fix colors
  .style('stroke-width', this.settings.jGraph.lineWidthColumn)
  .on('click', (event, d) => this.jgraphObj.highlightColumn(event, d)) // Pass both event and data
  .on('mouseover', (event, d) => this.jgraphObj.highlightColumn(event, d));


   var theColumnsBase = this.svg
  .selectAll('ColunnSegment4')
  .data(this.jgraphObj.dataColumns)
  .enter()
  .append('line')
  .attr('class', 'Colunn')
  .attr('x1', (d) => 
    this.jgraphObj.spreadPositionsUU[d.MyIndex] + this.settings.jGraph.generalUseWidth
  )
  .attr('x2', (d) => 
    this.jgraphObj.spreadPositionsUU[d.MyIndex] - this.settings.jGraph.generalUseWidth
  )
  .attr('y1', (d) => 
    this.settings.jGraph.bottomJGraphYposition + this.settings.jGraph.positionJscale
  )
  .attr('y2', (d) => 
    this.settings.jGraph.bottomJGraphYposition + this.settings.jGraph.positionJscale
  )
  .attr('stroke', 'black') // just sketched... update will fix colors
  .style('stroke-width', this.settings.jGraph.lineWidthCircle)
  .on('click', (d) => this.jgraphObj.highlightColumn(d))
  .on('mouseover', (d) => this.jgraphObj.highlightColumn(d));

    this.jgraphObj.assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
      this.jgraphObj.dataColumns,
      this.jgraphObj.leftPosColumns,
      this.jgraphObj.x,
      this.jgraphObj.rightPosColumns,
      this.jgraphObj.smallSpace,
    );

    if ('assignedCouplings' in this.jgraphObj) {
      this.jgraphObj.assignedCouplings.theLinesW =
        this.jgraphObj.assignedCouplings.makeGraphic(
          this.jgraphObj.x,
          this.svg,
          this.settings.spectrum.lineWidth,
          this.settings.jGraph.darkMode,
          this.settings.jGraph.generalUseWidth,
          this.jgraphObj.smallSpace,
          this.settings.jGraph.blockWidth,
          this.jgraphObj.yJs,
        );
    }

    
      var highlightDot = (d, wasDoubleClicked) => {
        if ('assignedCouplings' in this.jgraphObj) {
          if ('spreadPositionsZZ' in this.jgraphObj.assignedCouplings) {
            this.jgraphObj.assignedCouplings.spreadPositionsZZ =
              updateColumnsPositions(
                this.jgraphObj.dataColumns,
                this.jgraphObj.leftPosColumns,
                this.jgraphObj.x,
                this.jgraphObj.rightPosColumns,
                this.jgraphObj.smallSpace,
              );
          }
        }
      

      var spreadPositionsNew = updateColumnsPositions(
        this.jgraphObj.dataColumns,
         this.jgraphObj.leftPosColumns,
         this.jgraphObj.x,
         this.jgraphObj.rightPosColumns,
         this.jgraphObj.smallSpace,
      );

      // specific to those matching the condition of similarity of J's
      var numberCandidate = 0;
      const deltaSearchJ = 0.5;
      const referenceSpinMol = d.indexAtomMol;
      const referenceSpin = d;
      var partnerSpinNumberMol;
      var partnerSpinObj;
      d3.selectAll('.circleL').filter(function (p) {
        const test =
          Math.abs(d.value - p.value) <= deltaSearchJ &&
          d.uniqIndex != p.uniqIndex &&
          d.MyIndex != p.MyIndex &&
          (jmolGetNBbonds(referenceSpinMol, p.indexAtomMol) == 2 ||
            jmolGetNBbonds(referenceSpinMol, p.indexAtomMol) == 3);
        if (test) {
          numberCandidate++;
          partnerSpinNumberMol = p.indexAtomMol;
          partnerSpinObj = p;
        }
      });

      // Add assignment
      if (numberCandidate == 1) {
        if (wasDoubleClicked) {
          document.getElementById('textMainPage').innerHTML =
            'TMP Info :  ' + referenceSpinMol + ' ' + partnerSpinNumberMol;
          this.jgraphObj.assignedCouplings.theLinesW =
            this.jgraphObj.assignedCouplings.addAssignment(
              this.jgraphObj.dataColumns,
              referenceSpin,
              partnerSpinObj,
              this.svg,
              this.settings.spectrum.lineWidth,
              this.settings.jGraph.darkMode,
              this.settings.jGraph.generalUseWidth,
              this.jgraphObj.yJs,
              this.jgraphObj.smallSpace,
              this.settings.jGraph.blockWidth,
              this.pathFun,
            );
          this.jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs[
            referenceSpin.dataColIndex2
          ].isAssigned = true;
          this.jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs[
            partnerSpinObj.dataColIndex2
          ].isAssigned = true;

          this.jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs =
            updateBlockPosition(
             this.jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs,
              this.settings.jGraph.minSpaceBetweekCircles,
              this.settings.jGraph.minSpaceBetweekBlocks,
            );
          this.jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs =
            updateBlockPosition(
              this.jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs,
              this.settings.jGraph.minSpaceBetweekCircles,
              this.settings.jGraph.minSpaceBetweekBlocks,
            );

          // UGLY FIX TO BE MOVED OUT
          for (
            var indexList1 = 0;
            indexList1 < this.jgraphObj.dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < this.jgraphObj.dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (!this.jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned) {
                for (
                  var iloo = 0;
                  iloo < this.jgraphObj.dataUnassignedCoupCircles.length;
                  iloo++
                ) {
                  if (
                    this.jgraphObj.dataUnassignedCoupCircles[iloo].dataColIndex1 ==
                    indexList1
                  ) {
                    if (
                      this.jgraphObj.dataUnassignedCoupCircles[iloo].dataColIndex2 ==
                      i1
                    ) {
                      this.jgraphObj.dataUnassignedCoupCircles[iloo].valueOnBar =
                        this.jgraphObj.dataColumns[indexList1].listOfJs[
                          i1
                        ].JlevelAvoidContact;
                    }
                  }
                }
              }
            }
          }

          this.jgraphObj.assignedCouplings.spreadPositionsZZ =
            updateColumnsPositions(
              this.jgraphObj.dataColumns,
              this.jgraphObj.leftPosColumns,
              this.jgraphObj.x,
              this.jgraphObj.rightPosColumns,
              this.jgraphObj.smallSpace,
            );

          updateColumnsAction(
            this.jgraphObj.assignedCouplings.spreadPositionsZZ,
            1000,
            this.settings.jGraph.positionJscale,
            this.settings.jGraph.topJGraphYposition,
            this.settings.jGraph.jGraphParameters.colorShowLine,
            this.settings.jGraph.jGraphParameters.colorHideLine,
            this.settings.jGraph.generalUseWidth,
            this.jgraphObj.x,
            this.settings.spectrum.widthOfThePlot,
            this.jgraphObj,
            this.settings.jGraph.blockWidth,
            this.jgraphObj.yJs,
          );
          this.jgraphObj.assignedCouplings.udateLineTrajectory(
            this.settings.jGraph.spaceBlock,
            2.0 * this.settings.spectrum.lineWidth * this.settings.jGraph.nbHzPerPoint,
            this.settings.jGraph.spaceCircle,
            this.jgraphObj.dataColumns,
          );
          this.precomputePaths();

          this.jgraphObj.assignedCouplings.updateTheLines(
            this.jgraphObj.yJs,
            this.jgraphObj.smallSpace,
            this.settings.jGraph.blockWidth,
            this.pathFun,
          );

          // remove the two dots
          d3.selectAll('.circleL')
            .filter(function (p) {
              const test =
                d.uniqIndex == p.uniqIndex ||
                partnerSpinObj.uniqIndex == p.uniqIndex;
              return test;
            })
            .remove();

          // redraw blocks
         this.svg.selectAll('.circleS').remove();
          // This is redundant with other part
          this.jgraphObj.dataAssignedCoupBlocks = [];
          for (
            var indexList1 = 0;
            indexList1 < this.jgraphObj.dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < this.jgraphObj.dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (this.jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned) {
                this.jgraphObj.dataAssignedCoupBlocks.push({
                  chemShift: this.jgraphObj.dataColumns[indexList1].chemShift,
                  value:
                    this.jgraphObj.dataColumns[indexList1].listOfJs[i1]
                      .JlevelAvoidContact,
                  trueValue:
                    this.jgraphObj.dataColumns[indexList1].listOfJs[i1].Jvalue,
                  MyIndex: indexList1,
                  uniqIndex: this.jgraphObj.dataAssignedCoupBlocks.length,
                });
              }
            }
          }
         

this.jgraphObj.theBlocks = this.svg
  .selectAll('rect') // specify a selector instead of an empty string
  .data(this.jgraphObj.dataAssignedCoupBlocks)
  .enter()
  .append('rect')
  .attr('class', 'circleS')
  .attr('x', (d) => {
    return this.jgraphObj.x(d.chemShift + this.settings.jGraph.blockWidth);
  })
  .attr('y', (d) => {
    return (
      this.jgraphObj.yJs(Math.abs(d.value)) -
      this.settings.jGraph.halfBlockHeight
    );
  })
  .attr('width', 2 * this.settings.jGraph.blockWidth)
  .attr('height', 2 * this.settings.jGraph.halfBlockHeight)
  .style('fill', (d) => {
    return getJgraphColor(Math.abs(d.trueValue), this.settings.jGraph.darkMode);
  })
  .attr('stroke', 'black')
  .style('stroke-width', this.settings.jGraph.lineWidthBlocks);

updateColumnsAction(
  this.jgraphObj.assignedCouplings.spreadPositionsZZ,
  0,
  this.settings.jGraph.positionJscale,
  this.settings.jGraph.topJGraphYposition,
  this.settings.jGraph.jGraphParameters.colorShowLine,
  this.settings.jGraph.jGraphParameters.colorHideLine,
  this.settings.jGraph.generalUseWidth,
  this.jgraphObj.x,
  this.settings.spectrum.widthOfThePlot,
  this.jgraphObj,
  this.settings.jGraph.blockWidth,
  this.jgraphObj.yJs,
);




        }
      }
      jmolUnselectAll();
      // pointed atom
      const curColHighligh = [0, 0, 0]; // black
      jmolSelectAtom(referenceSpinMol, curColHighligh);
      if (numberCandidate == 1) {
        var textToDisplay = jmolGetInfo(
          referenceSpinMol,
          partnerSpinNumberMol,
          'J',
        );
        document.getElementById('textMainPage').innerHTML =
          '? ' + textToDisplay;
      } else {
        document.getElementById('textMainPage').innerHTML = 'No guess!';
      }

      // select color when only one candidate, or more ...
      var highColor = 'green';
      if (numberCandidate != 1) {
        highColor = 'red';
      }

      // Work on view
      // Unselect hydrogens

      d3.selectAll('.line')
        .transition()
        .duration(200)
        .style('stroke', 'black')
        .style('opacity', '0.1')
        .transition()
        .duration(20)
        .delay(this.settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', function (d) {
          return getJisOK(d.jOKcolor);
        })
        .style('opacity', '1');

      // first every group dimmed
      d3.selectAll('.circleL')
        .transition()
        .duration(10)
        .delay(10)
        .style('stroke', 'black')
        .style('opacity', '0.1')
        .style('stroke-width', this.settings.spectrum.lineWidth)
        .transition()
        .duration(200)
        .delay(1.2 * this.settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', this.settings.spectrum.lineWidth);

      // wrong distance dots
      d3.selectAll('.circleL')
        .transition()
        .duration(20)
        .delay(300)
        .filter(function (p) {
          const test =
            Math.abs(d.value - p.value) <= deltaSearchJ &&
            d.uniqIndex != p.uniqIndex &&
            d.MyIndex != p.MyIndex &&
            !(
              jmolGetNBbonds(d.indexAtomMol, p.indexAtomMol) == 2 ||
              jmolGetNBbonds(d.indexAtomMol, p.indexAtomMol) == 3
            ) &&
            true;
          if (test) jmolSelectAtom(p.indexAtomMol, [255, 0, 50]); // pink
          return test;
        })
        .style('stroke', 'red')
        .style('opacity', '1.0')
        .style('stroke-width', this.settings.spectrum.lineWidth * 2.0);

      // right distance dots
      d3.selectAll('.circleL')
        .transition()
        .duration(20)
        .delay(300)
        .filter(function (p) {
          const test =
            Math.abs(d.value - p.value) <= deltaSearchJ &&
            d.uniqIndex != p.uniqIndex &&
            d.MyIndex != p.MyIndex &&
            (jmolGetNBbonds(d.indexAtomMol, p.indexAtomMol) == 2 ||
              jmolGetNBbonds(d.indexAtomMol, p.indexAtomMol) == 3) &&
            true;
          if (test) jmolSelectAtom(p.indexAtomMol, [0, 255, 50]); // dunno
          return test;
        })
        .style('stroke', highColor)
        .style('opacity', '1.0')
        .style('stroke-width', this.settings.spectrum.lineWidth * 2.0);

      // starting dots
      d3.selectAll('.circleL')
        .transition()
        .duration(20)
        .delay(310)
        .filter(function (p) {
          return d.uniqIndex == p.uniqIndex;
        })
        .style('opacity', '1.0')
        .style('stroke-width', this.settings.spectrum.lineWidth * 2.0)
        .style('stroke', curColHighligh);

      // all will get back to normal
      d3.selectAll('.circleL')
        .transition()
        .duration(200)
        .delay(this.settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', this.settings.spectrum.lineWidth);

      d3.selectAll('.rulerClass')
        .transition()
        .duration(200)
        .delay(0)
        .attr('y1', this.jgraphObj.yJs(Math.abs(d.value)))
        .attr('y2', this.jgraphObj.yJs(Math.abs(d.value)))
        .style('opacity', '1.0')
        .style('stroke', highColor)
        .transition()
        .duration(200)
        .delay(this.settings.jGraph.jGraphParameters.delayBeforeErase)
        .attr('y1', this.jgraphObj.yJs(Math.abs(d.value)))
        .attr('y2', this.jgraphObj.yJs(Math.abs(d.value)))
        .style('opacity', '0.0')
        .style('stroke', 'black');

      var selectedCicle = 'textCircle' + d.uniqIndex;
      d3.selectAll('.' + selectedCicle)
        .transition()
        .duration(100)
        .delay(10)
        .style('stroke', curColHighligh)
        .style('opacity', '1.0')
        .transition()
        .duration(200)
        .delay(this.settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '0.0');

      var theTextDotNew = this.svg
        .append('text')
        //   .attr("class", "toBesgdfgfsgdHidden")
        .attr('x', spreadPositionsNew[d.MyIndex])
        // .attr("x",  x(d.chemShift))
        .attr('y', this.jgraphObj.yJs(Math.abs(d.valueOnBar) + 3.0))
        //  .text( "J = " + d.value + "val " + (Math.abs(d.valueOnBar + 3.0)) + " pos:" + spreadPositionsNew[d.MyIndex])
        .text('J = ' + d.value)
        // .attr('dx', 1.3 * settings.jGraph.generalUseWidth)
        .style('font-size', this.settings.jGraph.generalUseWidth * 2.5)
        .style('font-family', 'Helvetica')
        .style('text-anchor', 'middle')
        .transition()
        .duration(100)
        .delay(3000)
        .remove();
      /*
  var theTextDots2 = svg.selectAll("textt")
           .data(dataUnassignedCoupCircles)
           .enter()
           .append("text")
           .attr("class", function (d) { return "textCircle" + d.uniqIndex; })
           .attr("y", function (d) { return yJs(Math.abs(d.valueOnBar + 3.0)); })
           // .style("fill", "gray")
           //   .attr("stroke", "red")
           // .style("stroke-width", settings.jGraph.lineWidthBlocks)
           .text(function (d) { return "J = " + d.value; })
        //   .attr("dx", 1.3 * settings.jGraph.generalUseWidth)
           .style("font-size", settings.jGraph.generalUseWidth * 2.5)
           .style("font-family", "Helvetica")
           .attr("x", function (d) { return x(d.chemShift); })
          // .attr("x", function (d) { return spreadPositionsNew[d.MyIndex]; })
         //  .attr("transform", function (d) { return "rotate(-45," + spreadPositionsNew[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           .attr("opacity", 0.0);
        //   .transition().duration(100).delay(3000);
          // .remove();
       */
    };

    // Circles
var theDots = this.svg
  .selectAll('dots')
  .data(this.jgraphObj.dataUnassignedCoupCircles)
  .enter()
  .append('circle')
  .attr('class', 'circleL')
  .attr('cx', (d) => this.jgraphObj.x(d.chemShift))
  .attr('cy', (d) => this.jgraphObj.yJs(Math.abs(d.valueOnBar)))
  .attr('r', this.settings.jGraph.circleRadius)
  .style('fill', (d) => getJgraphColor(Math.abs(d.value), this.settings.jGraph.darkMode))
  .attr('stroke', 'black')
  .style('stroke-width', this.settings.jGraph.lineWidthCircle)
  .on('mouseover', (event, d) => {
    event.preventDefault();
    highlightDot(d, false);
  })
  .on('click', (event, d) => {
    event.preventDefault();
    highlightDot(d, false);
  })
  .on('dblclick', (event, d) => {
    event.preventDefault();
    highlightDot(d, true);
  });

    /*
         // .on("mouseleave", doNotHighlightDot)
          var theTextDots2 = svg.selectAll("textt")
           .data(dataUnassignedCoupCircles)
           .enter()
           .append("text")
           .attr("class", function (d) { return "textCircle" + d.uniqIndex; })
           .attr("y", function (d) { return jgraphObj.yJs(Math.abs(d.valueOnBar + 3.0)); })
           // .style("fill", "gray")
           //   .attr("stroke", "red")
           // .style("stroke-width", settings.jGraph.lineWidthBlocks)
           .text(function (d) { return "J = " + d.value; })
        //   .attr("dx", 1.3 * settings.jGraph.generalUseWidth)
           .style("font-size", settings.jGraph.generalUseWidth * 2.5)
           .style("font-family", "Helvetica")
           .attr("x", function (d) { return MyIndex; })
          // .attr("x", function (d) { return spreadPositionsNew[d.MyIndex]; })
         //  .attr("transform", function (d) { return "rotate(-45," + spreadPositionsNew[d.MyIndex] + "," + jgraphObj.yJs(Math.abs(d.value)) + ")"; })
           .attr("opacity", 0.0);
        //   .transition().duration(100).delay(3000);
          // .remove();
         // Dots
          */
var theBlocks = this.svg
  .selectAll()
  .data(this.jgraphObj.dataAssignedCoupBlocks)
  .enter()
  .append('rect')
  .attr('class', 'circleS')
  .attr('x', (d) => this.jgraphObj.x(d.chemShift + this.settings.jGraph.blockWidth))
  .attr('y', (d) => 
    this.jgraphObj.yJs(Math.abs(d.value)) - this.settings.jGraph.halfBlockHeight
  )
  .attr('width', 2 * this.settings.jGraph.blockWidth)
  .attr('height', 2 * this.settings.jGraph.halfBlockHeight)
  .style('fill', (d) => 
    getJgraphColor(Math.abs(d.trueValue), this.settings.jGraph.darkMode)
  )
  .attr('stroke', 'black')
  .style('stroke-width', this.settings.jGraph.lineWidthBlocks);

this.jgraphObj = {
  ...this.jgraphObj, // Copy all existing properties of jgraphObj
  yAxisn: yAxisn,
  yAxisn2: yAxisn2,
  theTicksCouplings: theTicksCouplings,
  theGridLinesCouplings: theGridLinesCouplings,
  theColumnsMainVerticalLine: theColumnsMainVerticalLine,
  theColumnsBase: theColumnsBase,
  theDots: theDots,
  theBlocks: theBlocks,
};

    return this.jgraphObj;
  }

  // Function to calculate the path data
  calculatePath(d) {
    console.log("rrff")
    console.log("rrff",this.jgraphObj)
    const y1a = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap1));
    const y1b = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap2));
    const y2 = this.jgraphObj.yJs(Math.abs(d.JvalueShifted));
    const horizontalShiftX =
      this.jgraphObj.smallSpace - this.settings.jGraph.blockWidth - 1.5;
    const horizontalShiftSideBlock = this.settings.jGraph.blockWidth;

    let usedHorizontalShiftX = eval(horizontalShiftX);
    let usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
    const cs1 = this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn1];
    const cs2 = this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn2];

    if (cs1 > cs2) {
      usedHorizontalShiftX = eval(-usedHorizontalShiftX);
      usedHorizontalShiftSideBlock = eval(-usedHorizontalShiftSideBlock);
    }

    const combine = [
      [cs1 + usedHorizontalShiftSideBlock, y1a],
      [cs1 + usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftSideBlock, y1b],
    ];

    d.xx = (cs1 + cs2) / 2.0;
    const Gen = d3.line();

    return Gen(combine); // Return the path data
  }


  // Precompute paths for all data points
  precomputePaths() {
	const tmp = this.jgraphObj.assignedCouplings.getAssignedCouplings();
    tmp.forEach(d => {
      d.pathData = this.calculatePath(d); // Store precomputed path data
    });
  }
  // Function to calculate the path data
  calculatePath(d) {
    console.log("rrff")
    console.log("rrff",this.jgraphObj)
    const y1a = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap1));
    const y1b = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap2));
    const y2 = this.jgraphObj.yJs(Math.abs(d.JvalueShifted));
    const horizontalShiftX =
      this.jgraphObj.smallSpace - this.settings.jGraph.blockWidth - 1.5;
    const horizontalShiftSideBlock = this.settings.jGraph.blockWidth;

    let usedHorizontalShiftX = eval(horizontalShiftX);
    let usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
    const cs1 = this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn1];
    const cs2 = this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn2];

    if (cs1 > cs2) {
      usedHorizontalShiftX = eval(-usedHorizontalShiftX);
      usedHorizontalShiftSideBlock = eval(-usedHorizontalShiftSideBlock);
    }

    const combine = [
      [cs1 + usedHorizontalShiftSideBlock, y1a],
      [cs1 + usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftSideBlock, y1b],
    ];

    d.xx = (cs1 + cs2) / 2.0;
    const Gen = d3.line();

    return Gen(combine); // Return the path data
  }

}
