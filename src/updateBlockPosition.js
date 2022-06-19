
export function updateBlockPosition(listOfJs, minSpaceBetweekCircles, minSpaceBetweekBlocks) {
    for (var index1 = 1; index1 < listOfJs.length; index1++ ) {
        listOfJs[index1].JlevelAvoidContact = Math.abs(listOfJs[index1].Jvalue);
      var minSpace = minSpaceBetweekBlocks;
      if (!listOfJs[index1].isAssigned) {
        minSpace = minSpaceBetweekCircles;
      }
      const ref = listOfJs[index1 - 1].JlevelAvoidContact + minSpace;
      if (listOfJs[index1].JlevelAvoidContact < ref) {
        listOfJs[index1].JlevelAvoidContact = ref;
      }
    }
  }