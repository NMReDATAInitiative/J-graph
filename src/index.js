/*jshint esversion: 6 */

//import * as d3 from "d3"; //
import { getJgraphColor } from './getJgraphColor.js';
import { getJisOK } from './getJisOK.js';
import { updateColumnsPositions } from './updateColumnsPositions.js';
import { updateColumnsAction } from './updateColumnsAction.js';
import { AssignedCouplings } from './assignedCouplings.js';
import { UnassignedCouplings } from './unassignedCouplings.js';
import { jmolGetInfo } from './jmolInterface.js';
import { jmolGetNBbonds } from './jmolInterface.js';
import { jmolUnselectAll } from './jmolInterface.js';
import { jmolSelectAtom } from './jmolInterface.js';
import { updateBlockPosition } from './updateBlockPosition.js';

//import { jmolSelectPair } from './src/jmolInterface.js';
//import { readNmrRecord, NmrRecord, parseSDF} from 'nmredata3';
//import { nmredata } from 'nmredata-data-test';

//var del2= parseSDF("");
/*
import { nmredata } from 'nmredata-data-test';
import { readNmrRecord, NmrRecord } from 'nmredata';
*/

//import { nmredata } from './node_modules/nmredata-data-test/index.js';
//import { readNmrRecord, NmrRecord } from './node_modules/nmredata/src/index.js';
//import { readNmrRecord } from './node_modules/nmredata/src/reader/readNmrRecord.js';
//import { nmredata } from 'nmredata-data-test';

//declare module 'nmredata';
//import { readNmrRecord, NmrRecord } from 'nmredata';

/*
npm install nmredata-data-test --save
npm install nmredata --save
*/

/*
// NOT USED ....
https://medium.com/weekly-webtips/import-use-npm-modules-in-the-browser-easily-e70d6c84fc31
npm install browserify --save
npm install nmredata-data-test --save
npm install nmredata --save
node_modules/.bin/browserify client.js > client.bundle.js 
*/
/*
//readNmrRecord(nmredata['menthol_1D_1H_assigned_J.zip'], {
readNmrRecord(nmredata['../node_modules/nmredata-data-test/data/menthol_1D_1H_assigned_J.zip'], {
  zipOptions: { base64: true },
}).then(async (nmrRecord) => {
  
  let nbSDFFiles = nmrRecord.nbSamples;
  let sdfList = nmrRecord.getSDFList(); // it's return ["wild_JCH_coupling","only_one_HH_coupling_in_Jtag","compound1.nmredata","compound1_with_jcamp.nmredata","with_char_10","compound1_special_labels.nmredata copy"]
 
  let activeElement = nmrRecord.getActiveElement(); //should return 'wild_JCH_coupling'
  nmrRecord.setActiveElement('only_one_HH_coupling_in_Jtag');

  
  let allTags = nmrRecord.getNMReDataTags(); //return the tags of 'only_one_HH_coupling_in_Jtag'
  // you can get a specific tag
  let solvent = allTags['SOLVENT'];
  // To get one list with the current's tags
  let tagsList = Object.keys(allTags);
 
  let nmredata = nmrRecord.getNMReData();

  
  var json = await nmrRecord.toJSON();
  //

});
*/

export function jGraphNmredata(
  fileNameSpectrum,
  fileNameData,
  parseSDF,
  readNmrRecord,
  NmrRecord,
) {
  console.log('text parseSDF 2 ' + parseSDF);
  console.log('text readNmrRecord 2 ' + readNmrRecord);
  console.log('text NmrRecord 2 ' + NmrRecord);
  jGraph(fileNameSpectrum, fileNameData);
}
export function jGraph(fileNameSpectrum, fileNameData) {
  //
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 };
  var bodyWidth = 800;
  var bodyHeight = 450;
  var lineWidth = 1.5;
  var maxScaleJ = 22.0;
  var ratioOccupyJgraph = 1.0 / 4.0;
  var generalUseWidth = 5.0;
  var spaceBetweenColumns = 10;
  var darkMode = false; // True not implemented
  //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  if (
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    generalUseWidth = 15.0;
    margin = { top: 50, right: 10, bottom: 30, left: 10 }; // For vertical
    bodyWidth = 800;
    bodyHeight = 1000; // Not good when horizontal....
    lineWidth = 5;
    ratioOccupyJgraph = 1.0 / 2.0;
    spaceBetweenColumns = spaceBetweenColumns / 2.0;
  }
  var circleRadius = generalUseWidth * 0.8;
  var blockWidth = Math.round(generalUseWidth * 0.9);
  var halfBlockHeight = generalUseWidth / 3.0;

  var widthOfThePlot = bodyWidth - margin.left - margin.right;
  var height = bodyHeight - margin.top - margin.bottom;
  var heightJscale = height * ratioOccupyJgraph;
  var positionJscale = 20;

  var lineWidthCircle = lineWidth;
  var lineWidthColumn = lineWidth / 2.0;

  var lineWidthBlocks = lineWidth / 2;

  var preferedDistanceInPtBetweenColumns =
    2.0 * generalUseWidth + lineWidthCircle + spaceBetweenColumns; // In pt

  var topJGraphYposition = 0;
  var bottomJGraphYposition = heightJscale;
  var pointingLineColum = bottomJGraphYposition + 20;
  const nbHzPerPoint = maxScaleJ / heightJscale;
  const minSpaceBetweekBlocks =
    nbHzPerPoint * (2 * halfBlockHeight + (1.0 * lineWidthBlocks) / 2.0);
  const minSpaceBetweekCircles =
    nbHzPerPoint * (2 * circleRadius + (2.0 * lineWidthBlocks) / 2.0);
  const spaceBlock =
    (halfBlockHeight + lineWidthBlocks / 2.0 + +1.0) * nbHzPerPoint;
  const spaceCircle =
    (2.0 * circleRadius + lineWidthBlocks / 2.0 + lineWidth + 1.0) *
    nbHzPerPoint;

  /*
       const jcccol = getJgraphColor(11.2, darkMode);
       console.log("getJgraphColor :jcccol " + jcccol);
   */
  // append the svg object to the body of the page
  var svg = d3
    .select('#my_dataviz')
    .append('svg')
    .attr('width', widthOfThePlot + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  function processCSVData(jGraphData) {
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

  async function loadSpectrum(fileName) {
    try {
      const spectrumData = await d3.csv(fileName, (d) => ({
        chemShift: +d.x,
        value: +d.y,
      }));
      return spectrumData;
    } catch (error) {
      console.error(
        'Error loading or processing data from :' + fileName,
        error,
      );
    }
  }

  async function readDataFile(fileNameData) {
    try {
      // Ensure d3.csv properly loads the data
      const jGraphData = await d3.csv(fileNameData);
      console.log('Loaded data from ' + fileNameData + ' : ', jGraphData);
      if (!Array.isArray(jGraphData)) {
        throw new Error('Data loaded ' + fileNameData + ' is not an array.');
      } else {
        return jGraphData;
      }
    } catch (error) {
      console.error(
        'Error processing or visualizing the data for ' + fileNameData + ':',
        error,
      );
    }
  }

  async function processDataAndVisualize(fileNameData, fileNameSpectrum) {
    try {
      const jGraphData = await readDataFile(fileNameData);
      const spectrumData = await loadSpectrum(fileNameSpectrum);
      visualizeData(jGraphData, spectrumData);
    } catch (error) {
      console.error('Error processing or visualizing the data ', error);
    }
  }
  function visualizeData(jGraphData, spectrumData) {
    const processedData = processCSVData(jGraphData);
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

    let dataColumns = populateDataColumns(
      processedData,
      jGraphData,
      chemColumnArray,
      labelColumnArray,
      indicesSorted,
      indexAtomMol,
      updateBlockPosition,
      minSpaceBetweekCircles,
      minSpaceBetweekBlocks,
    );

    var assignedCouplings = new AssignedCouplings(dataColumns);
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
              valueOnBar: dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact,
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
    let dataUnassignedCoupCircles =
      populateDataUnassignedCoupCircles(dataColumns);

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

    let dataAssignedCoupBlocks = populateDataAssignedCoupBlocks(dataColumns);

    assignedCouplings.udateLineTrajectory(
      spaceBlock,
      2.0 * lineWidth * nbHzPerPoint,
      spaceCircle,
      dataColumns,
    );
    //u console.log("TassignedCouplings 1 :" + JSON.stringify(assignedCouplings));

    // Make list of positions according to size of jGraphData
    const numberItem = arrayColumns.length;
    var smallSpace = widthOfThePlot / (numberItem + 1); // five items, six spaces
    if (smallSpace > preferedDistanceInPtBetweenColumns) {
      smallSpace = preferedDistanceInPtBetweenColumns;
    }

    var leftPosColumns = [];
    var rightPosColumns = [];
    for (let i = 0; i < numberItem; i++) {
      const curPosLeft = (i + 0.5) * smallSpace;
      const curPosRight = widthOfThePlot - (numberItem - i - 0.5) * smallSpace;
      leftPosColumns.push(curPosLeft);
      rightPosColumns.push(curPosRight);
    }

    // console.log("Left pos :" + JSON.stringify(leftPosColumns));
    // console.log("Right pos :" + JSON.stringify(rightPosColumns));

    var yJs = d3
      .scaleLinear()
      .domain([0, maxScaleJ])
      .range([heightJscale + positionJscale, positionJscale]);

    var yAxisn = svg.append('g').call(d3.axisLeft(yJs).ticks(3));

    var highlightColumn = function (event, d) {
      jmolUnselectAll();
      const number = d.atomIndexMol; // Assuming 'atomIndexMol' is a property of 'd'
      const atomColorHighlightSingle = [127, 255, 127];
      jmolSelectAtom(number, atomColorHighlightSingle);
      setTimeout(function () {
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
          // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
          .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
          .style("opacity", "1")
     };
*/

    var jGraphParameters = {
      dataTicksCouplings: [0, 5, 10, 15, 20],
      colorShowLine: '#CCCCCC',
      colorHideLine: '#EEEEEE00',
      delayBeforeErase: 3000,
    };

    function pathFun(d) {
      /*
          The four points for assignment lines  
           | __ |
           |/  \|
           O    O
           |    |
          */

      const y1a = yJs(Math.abs(d.JvalueAntiOverlap1));
      const y1b = yJs(Math.abs(d.JvalueAntiOverlap2));
      // const y2 = yJs(Math.abs(d.JvalueShifted));
      //const iiidex = d.iindex;
      //   console.log("iiidex = " + JSON.stringify(d.iindex));
      //     console.log("assignedCouplings.content[d.iindex].JvalueShifted = " + JSON.stringify(assignedCouplings.content[d.iindex].JvalueShifted));
      // HERE
      //const alterative = dataColumns[0].JvalueAntiOverlap1;//
      //console.log("test same... = " + JSON.stringify(alterative) + " "  +  JSON.stringify(Math.abs(assignedCouplings.content[d.iindex].JvalueShifted)) );
      const y2 = yJs(Math.abs(d.JvalueShifted));
      //const y2 = yJs(Math.abs(d.JvalueShifted));
      const horizontalShiftX = smallSpace - blockWidth - 1.5; // make larger here !
      const horizontalShiftSideBlock = blockWidth; // make larger here !
      var usedHorizontalShiftX = eval(horizontalShiftX);
      var usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
      const cs1 = assignedCouplings.spreadPositionsZZ[d.indexColumn1];
      const cs2 = assignedCouplings.spreadPositionsZZ[d.indexColumn2];
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
      var Gen = d3.line();

      return Gen(combine);
    }

    var jgraphObj = {};

    var x = d3.scaleLinear();

    var highlightDot = function (d, wasDoubleClicked) {
      assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
        dataColumns,
        leftPosColumns,
        x,
        rightPosColumns,
        smallSpace,
      );
      var spreadPositionsNew = updateColumnsPositions(
        dataColumns,
        leftPosColumns,
        x,
        rightPosColumns,
        smallSpace,
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
          assignedCouplings.theLinesW = assignedCouplings.addAssignment(
            dataColumns,
            referenceSpin,
            partnerSpinObj,
            svg,
            lineWidth,
            darkMode,
            generalUseWidth,
            yJs,
            smallSpace,
            blockWidth,
            pathFun,
          );
          dataColumns[referenceSpin.dataColIndex1].listOfJs[
            referenceSpin.dataColIndex2
          ].isAssigned = true;
          dataColumns[partnerSpinObj.dataColIndex1].listOfJs[
            partnerSpinObj.dataColIndex2
          ].isAssigned = true;

          dataColumns[referenceSpin.dataColIndex1].listOfJs =
            updateBlockPosition(
              dataColumns[referenceSpin.dataColIndex1].listOfJs,
              minSpaceBetweekCircles,
              minSpaceBetweekBlocks,
            );
          dataColumns[partnerSpinObj.dataColIndex1].listOfJs =
            updateBlockPosition(
              dataColumns[partnerSpinObj.dataColIndex1].listOfJs,
              minSpaceBetweekCircles,
              minSpaceBetweekBlocks,
            );
          //  assignedCouplings.addGraphicForLast(svg, lineWidth, darkMode, generalUseWidth, yJs, smallSpace, blockWidth, pathFun);

          // UGLY FIX TO BE MOVED OUT
          for (
            var indexList1 = 0;
            indexList1 < dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (!dataColumns[indexList1].listOfJs[i1].isAssigned) {
                for (
                  var iloo = 0;
                  iloo < dataUnassignedCoupCircles.length;
                  iloo++
                ) {
                  if (
                    dataUnassignedCoupCircles[iloo].dataColIndex1 == indexList1
                  ) {
                    if (dataUnassignedCoupCircles[iloo].dataColIndex2 == i1) {
                      dataUnassignedCoupCircles[iloo].valueOnBar =
                        dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact;
                    }
                  }
                }
              }
            }
          }

          assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
            dataColumns,
            leftPosColumns,
            x,
            rightPosColumns,
            smallSpace,
          );

          updateColumnsAction(
            assignedCouplings.spreadPositionsZZ,
            1000,
            positionJscale,
            topJGraphYposition,
            jGraphParameters.colorShowLine,
            jGraphParameters.colorHideLine,
            generalUseWidth,
            x,
            widthOfThePlot,
            jgraphObj,
            blockWidth,
            yJs,
          );
          assignedCouplings.udateLineTrajectory(
            spaceBlock,
            2.0 * lineWidth * nbHzPerPoint,
            spaceCircle,
            dataColumns,
          );

          assignedCouplings.updateTheLines(
            yJs,
            smallSpace,
            blockWidth,
            pathFun,
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
          svg.selectAll('.circleS').remove();
          // This is redundant with other part
          var dataAssignedCoupBlocks = [];
          for (
            var indexList1 = 0;
            indexList1 < dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (dataColumns[indexList1].listOfJs[i1].isAssigned) {
                dataAssignedCoupBlocks.push({
                  chemShift: dataColumns[indexList1].chemShift,
                  value:
                    dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact,
                  trueValue: dataColumns[indexList1].listOfJs[i1].Jvalue,
                  MyIndex: indexList1,
                  uniqIndex: dataAssignedCoupBlocks.length,
                });
              }
            }
          }
          jgraphObj.theBlocks = svg
            .selectAll()
            .data(dataAssignedCoupBlocks)
            .enter()
            .append('rect')
            .attr('class', 'circleS')
            .attr('x', function (d) {
              return x(d.chemShift + blockWidth);
            })
            .attr('y', function (d) {
              return yJs(Math.abs(d.value)) - halfBlockHeight;
            })
            .attr('width', 2 * blockWidth)
            .attr('height', 2 * halfBlockHeight)
            .style('fill', function (d) {
              return getJgraphColor(Math.abs(d.trueValue), darkMode);
            })
            .attr('stroke', 'black')
            .style('stroke-width', lineWidthBlocks);
          updateColumnsAction(
            assignedCouplings.spreadPositionsZZ,
            0,
            positionJscale,
            topJGraphYposition,
            jGraphParameters.colorShowLine,
            jGraphParameters.colorHideLine,
            generalUseWidth,
            x,
            widthOfThePlot,
            jgraphObj,
            blockWidth,
            yJs,
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
        .delay(jGraphParameters.delayBeforeErase)
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
        .style('stroke-width', lineWidth)
        .transition()
        .duration(200)
        .delay(1.2 * jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', lineWidth);

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
        .style('stroke-width', lineWidth * 2.0);

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
        .style('stroke-width', lineWidth * 2.0);

      // starting dots
      d3.selectAll('.circleL')
        .transition()
        .duration(20)
        .delay(310)
        .filter(function (p) {
          return d.uniqIndex == p.uniqIndex;
        })
        .style('opacity', '1.0')
        .style('stroke-width', lineWidth * 2.0)
        .style('stroke', curColHighligh);

      // all will get back to normal
      d3.selectAll('.circleL')
        .transition()
        .duration(200)
        .delay(jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', lineWidth);

      d3.selectAll('.rulerClass')
        .transition()
        .duration(200)
        .delay(0)
        .attr('y1', yJs(Math.abs(d.value)))
        .attr('y2', yJs(Math.abs(d.value)))
        .style('opacity', '1.0')
        .style('stroke', highColor)
        .transition()
        .duration(200)
        .delay(jGraphParameters.delayBeforeErase)
        .attr('y1', yJs(Math.abs(d.value)))
        .attr('y2', yJs(Math.abs(d.value)))
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
        .delay(jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '0.0');

      var theTextDotNew = svg
        .append('text')
        //   .attr("class", "toBesgdfgfsgdHidden")
        .attr('x', spreadPositionsNew[d.MyIndex])
        // .attr("x",  x(d.chemShift))
        .attr('y', yJs(Math.abs(d.valueOnBar) + 3.0))
        //  .text( "J = " + d.value + "val " + (Math.abs(d.valueOnBar + 3.0)) + " pos:" + spreadPositionsNew[d.MyIndex])
        .text('J = ' + d.value)
        // .attr('dx', 1.3 * generalUseWidth)
        .style('font-size', generalUseWidth * 2.5)
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
           // .style("stroke-width", lineWidthBlocks)
           .text(function (d) { return "J = " + d.value; })
        //   .attr("dx", 1.3 * generalUseWidth)
           .style("font-size", generalUseWidth * 2.5)
           .style("font-family", "Helvetica")
           .attr("x", function (d) { return x(d.chemShift); })
          // .attr("x", function (d) { return spreadPositionsNew[d.MyIndex]; })
         //  .attr("transform", function (d) { return "rotate(-45," + spreadPositionsNew[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           .attr("opacity", 0.0);
        //   .transition().duration(100).delay(3000);
          // .remove();
       */
    };

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
    function visualizeSpectrum(chemShift) {
      // Add X axis
      x = d3
        .scaleLinear()
        .domain([
          d3.max(chemShift, function (d) {
            return +d.chemShift;
          }),
          d3.min(chemShift, function (d) {
            return +d.chemShift;
          }),
        ])
        .range([0, widthOfThePlot]);
    
     // Add Y axis
      var y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(chemShift, function (d) {
            return +d.value;
          }),
        ])
        .range([height, 0]);
      //yAxis = svg.append("g") .call(d3.axisLeft(y));


   // Add a clipPath: everything out of this area won't be drawn.
      var clip = svg
        .append('defs')
        .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', widthOfThePlot)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

      // Add brushing
      var brush = d3
        .brushX() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [widthOfThePlot, height],
        ]) // initialize the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on('end', function (event) {
          updateChart(event);
        });

      // Create the line variable: where both the line and the brush take place
      var lineSpectrum = svg.append('g').attr('clip-path', 'url(#clip)');

      // Add the spectrum
      lineSpectrum
        .append('path')
        .datum(chemShift)
        .attr('class', 'lineG') // add the class line to be able to modify this line later on.
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        // .attr("stroke", "red")
        .attr('stroke-width', lineWidth)
        .attr(
          'd',
          d3
            .line()
            .x(function (d) {
              return x(d.chemShift);
            })
            .y(function (d) {
              return y(d.value);
            }),
        );
  // Add the brushing
      lineSpectrum.append('g').attr('class', 'brush').call(brush);

      var xAxis = svg
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));
      // Add Y axis2


      // A function that set idleTimeOut to null
      var idleTimeout;
      function idled() {
        idleTimeout = null;
      }

      function updateChart(event) {
        // Access the selection from the event object

        var extent = event.selection;
        console.log('updateCharting updateChart with event ' + extent);

        if (!extent) {
          if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
          // No selection, reset the idleTimeout
          x.domain([
            d3.max(spectrumData, function (d) {
              return +d.chemShift;
            }),
            d3.min(spectrumData, function (d) {
              return +d.chemShift;
            }),
          ]);
          // Reset x domain
        } else {
          x.domain([x.invert(extent[0]), x.invert(extent[1])]);
          // Update x domain based on brush selection
          lineSpectrum.select('.brush').call(brush.move, null);
          // Clear the brush area
        }

        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x));

        // Recalculate and update the line path
        lineSpectrum
          .select('.lineG')
          .transition()
          .duration(1000)
          .attr(
            'd',
            d3
              .line()
              .x(function (d) {
                return x(d.chemShift);
              })
              .y(function (d) {
                return y(d.value);
              }),
          );

        assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
          dataColumns,
          leftPosColumns,
          x,
          rightPosColumns,
          smallSpace,
        );
        updateColumnsAction(
          assignedCouplings.spreadPositionsZZ,
          1000,
          positionJscale,
          topJGraphYposition,
          jGraphParameters.colorShowLine,
          jGraphParameters.colorHideLine,
          generalUseWidth,
          x,
          widthOfThePlot,
          jgraphObj,
          blockWidth,
          yJs,
        );
        assignedCouplings.updateTheLines(yJs, smallSpace, blockWidth, pathFun);
      }

  jgraphObj = {}; // demo code
      jgraphObj = {
        ...jgraphObj, // Copy all existing properties of jgraphObj
        y: y,
        lineSpectrum: lineSpectrum,
        brush: brush,
        xAxis: xAxis,
      };

return jgraphObj
    }

    function visualizeJgraph(chemShift) {
  
      var yAxisn2 = svg
        .append('g')
        .attr('transform', function (d) {
          return 'translate(' + widthOfThePlot + ')';
        })
        .call(d3.axisRight(yJs).ticks(3));

      var theTicksCouplings = svg
        .selectAll('tickLines')
        .data(jGraphParameters.dataTicksCouplings)
        .enter()
        .append('line')
        .attr('class', 'Grid')
        .attr('x1', lineWidth)
        .attr('y1', function (d) {
          return yJs(d);
        })
        .attr('x2', widthOfThePlot)
        .attr('y2', function (d) {
          return yJs(d);
        })
        .attr('stroke', '#EEEEEE')
        .style('stroke-width', lineWidth);
      var theGridLinesCouplings = svg
        .selectAll('theRuler')
        .data(jGraphParameters.dataTicksCouplings)
        .enter()
        .append('line')
        .attr('class', 'rulerClass')
        .attr('x1', lineWidth)
        .attr('y1', yJs(0.0))
        .attr('x2', widthOfThePlot)
        .attr('y2', yJs(0.0))
        .attr('stroke', 'red')
        .style('stroke-dasharray', [lineWidth * 2, lineWidth * 2])
        .style('stroke-width', lineWidth)
        .style('opacity', '0.0');
      /*
         var dimensions = [1, 1.2, 1.3, 2, 3, 5];
         var yn = {};
         for (i in dimensions) {
           var name = dimensions[i];
           yn[name] = d3.scaleLinear()
             .domain([0.0, 22.0]) // --> Same axis range for each group
             // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
             .range([height / 3.0, height / 6.0]);
         }
         */

    
      
      // Columns

      // oblique
      //    assignedCouplings.spreadPositionsZZ = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace);
      var spreadPositionsUU = updateColumnsPositions(
        dataColumns,
        leftPosColumns,
        x,
        rightPosColumns,
        smallSpace,
      );

      var theColumnsConnectColumnToSpectrumPosition = svg
        .selectAll('columnns')
        .data(dataColumns)
        .enter()
        .append('line')
        .attr('class', 'ColunnSegment1')
        .attr('x1', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('x2', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('y1', function (d) {
          return bottomJGraphYposition + positionJscale;
        })
        .attr('y2', function (d) {
          return pointingLineColum + positionJscale;
        })
        .attr('stroke', jGraphParameters.colorHideLine) // just sketched... update wil fix colors
        .style('stroke-width', lineWidthCircle)
        .on('click', highlightColumn)
        .on('mouseover', highlightColumn);
      // streight down
      var theColumnsVerticalInSpectrum = svg
        .selectAll('ColunnSegment2')
        .data(dataColumns)
        .enter()
        .append('line')
        .attr('class', 'Colunn')
        .attr('x1', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('x2', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('y1', function (d) {
          return pointingLineColum + positionJscale;
        })
        .attr('y2', function (d) {
          return height;
        })
        .attr('stroke', jGraphParameters.colorHideLine) // just sketched... update wil fix colors
        .style('stroke-width', lineWidthCircle)
        .on('click', highlightColumn)
        .on('mouseover', highlightColumn);
      var theColumnsMainVerticalLine = svg
        .selectAll('ColunnSegment3')
        .data(dataColumns)
        .enter()
        .append('line')
        .attr('class', 'Colunn')
        .attr('x1', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('x2', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('y1', function (d) {
          return topJGraphYposition + positionJscale;
        })
        .attr('y2', function (d) {
          return bottomJGraphYposition + positionJscale;
        })
        .attr('stroke', 'black') // just sketched... update wil fix colors
        .style('stroke-width', lineWidthColumn)
        .on('click', highlightColumn)
        .on('mouseover', highlightColumn);

      var theColumnsBase = svg
        .selectAll('ColunnSegment4')
        .data(dataColumns)
        .enter()
        .append('line')
        .attr('class', 'Colunn')
        .attr('x1', function (d) {
          return spreadPositionsUU[d.MyIndex] + generalUseWidth;
        })
        .attr('x2', function (d) {
          return spreadPositionsUU[d.MyIndex] - generalUseWidth;
        })
        .attr('y1', function (d) {
          return bottomJGraphYposition + positionJscale;
        })
        .attr('y2', function (d) {
          return bottomJGraphYposition + positionJscale;
        })
        .attr('stroke', 'black') // just sketched... update wil fix colors
        .style('stroke-width', lineWidthCircle)
        .on('click', highlightColumn)
        .on('mouseover', highlightColumn);

      var theColumnLabel = svg
        .selectAll('textc')
        .data(dataColumns)
        .enter()
        .append('text')
        .attr('class', function (d) {
          return 'textColumn' + d.uniqIndex;
        })
        .attr('x', function (d) {
          return spreadPositionsUU[d.MyIndex];
        })
        .attr('y', function (d) {
          return -3 + topJGraphYposition + positionJscale;
        })
        // .text(function (d) { return "" + d.chemShift; })
        .text(function (d) {
          return '' + d.labelColumn;
        })
        .attr('dx', -1.0 * generalUseWidth)
        .style('font-size', generalUseWidth * 2.5)
        .style('font-family', 'Helvetica')
        .on('click', highlightColumn)
        .on('mouseover', highlightColumn);
      //.style("font-weight", "2pt")
      // Lines

      assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
        dataColumns,
        leftPosColumns,
        x,
        rightPosColumns,
        smallSpace,
      );
      var spreadPositionsZZ = updateColumnsPositions(
        dataColumns,
        leftPosColumns,
        x,
        rightPosColumns,
        smallSpace,
      );

      assignedCouplings.theLinesW = assignedCouplings.makeGraphic(
        x,
        svg,
        lineWidth,
        darkMode,
        generalUseWidth,
        smallSpace,
        blockWidth,
        yJs,
        pathFun,
      );

      // Circles
      var theDots = svg
        .selectAll('dots')
        .data(dataUnassignedCoupCircles)
        .enter()
        .append('circle')
        .attr('class', 'circleL')
        .attr('cx', function (d) {
          return x(d.chemShift);
        })
        .attr('cy', function (d) {
          return yJs(Math.abs(d.valueOnBar));
        })
        .attr('r', circleRadius)
        .style('fill', function (d) {
          return getJgraphColor(Math.abs(d.value), darkMode);
        })
        .attr('stroke', 'black')
        .style('stroke-width', lineWidthCircle)
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
           .attr("y", function (d) { return yJs(Math.abs(d.valueOnBar + 3.0)); })
           // .style("fill", "gray")
           //   .attr("stroke", "red")
           // .style("stroke-width", lineWidthBlocks)
           .text(function (d) { return "J = " + d.value; })
        //   .attr("dx", 1.3 * generalUseWidth)
           .style("font-size", generalUseWidth * 2.5)
           .style("font-family", "Helvetica")
           .attr("x", function (d) { return MyIndex; })
          // .attr("x", function (d) { return spreadPositionsNew[d.MyIndex]; })
         //  .attr("transform", function (d) { return "rotate(-45," + spreadPositionsNew[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           .attr("opacity", 0.0);
        //   .transition().duration(100).delay(3000);
          // .remove();
         // Dots
          */

      var theBlocks = svg
        .selectAll()
        .data(dataAssignedCoupBlocks)
        .enter()
        .append('rect')
        .attr('class', 'circleS')
        .attr('x', function (d) {
          return x(d.chemShift + blockWidth);
        })
        .attr('y', function (d) {
          return yJs(Math.abs(d.value)) - halfBlockHeight;
        })
        .attr('width', 2 * blockWidth)
        .attr('height', 2 * halfBlockHeight)
        .style('fill', function (d) {
          return getJgraphColor(Math.abs(d.trueValue), darkMode);
        })
        .attr('stroke', 'black')
        .style('stroke-width', lineWidthBlocks);
      jgraphObj = {
        ...jgraphObj, // Copy all existing properties of jgraphObj
        yAxisn2: yAxisn2,
        theTicksCouplings: theTicksCouplings,
        theGridLinesCouplings: theGridLinesCouplings,
        theColumns: {
          theColumnsConnectColumnToSpectrumPosition:
            theColumnsConnectColumnToSpectrumPosition,
          theColumnsVerticalInSpectrum: theColumnsVerticalInSpectrum,
          theColumnsMainVerticalLine: theColumnsMainVerticalLine,
          theColumnsBase: theColumnsBase,
          theColumnLabel: theColumnLabel,
        },
        theLinesW: assignedCouplings.theLinesW,
        theDots: theDots,
        theBlocks: theBlocks,
      };

      updateColumnsAction(
        spreadPositionsZZ,
        0,
        positionJscale,
        topJGraphYposition,
        jGraphParameters.colorShowLine,
        jGraphParameters.colorHideLine,
        generalUseWidth,
        x,
        widthOfThePlot,
        jgraphObj,
        blockWidth,
        yJs,
      );

    


      // A function that update the chart for given boundaries


      // If user double click, reinitialize the chart
      if (false)
        svg.on('dblclick', function () {
          /*
        // Reset x domain to the full data range
        x.domain([
          d3.max(spectrumData, function (d) {
            return d.chemShift;
          }), // Ensure this matches the initial domain setup
          d3.min(spectrumData, function (d) {
            return d.chemShift;
          }),
        ]);
        // Update x-axis
        xAxis.transition().call(d3.axisBottom(x));
        // Recalculate and update the line path to reflect the full data range
        lineSpectrum
          .select('.lineG')
          .transition()
          .attr(
            'd',
            d3
              .line()
              .x(function (d) {
                return x(d.chemShift);
              }) // Use updated x scale for new x values
              .y(function (d) {
                return y(d.value);
              }), // Keep y the same
          );
*/
          // If using a brush, clear the current selection
          // This is optional and depends on whether you want to clear the brush upon resetting the zoom
          // lineSpectrum.select('.brush').call(brush.move, null);

          var originalDomain = [
            d3.min(spectrumData, function (d) {
              return +d.chemShift;
            }),
            d3.max(spectrumData, function (d) {
              return +d.chemShift;
            }),
          ];
          console.log('original ' + originalDomain);

          // Simulate an event with a selection that covers the full x scale range
          var simulatedEvent = {
            selection: [x(originalDomain[1]), x(originalDomain[0])],
          };
          var simulatedEvent2 = {
            selection: [4.0, 3.0],
          };
          // Call updateChart with the simulated event
          //updateChart(simulatedEvent2);
        });
    }
    jgraphObj = visualizeSpectrum(spectrumData);
    visualizeJgraph(spectrumData);
  }

  // Main call

  processDataAndVisualize(fileNameData, fileNameSpectrum);
}
