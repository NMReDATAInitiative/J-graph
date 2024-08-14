/*jshint esversion: 6 */

//import * as d3 from "d3"; //
import { NmrSpectrum } from './nmrSpectrum.js';
import { NmrAssignment } from './nmrAssignement.js';
import { getJgraphColor } from './getJgraphColor.js';
import { getJisOK } from './getJisOK.js';
import { updateColumnsPositions } from './updateColumnsPositions.js';
import { updateColumnsAction } from './updateColumnsAction.js';
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
    dfgdsfg
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
sdfgd
    var theColumns = {
      theColumnsConnectColumnToSpectrumPosition:
        theColumnsConnectColumnToSpectrumPosition,
      theColumnsVerticalInSpectrum: theColumnsVerticalInSpectrum,
      theColumnLabel,
      theColumnsMainVerticalBackLine: theColumnsMainVerticalBackLine,
    };

   /* this.jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      this.theColumns,
    };*/
  }

  function updateVisuDisabled() {
    var spreadPositionsZZ = updateColumnsPositions(
      jgraphObj.dataColumns,
      jgraphObj.leftPosColumns,
      jgraphObj.x,
      jgraphObj.rightPosColumns,
      jgraphObj.smallSpace,
    );
fsd
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
      // spectrum.build();

    //  jgraphObj = spectrum.jgraphObj;

      //jgraphObj = { ...jgraphObj, ...spectrum.jgraphObj,}

      const jGraphData = await readDataFile(fileNameData);
     // prepareVisualisationJgraph(jGraphData);
 var nmrAssignment = new NmrAssignment(jGraphData, svg, jgraphObj, settings);
      


  // Register each class as a receiver for every other class based on data type compatibility
  const classes = [spectrum, nmrAssignment];
  classes.forEach((sender) => {
    classes.forEach((receiver) => {
      if (sender !== receiver) {
        sender.getExportTypes().forEach((sendType) => {
          if (receiver.getImportTypes().includes(sendType)) {
            sender.registerReceiver(receiver, sendType);
          }
        });
      }
    });
  });



spectrum.triggerSendAxis();

nmrAssignment.build()
nmrAssignment.visualizeJgraph()
nmrAssignment.updateVisu();


      console.log('========================================');
      console.log('========================================');
    //  console.log('jgraphObj', nmrAssignment.getTheColumns());
      console.log('========================================');
      console.log('========================================');
    /*  var theColumns = nmrAssignment.getTheColumns();
      jgraphObj = {
        ...jgraphObj, // Copy all existing properties of jgraphObj
        theColumns,
      };

      nmrAssignment.updateJgraphObj(jgraphObj);
      console.log('jgraphObj', jgraphObj.theColumn);
      console.log('================OOOOOO================');
*/
     //jgraphObj = visualizeJgraph();
////nmrAssignment.visualizeJgraph()

//nmrAssignment.updateVisu();


//spectrum.storeJgraphObj(jgraphObj);
//spectrum.storeNmrAssignment(nmrAssignment);
    //  updateVisuDisabled();
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
