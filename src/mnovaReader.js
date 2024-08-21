/*jshint esversion: 6 */

import { processMnovaJsonFileSpectrum } from './mnovaJsonReader.js';
import { processMnovaJsonFileMolecule } from './mnovaJsonReader.js';
import { extractSpectrumData } from './mnovaJsonReader.js';
import { ingestMoleculeObjecSuper } from './mnovaJsonReader.js';

import { NmrSpectrum } from './nmrSpectrum.js';
import { NmrAssignment } from './nmrAssignement.js';
import { getRegionsWithSignal } from './utils.js'; // Adjust the path as necessary

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

      const allObjectsExtracted = await processMnovaJsonFileSpectrum(
        fileNameSpectrum,
        'spectra',
        ['data', 'raw_data', 'multiplets'],
        //['$mnova_schema', 'data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters'],
      );
      console.log('allObjectsExtracted', allObjectsExtracted);

      const allObjectsExtractedMolecule = await processMnovaJsonFileMolecule(
        fileNameData,
        'molecule',
        ['assignments', 'atoms', '$mnova_schema'],
        /*[
          '$mnova_schema',
          'assignments',
          'predictions',
          'parameters',
          'bonds',
          'atoms',
        ],*/
      );
      console.log(
        'moleculeT allObjectsExtractedMolecule',
        allObjectsExtractedMolecule,
      );

      // spectra
      const spectrumData = extractSpectrumData(allObjectsExtracted[0], 'data');
      const spectrumData2 = extractSpectrumData(allObjectsExtracted[1], 'data');
      const spectrumDataAll = [
        spectrumData,
        spectrumData2,
        [
          { chemShift: 2.005, value: 10000 },
          { chemShift: 2.0, value: 3000000 },
          { chemShift: 1.995, value: 10000 },
        ],
      ];

      const jGraphObj = ingestMoleculeObjecSuper(allObjectsExtractedMolecule);

      const marginPPM = 0.02;
      const minSpaceBetweenRegions = 0.05;
      const regionsData = getRegionsWithSignal(
        spectrumData,
        minSpaceBetweenRegions,
        marginPPM,
      );

      var spectrum = new NmrSpectrum(
        spectrumDataAll,
        svg,
        settings,
        smallScreen, // default true
        //{totalCoveredPPM: 7.0,regions: [{ start: 8.0, end: 1.0 }]},
        regionsData, // default {}
      );

      const settings_with_spectrum_settings = spectrum.getSettings();

      var nmrAssignment = new NmrAssignment(
        jGraphObj,
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
