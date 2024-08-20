import { GraphBase } from './graphBase.js';
import { updateColumnsPositions } from './updateColumnsPositions.js';
import { updateColumnsAction } from './updateColumnsAction.js';
import { updateBlockPosition } from './updateBlockPosition.js';
import { AssignedCouplings } from './assignedCouplings.js';
import { getJgraphColor } from './getJgraphColor.js';

// jmol Interface
import { jmolUnselectAll } from './jmolInterface.js';
import { jmolSelectAtom } from './jmolInterface.js';
import { jmolGetNBbonds } from './jmolInterface.js';
import { jmolGetInfo } from './jmolInterface.js';
export class NmrAssignment extends GraphBase {
  constructor(jGraphData, svg, smallScreen, settings_with_spectrum_settings) {
    // data for base which takes care of communication between classes

    const name = 'nameIsWiredInConstructor_NmrAssignment1';
    super(name, {
      dataTypesSend: [],
      dataTypesReceive: ['xAxisSpectrum'],
      logAllDataExchange: false, // Enable logging for this instance if true
    });

    this.svg = svg;
    this.jgraphObj = {};

    const settings = this.initializeSettings(
      smallScreen,
      settings_with_spectrum_settings,
    );
    if (Array.isArray(jGraphData) && jGraphData.length > 0) {
      console.log('jGraphData,', jGraphData);
      this.ingestCSData(jGraphData, settings);
    }
    if (jGraphData !== null && typeof jGraphData === 'object') {
      console.log('jGraphData,', jGraphData);
      //this.ingestObject(jGraphData, settings);
    }
    console.log('this.jgraphObjU ' , this.jgraphObj);
    console.log('this.jgraphObjU ' + JSON.stringify(this.jgraphObj));

    this.jgraphObj.assignedCouplings.udateLineTrajectory(
      settings.jGraph.spaceBlock,
      2.0 * settings.spectrum.lineWidth * settings.jGraph.nbHzPerPoint,
      settings.jGraph.spaceCircle,
      this.jgraphObj.dataColumns,
    );

    // Make list of positions according to size of jGraphData
    //const numberItem = arrayColumns.length;
    const numberItem = this.jgraphObj.dataColumns.length;
    this.jgraphObj.smallSpace = settings.spectrum.widthOfThePlot / numberItem;
    if (
      this.jgraphObj.smallSpace >
      settings.jGraph.preferedDistanceInPtBetweenColumns
    ) {
      this.jgraphObj.smallSpace =
        settings.jGraph.preferedDistanceInPtBetweenColumns;
    }

    var leftPosColumns = [];
    var rightPosColumns = [];
    for (let i = 0; i < numberItem; i++) {
      const curPosLeft = (i + 0.5) * this.jgraphObj.smallSpace;
      const curPosRight =
        settings.spectrum.widthOfThePlot -
        (numberItem - i - 0.5) * this.jgraphObj.smallSpace;
      leftPosColumns.push(curPosLeft);
      rightPosColumns.push(curPosRight);
    }
    this.jgraphObj.leftPosColumns = leftPosColumns;
    this.jgraphObj.rightPosColumns = rightPosColumns;
    this.settings = settings;
  }

  ingestCSData(jGraphData, settings) {
    //const processedDatadel = this.processCSVDataDEL(jGraphData);

    const processedData = jGraphData.reduce(
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
console.log("processedData ", processedData);
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

    this.jgraphObj.dataColumns = populateDataColumns(
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

    this.jgraphObj.assignedCouplings = new AssignedCouplings(
      this.jgraphObj.dataColumns,
    );

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
    this.jgraphObj.dataUnassignedCoupCircles =
      populateDataUnassignedCoupCircles(this.jgraphObj.dataColumns);

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

    this.jgraphObj.dataAssignedCoupBlocks = populateDataAssignedCoupBlocks(
      this.jgraphObj.dataColumns,
    );
  }

  initializeSettings(smallScreen, overrideSettings = {}) {
    // Default settings
    let defaultSettings = {
      jGraph: {
        ratioOccupyJgraph: smallScreen ? 0.5 : 0.25,
        spaceBetweenColumns: smallScreen ? 5 : 10,
        maxScaleJ: 22.0,
        generalUseWidth: smallScreen ? 15.0 : 5.0,
        jGraphParameters: {
          dataTicksCouplings: [0, 5, 10, 15, 20],
          colorShowLine: '#CCCCCC',
          colorHideLine: '#EEEEEE00',
          delayBeforeErase: 3000,
        },
      },
    };

    // Merge default settings with overrides
    let settings = { ...defaultSettings, ...overrideSettings };

    //settings.jGraph

    settings.jGraph.circleRadius = Math.round(
      settings.jGraph.generalUseWidth * 0.8,
    );
    settings.jGraph.blockWidth = Math.round(
      settings.jGraph.generalUseWidth * 0.9,
    );
    settings.jGraph.halfBlockHeight = Math.round(
      settings.jGraph.generalUseWidth / 3.0,
    );
    settings.jGraph.lineWidthCircle = settings.spectrum.lineWidth;
    settings.jGraph.lineWidthColumn = Math.round(
      settings.spectrum.lineWidth / 2.0,
    );
    settings.jGraph.lineWidthBlocks = Math.round(
      settings.spectrum.lineWidth / 2.0,
    );
    settings.jGraph.heightJscale =
      settings.spectrum.height * settings.jGraph.ratioOccupyJgraph;
    settings.jGraph.positionJscale = 20;
    settings.jGraph.topJGraphYposition = 0;
    settings.jGraph.bottomJGraphYposition = settings.jGraph.heightJscale;
    settings.jGraph.pointingLineColum =
      settings.jGraph.bottomJGraphYposition + 20;
    settings.jGraph.nbHzPerPoint =
      settings.jGraph.maxScaleJ / settings.jGraph.heightJscale;
    settings.jGraph.minSpaceBetweekBlocks =
      settings.jGraph.nbHzPerPoint *
      (2 * settings.jGraph.halfBlockHeight +
        (1.0 * settings.jGraph.lineWidthBlocks) / 2.0);
    settings.jGraph.minSpaceBetweekCircles =
      settings.jGraph.nbHzPerPoint *
      (2 * settings.jGraph.circleRadius +
        (2.0 * settings.jGraph.lineWidthBlocks) / 2.0);
    settings.jGraph.spaceBlock =
      (settings.jGraph.halfBlockHeight +
        settings.jGraph.lineWidthBlocks / 2.0 +
        +1.0) *
      settings.jGraph.nbHzPerPoint;
    settings.jGraph.spaceCircle =
      (2.0 * settings.jGraph.circleRadius +
        settings.jGraph.lineWidthBlocks / 2.0 +
        settings.spectrum.lineWidth +
        1.0) *
      settings.jGraph.nbHzPerPoint;
    settings.jGraph.preferedDistanceInPtBetweenColumns =
      2.0 * settings.jGraph.generalUseWidth +
      settings.jGraph.lineWidthCircle +
      settings.jGraph.spaceBetweenColumns;

    return settings;
  }

  build() {
    this.jgraphObj.yJs = d3
      .scaleLinear()
      .domain([0, this.settings.jGraph.maxScaleJ])
      .range([
        this.settings.jGraph.heightJscale + this.settings.jGraph.positionJscale,
        this.settings.jGraph.positionJscale,
      ]);
    // Ensure jgraphObj exists
    if (this.jgraphObj) {
      // Define highlightColumn function within jgraphObj
      this.jgraphObj.highlightColumn = (event, d) => {
        jmolUnselectAll(); // Clear previous selections

        const number = d.atomIndexMol; // Ensure 'atomIndexMol' is a valid property of 'd'
        if (number !== undefined) {
          const atomColorHighlightSingle = [127, 255, 127];
          jmolSelectAtom(number, atomColorHighlightSingle); // Highlight the selected atom

          setTimeout(() => {
            jmolUnselectAll(); // Unselect after the timeout
          }, 3200);
        } else {
          console.error(
            'atomIndexMol is undefined or not a valid property of the provided data.',
          );
        }
      };
    } else {
      console.error('jgraphObj is undefined.');
    }

    this.jgraphObj.spreadPositionsUU = updateColumnsPositions(
      this.jgraphObj.dataColumns,
      this.jgraphObj.leftPosColumns,
      this.jgraphObj.x,
      this.jgraphObj.rightPosColumns,
      this.jgraphObj.smallSpace,
    );
    // this.settings = settings;
    var theColumnsConnectColumnToSpectrumPosition = this.svg
      .selectAll('columnns')
      .data(this.jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'ColunnSegment1')
      .attr('x1', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', (d) => {
        return (
          this.settings.jGraph.bottomJGraphYposition +
          this.settings.jGraph.positionJscale
        );
      })
      .attr('y2', (d) => {
        return (
          this.settings.jGraph.pointingLineColum +
          this.settings.jGraph.positionJscale
        );
      })
      .attr('stroke', this.settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update will fix colors
      .style('stroke-width', this.settings.jGraph.lineWidthColumn)
      .on('click', (event, d) => this.jgraphObj.highlightColumn(event, d)) // Pass both event and data
      .on('mouseover', (event, d) => this.jgraphObj.highlightColumn(event, d));

    // streight down
    var theColumnsVerticalInSpectrum = this.svg
      .selectAll('ColunnSegment2')
      .data(this.jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', (d) => {
        return (
          this.settings.jGraph.pointingLineColum +
          this.settings.jGraph.positionJscale
        );
      })
      .attr('y2', (d) => {
        return this.settings.spectrum.height;
      })
      .attr('stroke', this.settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update will fix colors

      .style('stroke-width', this.settings.jGraph.lineWidthColumn)
      .on('click', this.jgraphObj.highlightColumn)
      .on('mouseover', this.jgraphObj.highlightColumn);

    var theColumnLabel = this.svg
      .selectAll('textc')
      .data(this.jgraphObj.dataColumns)
      .enter()
      .append('text')
      .attr('class', (d) => 'textColumn' + d.uniqIndex)
      .attr('x', (d) => this.jgraphObj.spreadPositionsUU[d.MyIndex])
      .attr(
        'y',
        (d) =>
          -3 +
          this.settings.jGraph.topJGraphYposition +
          this.settings.jGraph.positionJscale,
      )
      .text((d) => '' + d.labelColumn)
      .attr('dx', -1.0 * this.settings.jGraph.generalUseWidth)
      .style('font-size', this.settings.jGraph.generalUseWidth * 2.5)
      .style('font-family', 'Helvetica')
      .on('click', (event, d) => this.jgraphObj.highlightColumn(event, d)) // Pass both event and data
      .on('mouseover', (event, d) => this.jgraphObj.highlightColumn(event, d));

    var theColumnsMainVerticalBackLine = this.svg
      .selectAll('ColunnSegment9')
      .data(this.jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('x2', (d) => {
        return this.jgraphObj.spreadPositionsUU[d.MyIndex];
      })
      .attr('y1', (d) => {
        return (
          this.settings.jGraph.topJGraphYposition +
          this.settings.jGraph.positionJscale
        );
      })
      .attr('y2', (d) => {
        return (
          this.settings.jGraph.bottomJGraphYposition +
          this.settings.jGraph.positionJscale
        );
      })
      //.attr('stroke', this.settings.jGraph.jGraphParameters.colorHideLine) // just sketched... update will fix colors
      .attr('stroke', 'red') // just sketched... update will fix colors
      .style('stroke-width', this.settings.jGraph.lineWidthColumn)
      .on('click', (event, d) => this.jgraphObj.highlightColumn(event, d)) // Pass both event and data
      .on('mouseover', (event, d) => this.jgraphObj.highlightColumn(event, d));

    //.style("font-weight", "2pt")
    // Lines

    var theColumns = {
      theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum,
      theColumnLabel,
      theColumnsMainVerticalBackLine,
    };

    this.jgraphObj = {
      ...this.jgraphObj, // Copy all existing properties of jgraphObj
      theColumns,
    };

    this.visualizeJgraph();
    this.updateVisu();
    this.precomputePaths();

    this.updateTheLines();
  }

  xAxisSpectrum_UpdateFunction(data, sender) {
    // default action
    this.jgraphObj = {
      ...this.jgraphObj, // Copy all existing properties of jgraphObj
      x: data.content.x,
    };

    this.updateAfterChangeScale();

    var inContent = null;
    inContent = { reception: 'NMROK' };
    return inContent;
  }

  updateAfterChangeScale() {
    if ('dataColumns' in this.jgraphObj && 'theColumns' in this.jgraphObj) {
      this.jgraphObj.dataColumns.length;

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
    }

    this.precomputePaths();

    if ('assignedCouplings' in this.jgraphObj) {
      //  this.jgraphObj.assignedCouplings.updateTheLines(
      this.updateTheLines(
        this.jgraphObj.yJs,
        this.jgraphObj.smallSpace,
        this.blockWidth,
        this.pathFun,
      );
    }
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

  processCSVDataDEL(jGraphData) {
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
    var yAxisn = this.svg
      .append('g')
      .call(d3.axisLeft(this.jgraphObj.yJs).ticks(3));

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

    // oblique
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
      .attr(
        'y1',
        (d) =>
          this.settings.jGraph.topJGraphYposition +
          this.settings.jGraph.positionJscale,
      )
      .attr(
        'y2',
        (d) =>
          this.settings.jGraph.bottomJGraphYposition +
          this.settings.jGraph.positionJscale,
      )
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
      .attr(
        'x1',
        (d) =>
          this.jgraphObj.spreadPositionsUU[d.MyIndex] +
          this.settings.jGraph.generalUseWidth,
      )
      .attr(
        'x2',
        (d) =>
          this.jgraphObj.spreadPositionsUU[d.MyIndex] -
          this.settings.jGraph.generalUseWidth,
      )
      .attr(
        'y1',
        (d) =>
          this.settings.jGraph.bottomJGraphYposition +
          this.settings.jGraph.positionJscale,
      )
      .attr(
        'y2',
        (d) =>
          this.settings.jGraph.bottomJGraphYposition +
          this.settings.jGraph.positionJscale,
      )
      .attr('stroke', 'black') // just sketched... update will fix colors
      .style('stroke-width', this.settings.jGraph.lineWidthCircle)
      .on('click', (event, d) => this.jgraphObj.highlightColumn(event, d)) // Pass both event and data
      .on('mouseover', (event, d) => this.jgraphObj.highlightColumn(event, d));

    this.jgraphObj.assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
      this.jgraphObj.dataColumns,
      this.jgraphObj.leftPosColumns,
      this.jgraphObj.x,
      this.jgraphObj.rightPosColumns,
      this.jgraphObj.smallSpace,
    );

    if ('assignedCouplings' in this.jgraphObj) {
      // Example of generating pathData for each item in data

      this.jgraphObj.assignedCouplings.udateLineTrajectory(
        this.settings.jGraph.spaceBlock,
        2.0 *
          this.settings.spectrum.lineWidth *
          this.settings.jGraph.nbHzPerPoint,
        this.settings.jGraph.spaceCircle,
        this.jgraphObj.dataColumns,
      );
      // Now call the method, passing in the calculated pathData
      this.jgraphObj.assignedCouplings.theLinesW =
        this.jgraphObj.assignedCouplings.makeGraphic(
          this.svg,
          this.settings.spectrum.lineWidth,
          this.settings.jGraph.darkMode,
          this.settings.jGraph.generalUseWidth,
          this.jgraphObj.yJs,
        );
      if (false)
        this.jgraphObj.assignedCouplings.theLinesW =
          this.jgraphObj.assignedCouplings.makeGraphicOLD(
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
              if (
                !this.jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned
              ) {
                for (
                  var iloo = 0;
                  iloo < this.jgraphObj.dataUnassignedCoupCircles.length;
                  iloo++
                ) {
                  if (
                    this.jgraphObj.dataUnassignedCoupCircles[iloo]
                      .dataColIndex1 == indexList1
                  ) {
                    if (
                      this.jgraphObj.dataUnassignedCoupCircles[iloo]
                        .dataColIndex2 == i1
                    ) {
                      this.jgraphObj.dataUnassignedCoupCircles[
                        iloo
                      ].valueOnBar =
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
            2.0 *
              this.settings.spectrum.lineWidth *
              this.settings.jGraph.nbHzPerPoint,
            this.settings.jGraph.spaceCircle,
            this.jgraphObj.dataColumns,
          );
          this.precomputePaths();

          this.updateTheLines(
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
              if (
                this.jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned
              ) {
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
            .selectAll() // specify a selector instead of an empty string
            .data(this.jgraphObj.dataAssignedCoupBlocks)
            .enter()
            .append('rect')
            .attr('class', 'circleS')
            .attr('x', (d) => {
              return this.jgraphObj.x(
                d.chemShift + this.settings.jGraph.blockWidth,
              );
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
              return getJgraphColor(
                Math.abs(d.trueValue),
                this.settings.jGraph.darkMode,
              );
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
        .attr('x', spreadPositionsNew[d.MyIndex])
        .attr('y', this.jgraphObj.yJs(Math.abs(d.valueOnBar) + 3.0))
        .text('J = ' + d.value)
        .style('font-size', this.settings.jGraph.generalUseWidth * 2.5)
        .style('font-family', 'Helvetica')
        .style('text-anchor', 'middle')
        .transition()
        .duration(100)
        .delay(3000)
        .remove();
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
      .style('fill', (d) =>
        getJgraphColor(Math.abs(d.value), this.settings.jGraph.darkMode),
      )
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

    var theBlocks = this.svg
      .selectAll()
      .data(this.jgraphObj.dataAssignedCoupBlocks)
      .enter()
      .append('rect')
      .attr('class', 'circleS')
      .attr('x', (d) =>
        this.jgraphObj.x(d.chemShift + this.settings.jGraph.blockWidth),
      )
      .attr(
        'y',
        (d) =>
          this.jgraphObj.yJs(Math.abs(d.value)) -
          this.settings.jGraph.halfBlockHeight,
      )
      .attr('width', 2 * this.settings.jGraph.blockWidth)
      .attr('height', 2 * this.settings.jGraph.halfBlockHeight)
      .style('fill', (d) =>
        getJgraphColor(Math.abs(d.trueValue), this.settings.jGraph.darkMode),
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
    const y1a = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap1));
    const y1b = this.jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap2));
    const y2 = this.jgraphObj.yJs(Math.abs(d.JvalueShifted));
    const horizontalShiftX =
      this.jgraphObj.smallSpace - this.settings.jGraph.blockWidth - 1.5;
    const horizontalShiftSideBlock = this.settings.jGraph.blockWidth;

    let usedHorizontalShiftX = eval(horizontalShiftX);
    let usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
    const cs1 =
      this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn1];
    const cs2 =
      this.jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn2];

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

  updateTheLines(yJs, smallSpace, blockWidth, pathFun) {
    // Precompute the updated paths before the transition

    this.precomputePaths();
    if ('assignedCouplings' in this.jgraphObj) {
      if ('theLinesW' in this.jgraphObj.assignedCouplings) {
        this.jgraphObj.assignedCouplings.theLinesW
          .transition()
          .duration(1000)
          .attr('d', (d) => d.pathData); // Use precomputed path data
      }
    }
    return;
  }

  // Precompute paths for all data points
  precomputePaths() {
    if ('yJs' in this.jgraphObj) {
      console.log('this.jgraphObj', this.jgraphObj);
      console.log('this.jgraphObj.yJs', this.jgraphObj.yJs);
      const tmp = this.jgraphObj.assignedCouplings.getAssignedCouplings();
      tmp.forEach((d) => {
        d.pathData = this.calculatePath(d); // Store precomputed path data
      });
    }
  }
}
