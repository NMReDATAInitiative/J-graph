import { SpectrumCeD } from '../srcClasses/spectrum.mjs';
import { SpectrumCeDNextLevel } from '../srcClasses/spectrum.mjs';

// node  ./tests/spectrumCeD.test.mjs

// options:
const dumpChangeVersion = true;
const validateSchema = true;
const options = {dumpChangeVersion: dumpChangeVersion, validateSchema: validateSchema};

// test data
const datav1 = {
	id: '1',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2}, { x: 2, y: 4} ],
  BaseObjectCeD_version: 'v1',
  SpectrumCeD_version: 'v1',
  larmor: 200.13
};

const datav2 = {
	id: '2',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2}, { x: 2, y: 4} ],
  BaseObjectCeD_version: 'v1',
  SpectrumCeD_version: 'v2',    
  description: 'Default description2',
  larmor: 200.13
};

const datav3 = {
	id: '3',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2, x2: 1 }, { x: 2, y: 0, x2: 1 }, { x: 1, y: 0.1, x2: 2 }, { x: 2, y: 4, x2: 2 } ],
  BaseObjectCeD_version: 'v1',
  SpectrumCeD_version: 'v3', 
  description: 'Default description3',
  larmor: 200.13
};

// Raise up... from SpectrumCeD to SpectrumCeDNextLevel
const datav1n = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v1', descriptionNL1: "defv1" });
const datav2n = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v1', descriptionNL1: "defv1" });
const datav3n = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v1', descriptionNL1: "defv1" });
const datav1o = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v2', descriptionNL2: "defv2" });
const datav2o = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v2', descriptionNL2: "defv2" });
const datav3o = Object.assign({}, datav2, { SpectrumCeDNextLevel_version: 'v2', descriptionNL2: "defv2" });

// test demo classHierarchy
const toto = new SpectrumCeD(datav1, options);
const constDesiredVersion = ['v1','v3'];   
const status = toto.adjustVersion(constDesiredVersion);
console.log('classHierarchy:', toto.classHierarchy);
console.log('nb items :', toto.classHierarchy.length);

const toto2 = new SpectrumCeDNextLevel(datav1n, options);
const constDesiredVersion2 = ['v1','v1','v2'];   
toto2.adjustVersion(constDesiredVersion2);
console.log('classHierarchy:', toto2.classHierarchy);
console.log('nb items :', toto2.classHierarchy.length);

const toto3 = new SpectrumCeDNextLevel(datav3o, options);
const constDesiredVersion3 = ['v1','v3','v1'];   
toto2.adjustVersion(constDesiredVersion3);
console.log('classHierarchy:', toto3.classHierarchy);
console.log('nb items :', toto3.classHierarchy.length);

// test version (in/de)crementation and schema validation
const dataList = [datav1, datav2, datav3];

var numberErrors = 0;
for (const data of dataList) {
  console.log(`------------------------Main loop : ${data["SpectrumCeD_version"]}`);

  for (const SpectrumCeD_version of ['v1','v2','v3']  ) {
    console.log(`------------Inner loop : ${SpectrumCeD_version}`);

	  console.log(`Data object version: ${data["SpectrumCeD_version"]}, Desired version: ${SpectrumCeD_version}`);
    const toto = new SpectrumCeD(data, options);
	  	  
    //console.log(`set: const constDesiredVersion = ${toto.getCurrentVersion()};`);
    //const constDesiredVersion = [SpectrumCeD_version, 'v1'];   
    const constDesiredVersion = ['v1', SpectrumCeD_version];   
    toto.adjustVersion(constDesiredVersion);
    var error = false;
      
    const a1 = toto.data["SpectrumCeD_version"];
  	const a2 = SpectrumCeD_version;
  	if (a1!== a2) {console.error(`>>>>>>>Error version: ${SpectrumCeD_version} Expected ${a2} got ${a1}`);error = true;}

  	if (SpectrumCeD_version === 'v1') {
  		const a1 = Object.keys(toto.data).length;
  		const a2 = 5+1;
  		if (a1!== a2) {console.error(`>>>>>>>Error length: ${SpectrumCeD_version} Expected ${a2} got ${a1}`);error = true;}
  	}
  	if (SpectrumCeD_version === 'v2') {
  		const a1 = Object.keys(toto.data).length;
  		const a2 = 6+1;
  		if (a1!== a2) {console.error(`>>>>>>>Error length: ${SpectrumCeD_version} Expected ${a2} got ${a1} ${Object.keys(toto.data)}`);error = true;}
  	}
  	if (SpectrumCeD_version === 'v3') {
  		const a1 = Object.keys(toto.data).length;
  		const a2 = 6+1;
  		if (a1!== a2) {console.error(`>>>>>>>Error length: ${SpectrumCeD_version} Expected ${a2} got ${a1}  ${Object.keys(toto.data)}`);error = true;}
  	}
  	if (error) {
  					console.log(`description ${toto.data.description}`);
  					console.log(`version ${SpectrumCeD_version}`);
  					console.log(`data ${data["SpectrumCeD_version"]}`);
            numberErrors ++;
  	}					
    console.log('---------------------------');
  }
}
if (numberErrors > 0) {
				console.log(`======================= Total number of errors :`, numberErrors);
} else {
				console.log(`======================= OK ! (no error)`);
}
areEqualArrays(toto.classHierarchy, ['BaseObjectCeD', 'SpectrumCeD']);
areEqualArrays(toto2.classHierarchy, ['BaseObjectCeD','SpectrumCeD','SpectrumCeDNextLevel']);
// areEqualArrays(toto2.classHierarchy, [ 'ObjectCeDBgffdsfdsfdfdase','SpectrumCeD','SpectrumCeDNextLevel']);
// areEqualArrays(toto2.classHierarchy, ['BaseObjectCeD', '', '', '', '', '']);

function areEqualArrays(arr1, arr2) {
  var errorNumber = 0;
  if (arr1.length != arr2.length) {
    console.error(
      'error .length are different : ',
      arr1.length,
      ' != ',
      arr2.length,
    );
    errorNumber++;
  }
  for (
    var i = 0;
    i < (arr1.length < arr2.length ? arr1.length : arr2.length);
    i++
  ) {
    if (arr1[i] != arr2[i]) {
      console.error(`error [`, i, `] : "${arr1[i]}:" != "${arr2[i]}"`);
      errorNumber++;
    }
  }
  if (errorNumber > 0) {
    console.error('in .... ', arr1, ' != ', arr2);
    console.error('-------------------------------------');
  }
}
