export async function processMnovaJsonFileSpectrum(
  jsonFilePath,
  type,
  fieldsToKeep,
  callback,
) {
  try {
    fieldsToKeep.push('$mnova_schema');
    // Load the JSON data using D3
    const jsonData = await d3.json(jsonFilePath);

    // Array to store the filtered spectra
    let filteredSpectraArray = [];

    // Check if the JSON has a 'spectra' field
    if (jsonData[type] && Array.isArray(jsonData[type])) {
      jsonData[type].forEach((spectrum, index) => {
        // Create an object to store the filtered data
        if (spectrum['$mnova_schema']) {
          const schema = spectrum['$mnova_schema'];
          const expected =
            'https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec';
          if (schema != expected) {
            console.error(
              'processMnovaJsonFileSpectrum: wrong schema : got ',
              schema,
              ' expected ',
              expected,
            );
          } else {
            console.log('processMnovaJsonFileSpectrum: schema OK :', schema);
          }
        }
        // Apply logic for varisous versions
        const filteredSpectrum = processMnovaJsonFileSpectrumV1(
          spectrum,
          fieldsToKeep,
          index,
        );
        filteredSpectraArray.push(filteredSpectrum);
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
function processMnovaJsonFileSpectrumV1(spectrum, fieldsToKeep, index) {
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
      console.log(`SpectrumT Did not find ${field} in spectra[${index}]`);
    }
  });

  // Log the filtered spectrum object
  console.log(`SpectrumT ${index + 1}:`, filteredSpectrum);
  return filteredSpectrum;
}
export async function processMnovaJsonFileMolecule(
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
          console.log(`moleculeT Found ${field} at spectrum level in molecule`);
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

function extractMoleculeData(spectrumObjectIn, type = 'data') {
  const schema = spectrumObjectIn['$mnova_schema'];
  const expected =
    'https://mestrelab.com/json-schemas/mnova/2023-07/01/molecule/molecule';
  if (schema != expected) {
    console.error(
      'extractMoleculeData: wrong schema : got ',
      schema,
      ' expected ',
      expected,
    );
  } else {
    console.log('extractMoleculeData: schema OK :', schema);
  }
  const spectrumObject = spectrumObjectIn[type];
  return spectrumObject;
}

export function extractSpectrumData(spectrumObjectIn, type = 'data') {
  const schema = spectrumObjectIn['$mnova_schema'];
  const expected =
    'https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec';
  if (schema != expected) {
    console.error(
      'extractSpectrumData: wrong schema : got ',
      schema,
      ' expected ',
      expected,
    );
  } else {
    console.log('extractSpectrumData: schema OK :', schema);
  }
  // Apply logic for varisous versions
  return extractSpectrumDataV1(spectrumObjectIn, type);
}

function extractSpectrumDataV1(spectrumObjectIn, type) {
  const spectrumObject = spectrumObjectIn[type];
  let result = [];

  if (spectrumObject.type === 'spectrum') {
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

export function ingestMoleculeObject(
  allObjectsExtractedMolecule,
  spectrumAssignment,
) {
  console.log('spectrumAssignment ', spectrumAssignment);
  const jGraphData = extractMoleculeData(
    allObjectsExtractedMolecule,
    'assignments',
  );
  const atoms = extractMoleculeData(allObjectsExtractedMolecule, 'atoms');
  console.log('spectrumAssignment jGraphData ', jGraphData);

  var dataOutput = [];
  jGraphData.forEach((atomIt, index) => {
    if (!'atom' in atomIt) return;
    const atomCode = atomIt.atom.atomCode;
    const shifts = atomIt.shifts;
    const [element, label] = atomIt.atom.atomCode.split(';');
    const atomIndexMol =
      atoms.findIndex(
        (atom) => atom.elementSymbol === element && atom.number === label,
      ) + 1;

    if (element != 'H') {
      return;
    }

    // Assigned J's from the molecule
    var listOfJs = [];
    if ('J-couplings' in atomIt) {
      const listCoup = atomIt['J-couplings'];
      atomIt['J-couplings'].forEach((aJ, index) => {
        const coupling = aJ.coupling;
        var jObj = {
          coupling: coupling,
          atomIndexMol: [],
        };
        if ('atomCode' in aJ.coupledAtom) {
          // !!!! Should be a list....
          const atomCode = aJ.coupledAtom.atomCode;
          const [elementPartner, labelPartner] =
            aJ.coupledAtom.atomCode.split(';');
          const atomIndexMolPartner =
            atoms.findIndex(
              (atom) =>
                atom.elementSymbol === elementPartner &&
                atom.number === labelPartner,
            ) + 1;
          if (false)
            console.log(
              'spectrumAssignment multiplet J-couplings atomIndexMolPartner',
              atomIndexMolPartner,
              ' coupling ',
              coupling,
              ' Hz',
            );
          jObj.atomIndexMol.push(atomIndexMolPartner);
        }
        listOfJs.push(jObj);
      });
    }
    // Unassigned J's from the multiplets of the spectrum

    shifts.forEach((shiftIt, i) => {
      shiftIt.assignedMultiplets.forEach((assignedMultipletIt, i) => {
        // find multiplet in spectra data from molecule data
        const multipletIndex = spectrumAssignment.list.findIndex(
          (multiplet) => '{' + multiplet.uuid + '}' === assignedMultipletIt,
        );
        if (multipletIndex > 0) {
          const multiplet = spectrumAssignment.list[multipletIndex];
          console.log(
            'spectrumAssignment multipletIndex ========= ',
            multipletIndex,
          );
          /*console.log('spectrumAssignment multiplet ========= ', multiplet);
          console.log('spectrumAssignment multiplet area ', multiplet.area);
          console.log( 'spectrumAssignment multiplet category ', multiplet.category,);
          console.log('spectrumAssignment multiplet f1_shift ', multiplet.f1_shift, );
          console.log(  'spectrumAssignment multiplet maximum ', multiplet.maximum,  );
          console.log( 'spectrumAssignment multiplet nuclides ', multiplet.nuclides, );
          console.log('spectrumAssignment multiplet name ', multiplet.name);
          console.log('spectrumAssignment multiplet amoderea ', multiplet.mode);
          console.log( 'spectrumAssignment multiplet is_reference ', multiplet.is_reference,);
          */
          console.log('spectrumAssignment multiplet range ', multiplet.range);

          multiplet.j_list.forEach((aList) => {
            console.log('spectrumAssignment multiplet aList ', aList);
            console.log(
              'spectrumAssignment multiplet aList.value ',
              aList.value,
            );
            var jObj = {
              coupling: aList.value,
              atomIndexMol: [],
            };
            listOfJs.push(jObj);
          });
        }

        //J-couplings

        // Find the existing object in the list by assignedMultiplet
        let existingItem = dataOutput.find(
          (item) =>
            item.assignedMultipletMnovaHash === assignedMultipletIt &&
            item.chemShift === shiftIt.shift,
        );
        if (existingItem) {
          existingItem.labelsColumn.push(label);
          existingItem.atomIndicesMol.push(atomIndexMol);
        } else {
          const obj = {
            assignedMultipletMnovaHash: assignedMultipletIt,
            chemShift: shiftIt.shift,
            labelsColumn: [label],
            atomIndicesMol: [atomIndexMol],
            listOfJs: listOfJs,
          };
          dataOutput.push(obj);
        }
      });
    });
  });
  dataOutput.sort((a, b) => b.chemShift - a.chemShift);
  return dataOutput;
}
