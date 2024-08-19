/*jshint esversion: 6 */

//import * as d3 from "d3"; //
import { NmrSpectrum } from './nmrSpectrum.js';
import { NmrAssignment } from './nmrAssignement.js';

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

  function initializeSettings(smallScreen, overrideSettings = {}) {
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
        smallScreen: smallScreen,
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

    return settings;
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

    // Create an Object
    const obj = {
      totalCoveredPPM: totalCoveredPPM,
      regions: newRegions,
    };

    return obj;
  }
  async function processDataAndVisualize(fileNameSpectrum, fileNameData) {
    try {
      const smallScreen =
        /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      // Example usage with overriding default values
      const settings = initializeSettings(smallScreen, {});

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
       //           .style('border', '1px solid black') // Add a black border around the SVG
 // .style('background-color', 'lightblue') // Set the background color
        .append('g')
        .attr(
          'transform',
          'translate(' +
            settings.spectrum.margin.left +
            ',' +
            settings.spectrum.margin.top +
            ')',
        );


      const spectrumData = await loadSpectrum(fileNameSpectrum);

      const marginPPM = 0.02;
      const minSpaceBetweenRegions = 0.05;
      const regionsData = getRegionsWithSignal(
        spectrumData,
        minSpaceBetweenRegions,
        marginPPM,
      );

      var spectrum = new NmrSpectrum(
        spectrumData,
        svg,
        settings,
        smallScreen, // default true
        regionsData, // default {}
      );

      const settings_with_spectrum_settings = spectrum.getSettings();

      const jGraphData = await readDataFile(fileNameData);

      var nmrAssignment = new NmrAssignment(
        jGraphData,
        svg,
        smallScreen,
        settings_with_spectrum_settings,
      );

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

      nmrAssignment.build();
    } catch (error) {
      console.error('Error processing or visualizing the data ', error);
    }
  }

  // Main call
  processDataAndVisualize(fileNameSpectrum, fileNameData);
}
