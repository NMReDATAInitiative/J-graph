import { SpectrumCeD } from '../srcClasses/spectrum.mjs';
import { SpectrumCeDNextLevel } from '../srcClasses/spectrum.mjs';

const toto = new SpectrumCeD();
console.log("classHierarchy:", toto.classHierarchy);
const toto2 = new SpectrumCeDNextLevel();
console.log("classHierarchy:", toto2.classHierarchy);
var errorNumber = 0;
if (toto2.classHierarchy.length != ['ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel'].length) {
	console.error("error", toto2.classHierarchy, " != ", [ 'ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel' ]);
	errorNumber++;
}
if (toto2.classHierarchy[0] != ['ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel'][0]) {
	console.error("error", toto2.classHierarchy[0], " != ", [ 'ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel' ][0]);
	errorNumber++;
}
if (toto2.classHierarchy[1] != ['ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel'][1]) {
	console.error("error", toto2.classHierarchy[1], " != ", [ 'ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel' ][1]);
	errorNumber++;
}
if (toto2.classHierarchy[2] != ['ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel'][2]) {
	console.error("error", toto2.classHierarchy[2], " != ", [ 'ObjectCeDBase', 'SpectrumCeD', 'SpectrumCeDNextLevel' ][2]);
	errorNumber++;
}
