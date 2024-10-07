import { SpectrumCeD } from '../srcClasses/spectrum.mjs';
import { SpectrumCeDNextLevel } from '../srcClasses/spectrum.mjs';
var version = "v3";

  const datav1 = {
	id: '1',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2}, { x: 2, y: 4} ],
  version: 'v1',
  larmor: 200.13
  };
const datav2 = {
	id: '2',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2}, { x: 2, y: 4} ],
  version: 'v2',
  description: 'Default description2',
  larmor: 200.13
  };
  const datav3 = {
	id: '3',
  name: 'Spectrum A',
  dataPoints: [ { x: 1, y: 2, x2: 1 }, { x: 2, y: 0, x2: 1 }, { x: 1, y: 0.1, x2: 2 }, { x: 2, y: 4, x2: 2 } ],
  version: 'v3',
  description: 'Default description3',
  larmor: 200.13
  };
const toto = new SpectrumCeD(datav1, 'v1');
console.log('classHierarchy:', toto.classHierarchy);
console.log('nb items :', Object.keys(toto.data).length);

const dataList = [datav1, datav2, datav3];

// const versions = ['v1', 'v2', 'v3'];
const versions = [];
for (const data of dataList) {
	versions.push(data.version);
}

// Double loop to test all combinations of data objects and versions
for (const data of dataList) {
  for (const version of versions) {
	  console.log(`Data object version: ${data.version}, Desired version: ${version}`);
    const toto = new SpectrumCeD(data, version, {dumpChangeVersion: false, validateSchema: true});

	  var error = false;

  const a1 = toto.data.version;
	const a2 = version;
	if (a1!== a2) {console.error(`>>>>>>>Error version: ${version} Expected ${a2} got ${a1}`);error = true;}

	if (version === 'v1') {
		const a1 = Object.keys(toto.data).length;
		const a2 = 5;
		if (a1!== a2) {console.error(`>>>>>>>Error length: ${version} Expected ${a2} got ${a1}`);error = true;}
	}
	if (version === 'v2') {
		const a1 = Object.keys(toto.data).length;
		const a2 = 6;
		if (a1!== a2) {console.error(`>>>>>>>Error length: ${version} Expected ${a2} got ${a1}`);error = true;}
	}
	if (version === 'v3') {
		const a1 = Object.keys(toto.data).length;
		const a2 = 6;
		if (a1!== a2) {console.error(`>>>>>>>Error length: ${version} Expected ${a2} got ${a1}`);error = true;}
	}
	if (error > 0) {
					console.log(`description ${toto.data.description}`);
					console.log(`version ${version}`);
					console.log(`data ${data.version}`);
	}					

    console.log('---------------------------');
   
	
  }
}

const toto2 = new SpectrumCeDNextLevel({version :"v1"}, "v1");
console.log('classHierarchy:', toto2.classHierarchy);



areEqualArrays(toto.classHierarchy, ['ObjectCeDBase', 'SpectrumCeD']);
areEqualArrays(toto2.classHierarchy, ['ObjectCeDBase','SpectrumCeD','SpectrumCeDNextLevel']);
// areEqualArrays(toto2.classHierarchy, [ 'ObjectCeDBgffdsfdsfdfdase','SpectrumCeD','SpectrumCeDNextLevel']);
// areEqualArrays(toto2.classHierarchy, ['ObjectCeDBase', '', '', '', '', '']);

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
