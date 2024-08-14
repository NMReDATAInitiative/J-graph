 function getSpread(spreadDelta, smallSpace) {
    // determine how to spead objects to avoid contacts
    // there muss be enough space for this function to work
    // this is obtained by setting smallSpace to a value below the width/number of items
    for (var i = 0; i < spreadDelta.length; i++) {
      const curDelta = spreadDelta[i];
      if (curDelta < smallSpace) {
        const spreadFull = (smallSpace - curDelta);
        var spreadleft = spreadFull / 2.0;
        // try shift left (1 of 3)
        for (var j = i - 1; j >= 0; j -= 1) {
          const curExtraSpace = (spreadDelta[j] - smallSpace);
          if (curExtraSpace > 0.0) {
            if (curExtraSpace > spreadleft) {
              spreadDelta[j] -= spreadleft;
              spreadDelta[i] += spreadleft;
              spreadleft = 0;
            } else {
              spreadDelta[j] -= curExtraSpace;
              spreadDelta[i] += curExtraSpace;
              spreadleft -= curExtraSpace;
            }
          }
        }
        // work left over
        var spreadRight = spreadFull - spreadleft;
        // try shift right (2 of 3)
        for (j = i + 1; j < spreadDelta.length; j += 1) {
          const curExtraSpace = (spreadDelta[j] - smallSpace);
          if (curExtraSpace > 0.0) {
            if (curExtraSpace > spreadRight) {
              spreadDelta[j] -= spreadRight;
              spreadDelta[i] += spreadRight;
              spreadRight = 0;
            } else {
              spreadDelta[j] -= curExtraSpace;
              spreadDelta[i] += curExtraSpace;
              spreadRight -= curExtraSpace;
            }
          }
        }
        // work left over (rare but there may be a left over....)
        if (spreadRight > 0.0) {
          spreadleft = spreadRight;
          // try shift left (3 of 3)
          for (j = i - 1; j >= 0; j -= 1) {
            const curExtraSpace = (spreadDelta[j] - smallSpace);
            if (curExtraSpace > 0.0) {
              if (curExtraSpace > spreadleft) {
                spreadDelta[j] -= spreadleft;
                spreadDelta[i] += spreadleft;
                spreadleft = 0;
              } else {
                spreadDelta[j] -= curExtraSpace;
                spreadDelta[i] += curExtraSpace;
                spreadleft -= curExtraSpace;
              }
            }
          }
        }
        // Done 3/3
      }
    }
    return spreadDelta;
  }

export function updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace) {

const curChemShiftList = dataColumns.map(function (d) { return d.chemShift; })
var spreadPositions = [];
var spreadDelta = [];

 for (var i = 0; i < curChemShiftList.length; i++) {
   var returnValue = 0.0;
   const curChem = curChemShiftList[i];
   //const curChem = dataColumns[i].chemShift;
  
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
  console.log(   'uui spreadPositions ', spreadPositions);

 return spreadPositions;
}