/*jshint esversion: 6 */

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

  async function processMnovaJsonFile(
    jsonFilePath,
    type,
    fieldsToKeep,
    callback,
  ) {
    try {
      // Load the JSON data using D3
      const jsonData = await d3.json(jsonFilePath);

      // Array to store the filtered spectra
      let filteredSpectraArray = [];

      // Check if the JSON has a 'spectra' field
      if (jsonData[type] && Array.isArray(jsonData[type])) {
        jsonData[type].forEach((spectrum, index) => {
          // Create an object to store the filtered data
          let filteredSpectrum = {};

          fieldsToKeep.forEach((field) => {
            // Check for the field in the spectrum object
            if (spectrum[field]) {
              filteredSpectrum[field] = spectrum[field];
              console.log(
                `SpectrumT Found ${field} at spectrum level in spectra[${index}]`,
              );
            }
            // Check for the field in the spectrum.data object
            else if (spectrum.data && spectrum.data[field]) {
              filteredSpectrum[field] = spectrum.data[field];
              console.log(`SpectrumT Found ${field} in spectra[${index}].data`);
            }
            // Handle case where the field is an array of objects
            else if (Array.isArray(spectrum.data[field])) {
              filteredSpectrum[field] = spectrum.data[field].map((item) => {
                return item; // Customize this if you need to filter fields within the objects
              });
              console.log(
                `SpectrumT Found ${field} as an array in spectra[${index}].data`,
              );
            }
            // Handle nested objects within spectrum.data
            else if (
              typeof spectrum.data[field] === 'object' &&
              spectrum.data[field] !== null
            ) {
              filteredSpectrum[field] = { ...spectrum.data[field] };
              console.log(
                `SpectrumT Found ${field} as an object in spectra[${index}].data`,
              );
            }
            // Log if the field is not found at any expected location
            else {
              console.log(
                `SpectrumT Did not find ${field} in spectra[${index}]`,
              );
            }
          });

          // Store the filtered spectrum in the array
          filteredSpectraArray.push(filteredSpectrum);

          // Log the filtered spectrum object
          console.log(`SpectrumT ${index + 1}:`, filteredSpectrum);
        });
      } else {
        console.log('No spectra found in the JSON data.');
      }

      // Return the filtered spectra array via the callback
      return filteredSpectraArray;
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  }
  async function processMnovaJsonFileMolecule(
    jsonFilePath,
    type,
    fieldsToKeep,
    callback,
  ) {
    try {
      // Load the JSON data using D3
      const jsonData = await d3.json(jsonFilePath);

      // Array to store the filtered spectra
      var filteredMolecule = {};
      // Check if the JSON has a 'spectra' field
      if (jsonData[type]) {
        const molecule = jsonData[type];
        // Create an object to store the filtered data

        fieldsToKeep.forEach((field) => {
          // Check for the field in the spectrum object
          if (molecule[field]) {
            filteredMolecule[field] = molecule[field];
            console.log(
              `moleculeT Found ${field} at spectrum level in molecule`,
            );
          }
          // Check for the field in the spectrum.data object
          else if (molecule.data && molecule.data[field]) {
            filteredMolecule[field] = molecule.data[field];
            console.log(`moleculeT Found ${field} in molecule`);
          }
          // Handle case where the field is an array of objects
          else if (Array.isArray(molecule.data[field])) {
            filteredMolecule[field] = molecule.data[field].map((item) => {
              return item; // Customize this if you need to filter fields within the objects
            });
            console.log(`moleculeT Found ${field} as an array in molecule`);
          }
          // Handle nested objects within spectrum.data
          else if (
            typeof molecule.data[field] === 'object' &&
            molecule.data[field] !== null
          ) {
            filteredMolecule[field] = { ...molecule.data[field] };
            console.log(`moleculeT Found ${field} as an object in molecule`);
          }
          // Log if the field is not found at any expected location
          else {
            console.log(`moleculeT Did not find ${field} in molecule`);
          }
        });

        // Store the filtered spectrum in the array

        // Log the filtered spectrum object
        console.log(`moleculeT :`, filteredMolecule);
      }

      // Return the filtered spectra array via the callback
      return filteredMolecule;
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  }

  function extractSpectrumData(spectrumObject, type = 'spectrum') {
    let result = [];

    if (spectrumObject.type === type) {
      // Check if spectrumObject contains "data" and "1r"
      if (
        spectrumObject.data &&
        spectrumObject.data['1r'] &&
        Array.isArray(spectrumObject.data['1r'].array)
      ) {
        const yArray = spectrumObject.data['1r'].array.slice(); // Copy the array to "y"
        // Check if dimensional_parameters exist
        if (
          Array.isArray(spectrumObject.dimensional_parameters) &&
          spectrumObject.dimensional_parameters.length > 0
        ) {
          const params = spectrumObject.dimensional_parameters[0];

          if (
            params.points &&
            params.lowest_frequency !== undefined &&
            params.spectral_width &&
            params.spectrometer_frequency
          ) {
            // Calculate the increment
            const increment = params.spectral_width / params.points;

            // Create the array of objects with chemShift and value
            result = Array.from({ length: params.points }, (_, i) => ({
              chemShift:
                (params.lowest_frequency +
                  params.spectral_width -
                  i * increment) /
                params.spectrometer_frequency,
              value: yArray[i], // Assign the corresponding y value, or null if it doesn't exist
            }));
          } else {
            console.error(
              'Required parameters (points, lowest_frequency, spectral_width, spectrometer_frequency) are missing.',
            );
          }
        } else {
          console.error('dimensional_parameters not found or empty.');
        }
      } else {
        console.error('1r data array not found in the spectrum object.');
      }
    } else {
      console.error('The object does not have a type ', type);
    }

    return result;
  }

  function extractSpectrumDataXY(spectrumObject) {
    let result = {};

    // Check if the spectrumObject has a "type" field with the value "spectrum"
    if (spectrumObject.type === 'spectrum') {
      // Check if spectrumObject contains "data" and "1r"
      if (
        spectrumObject.data &&
        spectrumObject.data['1r'] &&
        Array.isArray(spectrumObject.data['1r'].array)
      ) {
        // Extract the "array" from "1r" and store it in "y" within the result object
        result.y = spectrumObject.data['1r'].array.slice(); // Copy the array to "y"

        // Check if dimensional_parameters exist
        if (
          Array.isArray(spectrumObject.dimensional_parameters) &&
          spectrumObject.dimensional_parameters.length > 0
        ) {
          const params = spectrumObject.dimensional_parameters[0];

          if (
            params.points &&
            params.lowest_frequency !== undefined &&
            params.spectral_width &&
            params.spectrometer_frequency
          ) {
            // Calculate the increment
            const increment = params.spectral_width / params.points;

            // Create the points array
            result.x = Array.from(
              { length: params.points },
              (_, i) =>
                (params.lowest_frequency +
                  params.spectral_width -
                  i * increment) /
                params.spectrometer_frequency,
            );
          } else {
            console.error(
              'Required parameters (points, lowest_frequency, spectral_width) are missing.',
            );
          }
        } else {
          console.error('dimensional_parameters not found or empty.');
        }
      } else {
        console.error('1r data array not found in the spectrum object.');
      }
    } else {
      console.error('The object does not have a type "spectrum".');
    }

    return result;
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

      const allObjectsExtracted = await processMnovaJsonFile(
        fileNameSpectrum,
        'spectra',
        ['$mnova_schema', 'data', 'raw_data', 'multiplets'],
        //['$mnova_schema', 'data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters'],
      );

      const allObjectsExtractedMolecule = await processMnovaJsonFileMolecule(
        fileNameData,
        'molecule',
        //['assignments'],
        [
          'assignments',
          'predictions',
          'parameters',
          '$mnova_schema',
          'bonds',
          'atoms',
        ],
      );

      console.log('allObjectsExtracted', allObjectsExtracted);
      console.log(
        'moleculeT allObjectsExtractedMolecule',
        allObjectsExtractedMolecule,
      );

      // spectra
      const spectrumData = extractSpectrumData(allObjectsExtracted[0].data);
      const spectrumData2 = extractSpectrumData(allObjectsExtracted[1].data);
      const spectrumDataAll = [
        spectrumData,
        spectrumData2,
        [
          { chemShift: 2.01, value: 1000 },
          { chemShift: 2.0, value: 1000000 },
          { chemShift: 1.99, value: 1000 },
        ],
      ];
      // molecule (with assignement)
      const jGraphObj = allObjectsExtractedMolecule.assignments;

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

      const jGraphData = await readDataFile(fileNameData);
      //const regions = {[{num: 0, chemShift:0.99, regionFrom: 1.1, regionTo:0.9, label:"H1", AssignedAtom: 4, couplings:[{J=7.0, assignedTo = 1,}]}]}
      //const jGraphObj = {[{num: 0, chemShift:0.99, label:"H1", couplings:[{J=7.0, assignedTo = 1,}]}]};
      var nmrAssignment = new NmrAssignment(
        //jGraphData,
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
