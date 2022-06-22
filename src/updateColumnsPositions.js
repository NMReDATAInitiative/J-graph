import { getSpread } from './getSpread.js'; 

export function updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace) {
var spreadPositions = [];
var spreadDelta = [];
 for (var i = 0; i < dataColumns.length; i++) {
   var returnValue = 0.0;
   const curChemShift = dataColumns.map(function (d) { return d.chemShift; })
   const curChem = curChemShift[i];
   if (leftPosColumns[i] < x(curChem)) {
     if (rightPosColumns[i] > x(curChem)) {
       returnValue = x(curChem);
     } else {
       returnValue = rightPosColumns[i];
     }
   } else {
     returnValue = leftPosColumns[i];
   }
   spreadPositions.push(returnValue);
   if (i > 0) {
     spreadDelta.push(returnValue - spreadPositions[i - 1]);
   }
 }
 spreadDelta = getSpread(spreadDelta, smallSpace);
 for (i = 0; i < spreadDelta.length; i++) {
   spreadPositions[i + 1] = spreadPositions[i] + spreadDelta[i];
 }
 return spreadPositions;
}