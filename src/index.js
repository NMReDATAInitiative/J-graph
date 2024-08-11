/*jshint esversion: 6 */

//import * as d3 from "d3"; //
import { NmrSpectrum } from './nmrSpectrum.js';
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
  jGraph(fileNameSpectrum, fileNameData);
}
export function jGraph(fileNameSpectrum, fileNameData) {
  //
  // set the dimensions and margins of the graph
  //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

  function initializeSettings(overrideSettings = {}) {
    const smallScreen =
      /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Default settings
    let defaultSettings = {
      spectrum: {
        margin: smallScreen
          ? { top: 50, right: 10, bottom: 30, left: 10 }
          : { top: 10, right: 30, bottom: 30, left: 60 },
        bodyWidth: 800,
        bodyHeight: smallScreen ? 1000 : 450,
        lineWidth: smallScreen ? 5 : 1.5,
        darkMode: false,
      },
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

    // Calculate derived values
    settings.spectrum.widthOfThePlot =
      settings.spectrum.bodyWidth -
      settings.spectrum.margin.left -
      settings.spectrum.margin.right;
    settings.spectrum.height =
      settings.spectrum.bodyHeight -
      settings.spectrum.margin.top -
      settings.spectrum.margin.bottom;

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

  function pathFun(d) {
    /*
          The four points for assignment lines  
           | __ |
           |/  \|
           O    O
           |    |
          */

    const y1a = jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap1));
    const y1b = jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap2));
    // const y2 = yJs(Math.abs(d.JvalueShifted));
    //const iiidex = d.iindex;
    //   console.log("iiidex = " + JSON.stringify(d.iindex));
    //     console.log("assignedCouplings.content[d.iindex].JvalueShifted = " + JSON.stringify(assignedCouplings.content[d.iindex].JvalueShifted));
    // HERE
    //const alterative = dataColumns[0].JvalueAntiOverlap1;//
    //console.log("test same... = " + JSON.stringify(alterative) + " "  +  JSON.stringify(Math.abs(assignedCouplings.content[d.iindex].JvalueShifted)) );
    const y2 = jgraphObj.yJs(Math.abs(d.JvalueShifted));
    //const y2 = yJs(Math.abs(d.JvalueShifted));
    const horizontalShiftX =
      jgraphObj.smallSpace - settings.jGraph.blockWidth - 1.5; // make larger here !
    const horizontalShiftSideBlock = settings.jGraph.blockWidth; // make larger here !
    var usedHorizontalShiftX = eval(horizontalShiftX);
    var usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
    const cs1 = jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn1];
    const cs2 = jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn2];
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
      console.log('Loaded data from ' + fileNameData);
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

  function idled3() {
    idleTimeout = null;

    // Reset the X domain to the original domain
    jgraphObj.x
      .domain(jgraphObj.originalXDomain)
      .range(jgraphObj.originalXrange);

    // Restore the original tick values
    jgraphObj.xAxis
      .transition()
      .duration(1000)
      .call(
        d3.axisBottom(jgraphObj.x).tickValues(jgraphObj.originalTickValues),
      );

    // Restore the line path
    jgraphObj.lineSpectrum
      .select('.lineG')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return jgraphObj.x(d.chemShift);
          })
          .y(function (d) {
            return jgraphObj.y(d.value);
          }),
      );
  }

  function getRegionsWithSignal(chemShifts, minSpacePPM, marginPPM) {
    const maxY = d3.max(chemShifts, function (d) {
      return +d.value;
    });
    const minScale = d3.min(chemShifts, function (d) {
      return +d.chemShift;
    });
    const maxScale = d3.max(chemShifts, function (d) {
      return +d.chemShift;
    });

    // Determine the maximum value in the dataset

    // Step 1: Identify regions where y > 1% of maxY and merge close fragments
    var regions = [];
    var currentRegion = null;
    var lastIn = null;
    chemShifts.forEach(function (d, i) {
      if (d.value > 0.01 * maxY) {
        if (!currentRegion) {
          // Start a new region
          currentRegion = { start: d.chemShift, end: d.chemShift };
        } else {
          // Continue the current region
          currentRegion.end = d.chemShift;
        }
        lastIn = d.chemShift;
      } else if (currentRegion) {
        // Close the current region if a gap is detected
        if (lastIn && Math.abs(d.chemShift - lastIn) < minSpacePPM) {
          // Fuse with the next fragment if the gap is smaller than 0.1
          currentRegion.end = d.chemShift;
        } else {
          // Finalize the current region and add margins
          currentRegion.start += marginPPM;
          if (currentRegion.start < minScale) currentRegion.start = minScale;
          currentRegion.end -= marginPPM;
          if (currentRegion.end > maxScale) currentRegion.end = maxScale;
          regions.push(currentRegion);
          currentRegion = null;
          lastIn = null;
        }
      }
    });

    // If there's an unfinished region, add it
    if (currentRegion) {
      currentRegion.start += marginPPM;
      if (currentRegion.start < minScale) currentRegion.start = minScale;
      currentRegion.end -= marginPPM;
      if (currentRegion.end > maxScale) currentRegion.end = maxScale;
      regions.push(currentRegion);
    }

    let newRegions = [];
    let curRegion;
    regions.forEach(function (d, i) {
      if (i != 0) {
        if (curRegion.end < d.start) {
          // fuse
          curRegion.end = d.end;

          if (i + 1 == regions.length) {
            newRegions.push(curRegion);
          }
        } else {
          newRegions.push(curRegion);
          curRegion = d;
          if (i + 1 == regions.length) {
            newRegions.push(curRegion);
          }
        }
      } else {
        curRegion = d;
      }
    });

    var totalCoveredPPM = 0.0;
    newRegions.forEach(function (currentRegion, i) {
      totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
    });

    console.log('sellu  newRegions', newRegions);

    // Create an Object
    const obj = {
      totalCoveredPPM: totalCoveredPPM,
      regions: newRegions,
    };

    return obj;
  }

  function prepareVisualisationJgraph(jGraphData) {
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

    jgraphObj.highlightColumn = function (event, d) {
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
  }

  function visualizeAssignment() {
    jgraphObj.spreadPositionsUU = updateColumnsPositions(
      jgraphObj.dataColumns,
      jgraphObj.leftPosColumns,
      jgraphObj.x,
      jgraphObj.rightPosColumns,
      jgraphObj.smallSpace,
    );

    var theColumnsConnectColumnToSpectrumPosition = svg
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
    var theColumnsVerticalInSpectrum = svg
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

    var theColumnsMainVerticalBackLine = svg
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

    var theColumnLabel = svg
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
    jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      theColumns: {
        theColumnsConnectColumnToSpectrumPosition:
          theColumnsConnectColumnToSpectrumPosition,
        theColumnsVerticalInSpectrum: theColumnsVerticalInSpectrum,
        theColumnLabel: theColumnLabel,
        theColumnsMainVerticalBackLine: theColumnsMainVerticalBackLine,
      },
    };
  }

  function visualizeJgraph() {
    var yAxisn = svg.append('g').call(d3.axisLeft(jgraphObj.yJs).ticks(3));

    var yAxisn2 = svg
      .append('g')
      .attr('transform', function (d) {
        return 'translate(' + settings.spectrum.widthOfThePlot + ')';
      })
      .call(d3.axisRight(jgraphObj.yJs).ticks(3));

    var theTicksCouplings = svg
      .selectAll('tickLines')
      .data(settings.jGraph.jGraphParameters.dataTicksCouplings)
      .enter()
      .append('line')
      .attr('class', 'Grid')
      .attr('x1', settings.spectrum.lineWidth)
      .attr('y1', function (d) {
        return jgraphObj.yJs(d);
      })
      .attr('x2', settings.spectrum.widthOfThePlot)
      .attr('y2', function (d) {
        return jgraphObj.yJs(d);
      })
      .attr('stroke', '#EEEEEE')
      .style('stroke-width', settings.spectrum.lineWidth);
    var theGridLinesCouplings = svg
      .selectAll('theRuler')
      .data(settings.jGraph.jGraphParameters.dataTicksCouplings)
      .enter()
      .append('line')
      .attr('class', 'rulerClass')
      .attr('x1', settings.spectrum.lineWidth)
      .attr('y1', jgraphObj.yJs(0.0))
      .attr('x2', settings.spectrum.widthOfThePlot)
      .attr('y2', jgraphObj.yJs(0.0))
      .attr('stroke', 'red')
      .style('stroke-dasharray', [
        settings.spectrum.lineWidth * 2,
        settings.spectrum.lineWidth * 2,
      ])
      .style('stroke-width', settings.spectrum.lineWidth)
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
    jgraphObj.spreadPositionsUU = updateColumnsPositions(
      jgraphObj.dataColumns,
      jgraphObj.leftPosColumns,
      jgraphObj.x,
      jgraphObj.rightPosColumns,
      jgraphObj.smallSpace,
    );

    var theColumnsMainVerticalLine = svg
      .selectAll('ColunnSegment3')
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
      .attr('stroke', 'black') // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthColumn)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    var theColumnsBase = svg
      .selectAll('ColunnSegment4')
      .data(jgraphObj.dataColumns)
      .enter()
      .append('line')
      .attr('class', 'Colunn')
      .attr('x1', function (d) {
        return (
          jgraphObj.spreadPositionsUU[d.MyIndex] +
          settings.jGraph.generalUseWidth
        );
      })
      .attr('x2', function (d) {
        return (
          jgraphObj.spreadPositionsUU[d.MyIndex] -
          settings.jGraph.generalUseWidth
        );
      })
      .attr('y1', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('y2', function (d) {
        return (
          settings.jGraph.bottomJGraphYposition + settings.jGraph.positionJscale
        );
      })
      .attr('stroke', 'black') // just sketched... update wil fix colors
      .style('stroke-width', settings.jGraph.lineWidthCircle)
      .on('click', jgraphObj.highlightColumn)
      .on('mouseover', jgraphObj.highlightColumn);

    jgraphObj.assignedCouplings.spreadPositionsZZ = updateColumnsPositions(
      jgraphObj.dataColumns,
      jgraphObj.leftPosColumns,
      jgraphObj.x,
      jgraphObj.rightPosColumns,
      jgraphObj.smallSpace,
    );

    if ('assignedCouplings' in jgraphObj) {
      jgraphObj.assignedCouplings.theLinesW =
        jgraphObj.assignedCouplings.makeGraphic(
          jgraphObj.x,
          svg,
          settings.spectrum.lineWidth,
          settings.jGraph.darkMode,
          settings.jGraph.generalUseWidth,
          jgraphObj.smallSpace,
          settings.jGraph.blockWidth,
          jgraphObj.yJs,
          pathFun,
        );
    }

    var highlightDot = function (d, wasDoubleClicked) {
      if ('assignedCouplings' in jgraphObj) {
        if ('spreadPositionsZZ' in jgraphObj.assignedCouplings) {
          jgraphObj.assignedCouplings.spreadPositionsZZ =
            updateColumnsPositions(
              jgraphObj.dataColumns,
              jgraphObj.leftPosColumns,
              jgraphObj.x,
              jgraphObj.rightPosColumns,
              jgraphObj.smallSpace,
            );
        }
      }

      var spreadPositionsNew = updateColumnsPositions(
        jgraphObj.dataColumns,
        jgraphObj.leftPosColumns,
        jgraphObj.x,
        jgraphObj.rightPosColumns,
        jgraphObj.smallSpace,
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
          jgraphObj.assignedCouplings.theLinesW =
            jgraphObj.assignedCouplings.addAssignment(
              jgraphObj.dataColumns,
              referenceSpin,
              partnerSpinObj,
              svg,
              settings.spectrum.lineWidth,
              settings.jGraph.darkMode,
              settings.jGraph.generalUseWidth,
              jgraphObj.yJs,
              jgraphObj.smallSpace,
              settings.jGraph.blockWidth,
              pathFun,
            );
          jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs[
            referenceSpin.dataColIndex2
          ].isAssigned = true;
          jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs[
            partnerSpinObj.dataColIndex2
          ].isAssigned = true;

          jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs =
            updateBlockPosition(
              jgraphObj.dataColumns[referenceSpin.dataColIndex1].listOfJs,
              settings.jGraph.minSpaceBetweekCircles,
              settings.jGraph.minSpaceBetweekBlocks,
            );
          jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs =
            updateBlockPosition(
              jgraphObj.dataColumns[partnerSpinObj.dataColIndex1].listOfJs,
              settings.jGraph.minSpaceBetweekCircles,
              settings.jGraph.minSpaceBetweekBlocks,
            );
          //  assignedCouplings.addGraphicForLast(svg, lineWidth, settings.jGraph.darkMode, settings.jGraph.generalUseWidth, yJs, jgraphObj.smallSpace, settings.jGraph.blockWidth, pathFun);

          // UGLY FIX TO BE MOVED OUT
          for (
            var indexList1 = 0;
            indexList1 < jgraphObj.dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < jgraphObj.dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (!jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned) {
                for (
                  var iloo = 0;
                  iloo < jgraphObj.dataUnassignedCoupCircles.length;
                  iloo++
                ) {
                  if (
                    jgraphObj.dataUnassignedCoupCircles[iloo].dataColIndex1 ==
                    indexList1
                  ) {
                    if (
                      jgraphObj.dataUnassignedCoupCircles[iloo].dataColIndex2 ==
                      i1
                    ) {
                      jgraphObj.dataUnassignedCoupCircles[iloo].valueOnBar =
                        jgraphObj.dataColumns[indexList1].listOfJs[
                          i1
                        ].JlevelAvoidContact;
                    }
                  }
                }
              }
            }
          }

          jgraphObj.assignedCouplings.spreadPositionsZZ =
            updateColumnsPositions(
              jgraphObj.dataColumns,
              jgraphObj.leftPosColumns,
              jgraphObj.x,
              jgraphObj.rightPosColumns,
              jgraphObj.smallSpace,
            );

          updateColumnsAction(
            jgraphObj.assignedCouplings.spreadPositionsZZ,
            1000,
            settings.jGraph.positionJscale,
            settings.jGraph.topJGraphYposition,
            settings.jGraph.jGraphParameters.colorShowLine,
            settings.jGraph.jGraphParameters.colorHideLine,
            settings.jGraph.generalUseWidth,
            jgraphObj.x,
            settings.spectrum.widthOfThePlot,
            jgraphObj,
            settings.jGraph.blockWidth,
            jgraphObj.yJs,
          );
          jgraphObj.assignedCouplings.udateLineTrajectory(
            settings.jGraph.spaceBlock,
            2.0 * settings.spectrum.lineWidth * settings.jGraph.nbHzPerPoint,
            settings.jGraph.spaceCircle,
            jgraphObj.dataColumns,
          );

          jgraphObj.assignedCouplings.updateTheLines(
            jgraphObj.yJs,
            jgraphObj.smallSpace,
            settings.jGraph.blockWidth,
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
          jgraphObj.dataAssignedCoupBlocks = [];
          for (
            var indexList1 = 0;
            indexList1 < jgraphObj.dataColumns.length;
            indexList1++
          ) {
            for (
              var i1 = 0;
              i1 < jgraphObj.dataColumns[indexList1].listOfJs.length;
              i1++
            ) {
              if (jgraphObj.dataColumns[indexList1].listOfJs[i1].isAssigned) {
                jgraphObj.dataAssignedCoupBlocks.push({
                  chemShift: jgraphObj.dataColumns[indexList1].chemShift,
                  value:
                    jgraphObj.dataColumns[indexList1].listOfJs[i1]
                      .JlevelAvoidContact,
                  trueValue:
                    jgraphObj.dataColumns[indexList1].listOfJs[i1].Jvalue,
                  MyIndex: indexList1,
                  uniqIndex: jgraphObj.dataAssignedCoupBlocks.length,
                });
              }
            }
          }
          jgraphObj.theBlocks = svg
            .selectAll()
            .data(jgraphObj.dataAssignedCoupBlocks)
            .enter()
            .append('rect')
            .attr('class', 'circleS')
            .attr('x', function (d) {
              return jgraphObj.x(d.chemShift + settings.jGraph.blockWidth);
            })
            .attr('y', function (d) {
              return (
                jgraphObj.yJs(Math.abs(d.value)) -
                settings.jGraph.halfBlockHeight
              );
            })
            .attr('width', 2 * settings.jGraph.blockWidth)
            .attr('height', 2 * settings.jGraph.halfBlockHeight)
            .style('fill', function (d) {
              return getJgraphColor(
                Math.abs(d.trueValue),
                settings.jGraph.darkMode,
              );
            })
            .attr('stroke', 'black')
            .style('stroke-width', settings.jGraph.lineWidthBlocks);
          updateColumnsAction(
            jgraphObj.assignedCouplings.spreadPositionsZZ,
            0,
            settings.jGraph.positionJscale,
            settings.jGraph.topJGraphYposition,
            settings.jGraph.jGraphParameters.colorShowLine,
            settings.jGraph.jGraphParameters.colorHideLine,
            settings.jGraph.generalUseWidth,
            jgraphObj.x,
            settings.spectrum.widthOfThePlot,
            jgraphObj,
            settings.jGraph.blockWidth,
            jgraphObj.yJs,
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
        .delay(settings.jGraph.jGraphParameters.delayBeforeErase)
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
        .style('stroke-width', settings.spectrum.lineWidth)
        .transition()
        .duration(200)
        .delay(1.2 * settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', settings.spectrum.lineWidth);

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
        .style('stroke-width', settings.spectrum.lineWidth * 2.0);

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
        .style('stroke-width', settings.spectrum.lineWidth * 2.0);

      // starting dots
      d3.selectAll('.circleL')
        .transition()
        .duration(20)
        .delay(310)
        .filter(function (p) {
          return d.uniqIndex == p.uniqIndex;
        })
        .style('opacity', '1.0')
        .style('stroke-width', settings.spectrum.lineWidth * 2.0)
        .style('stroke', curColHighligh);

      // all will get back to normal
      d3.selectAll('.circleL')
        .transition()
        .duration(200)
        .delay(settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '1.0')
        .style('stroke-width', settings.spectrum.lineWidth);

      d3.selectAll('.rulerClass')
        .transition()
        .duration(200)
        .delay(0)
        .attr('y1', jgraphObj.yJs(Math.abs(d.value)))
        .attr('y2', jgraphObj.yJs(Math.abs(d.value)))
        .style('opacity', '1.0')
        .style('stroke', highColor)
        .transition()
        .duration(200)
        .delay(settings.jGraph.jGraphParameters.delayBeforeErase)
        .attr('y1', jgraphObj.yJs(Math.abs(d.value)))
        .attr('y2', jgraphObj.yJs(Math.abs(d.value)))
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
        .delay(settings.jGraph.jGraphParameters.delayBeforeErase)
        .style('stroke', 'black')
        .style('opacity', '0.0');

      var theTextDotNew = svg
        .append('text')
        //   .attr("class", "toBesgdfgfsgdHidden")
        .attr('x', spreadPositionsNew[d.MyIndex])
        // .attr("x",  x(d.chemShift))
        .attr('y', jgraphObj.yJs(Math.abs(d.valueOnBar) + 3.0))
        //  .text( "J = " + d.value + "val " + (Math.abs(d.valueOnBar + 3.0)) + " pos:" + spreadPositionsNew[d.MyIndex])
        .text('J = ' + d.value)
        // .attr('dx', 1.3 * settings.jGraph.generalUseWidth)
        .style('font-size', settings.jGraph.generalUseWidth * 2.5)
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
    var theDots = svg
      .selectAll('dots')
      .data(jgraphObj.dataUnassignedCoupCircles)
      .enter()
      .append('circle')
      .attr('class', 'circleL')
      .attr('cx', function (d) {
        return jgraphObj.x(d.chemShift);
      })
      .attr('cy', function (d) {
        return jgraphObj.yJs(Math.abs(d.valueOnBar));
      })
      .attr('r', settings.jGraph.circleRadius)
      .style('fill', function (d) {
        return getJgraphColor(Math.abs(d.value), settings.jGraph.darkMode);
      })
      .attr('stroke', 'black')
      .style('stroke-width', settings.jGraph.lineWidthCircle)
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

    var theBlocks = svg
      .selectAll()
      .data(jgraphObj.dataAssignedCoupBlocks)
      .enter()
      .append('rect')
      .attr('class', 'circleS')
      .attr('x', function (d) {
        return x(d.chemShift + settings.jGraph.blockWidth);
      })
      .attr('y', function (d) {
        return (
          jgraphObj.yJs(Math.abs(d.value)) - settings.jGraph.halfBlockHeight
        );
      })
      .attr('width', 2 * settings.jGraph.blockWidth)
      .attr('height', 2 * settings.jGraph.halfBlockHeight)
      .style('fill', function (d) {
        return getJgraphColor(Math.abs(d.trueValue), settings.jGraph.darkMode);
      })
      .attr('stroke', 'black')
      .style('stroke-width', settings.jGraph.lineWidthBlocks);
    jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      yAxisn: yAxisn,
      yAxisn2: yAxisn2,
      theTicksCouplings: theTicksCouplings,
      theGridLinesCouplings: theGridLinesCouplings,
      theColumnsMainVerticalLine: theColumnsMainVerticalLine,
      theColumnsBase: theColumnsBase,
      theDots: theDots,
      theBlocks: theBlocks,
    };
  }
  function updateVisu() {
    var spreadPositionsZZ = updateColumnsPositions(
      jgraphObj.dataColumns,
      jgraphObj.leftPosColumns,
      jgraphObj.x,
      jgraphObj.rightPosColumns,
      jgraphObj.smallSpace,
    );
    updateColumnsAction(
      spreadPositionsZZ,
      0,
      settings.jGraph.positionJscale,
      settings.jGraph.topJGraphYposition,
      settings.jGraph.jGraphParameters.colorShowLine,
      settings.jGraph.jGraphParameters.colorHideLine,
      settings.jGraph.generalUseWidth,
      jgraphObj.x,
      settings.spectrum.widthOfThePlot,
      jgraphObj,
      settings.jGraph.blockWidth,
      jgraphObj.yJs,
    );
    // A function that update the chart for given boundaries

    // If user double click, reinitialize the chart
  }
  async function processDataAndVisualize(fileNameSpectrum, fileNameData) {
    try {
      const spectrumData = await loadSpectrum(fileNameSpectrum);
      //visualizeSpectrum(spectrumData);

      const marginPPM = 0.02;
      const minSpaceBetweenRegions = 0.05;
      const regionsData = getRegionsWithSignal(
        spectrumData,
        minSpaceBetweenRegions,
        marginPPM,
      );

      var spectrum = new NmrSpectrum(
        spectrumData,
        regionsData,
        settings.spectrum,
        settings.jGraph,
        svg,
        jgraphObj,
      );
      spectrum.build();
      jgraphObj = spectrum.jgraphObj;
      const jGraphData = await readDataFile(fileNameData);
      prepareVisualisationJgraph(jGraphData);
      visualizeAssignment();
      visualizeJgraph();
      updateVisu();
    } catch (error) {
      console.error('Error processing or visualizing the data ', error);
    }
  }
  // Main call

  // Example usage with overriding default values
  const settings = initializeSettings({});

  // append the svg object to the body of the page
  var svg = d3
    .select('#my_dataviz')
    .append('svg')
    .attr(
      'width',
      settings.spectrum.widthOfThePlot +
        settings.spectrum.margin.left +
        settings.spectrum.margin.right,
    )
    .attr(
      'height',
      settings.spectrum.height +
        settings.spectrum.margin.top +
        settings.spectrum.margin.bottom,
    )
    .append('g')
    .attr(
      'transform',
      'translate(' +
        settings.spectrum.margin.left +
        ',' +
        settings.spectrum.margin.top +
        ')',
    );
  var jgraphObj = {};
  jgraphObj.smallSpace = 1;

  // A function that set idleTimeOut to null

  processDataAndVisualize(fileNameSpectrum, fileNameData);
}
