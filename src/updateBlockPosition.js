
export function updateBlockPosition(listOfJs, minSpaceBetweekCircles, minSpaceBetweekBlocks) {
  //listOfJs.sort((a, b) => Math.abs(a.Jvalue) > Math.abs(b.Jvalue) ? 1 : -1); 
  listOfJs[0].JlevelAvoidContact = Math.abs(listOfJs[0].Jvalue);
  for (var index1 = 1; index1 < listOfJs.length; index1++ ) {
    const trueValue = Math.abs(listOfJs[index1].Jvalue);
    listOfJs[index1].JlevelAvoidContact = trueValue;
    var minSpace = 0;
    if (listOfJs[index1].isAssigned) {
      minSpace += minSpaceBetweekBlocks / 2.0;
    } else {
      minSpace += minSpaceBetweekCircles / 2.0;
    }
    if (listOfJs[index1 - 1].isAssigned) {
      minSpace += minSpaceBetweekBlocks / 2.0;
    } else {
      minSpace += minSpaceBetweekCircles / 2.0;
    }
    const ref = listOfJs[index1 - 1].JlevelAvoidContact + minSpace;
    if (listOfJs[index1].JlevelAvoidContact < ref) {
      listOfJs[index1].JlevelAvoidContact = ref;
    }
  }
  return listOfJs;
} 