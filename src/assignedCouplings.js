export class AssignedCouplings {
    constructor(jGraphData) {
      var theAssignedCouplings = [];
      // var curChemShiftToReplace1 = jGraphData.map(function (d) { return d.chemShift1; });
      // var curChemShiftToReplace2 = jGraphData.map(function (d) { return d.chemShift2; });
      var labelColumn1 = jGraphData.map(function (d) { return d.labelColumn1; });
      var labelColumn2 = jGraphData.map(function (d) { return d.labelColumn2; });
      var indexArray1 = jGraphData.map(function (d) { return d.indexColumn1; });
      var indexArray2 = jGraphData.map(function (d) { return d.indexColumn2; });
      var label = jGraphData.map(function (d) { return d.Label; });
      var Jvalue = jGraphData.map(function (d) { return d.Jvalue; });
      var JvalueShifted = jGraphData.map(function (d) { return d.JvalueShifted; });
      var indexColumn1 = jGraphData.map(function (d) { return d.indexColumn1; });
      var indexColumn2 = jGraphData.map(function (d) { return d.indexColumn2; });
      var chemShift1 = jGraphData.map(function (d) { return d.chemShift1; });
      var chemShift2 = jGraphData.map(function (d) { return d.chemShift2; });
      var indexInMolFile1 = jGraphData.map(function (d) { return d.indexInMolFile1; });
      var indexInMolFile2 = jGraphData.map(function (d) { return d.indexInMolFile2; });
      //index 1
      for (var i = 0; i < chemShift1.length; i++) {
        const index1 = indexArray1[i];
        const index2 = indexArray2[i];
        
       if (label[i] != "noAssignement"){
          theAssignedCouplings.push({
            jOKcolor: "grey",
            Jvalue: +Jvalue[i],
            colNumber1: (index1 - 1),
            colNumber2: (index2 - 1),
            Label: label[i],
            JvalueShifted: +JvalueShifted[i],
            indexColumn1: indexColumn1[i],
            indexColumn2: indexColumn2[i],
            chemShift1: +chemShift1[i],
            chemShift2: +chemShift2[i],
            labelColumn1: labelColumn1[i],
            labelColumn2: labelColumn2[i],
            lineText: ("J(" + labelColumn1[i] + "," + labelColumn2[i] + ") = " + Jvalue[i] + " Hz"),
            xx: 0.0,
            indexInMolFile1: indexInMolFile1[i],
            indexInMolFile2: indexInMolFile2[i],
          });
        }
      }
      this.content = theAssignedCouplings;
    }
    udateLineTrajectory() {
      const lastColuNumber = this.content.length - 1;// .size() - 1;
      for (var diffIndex = 1; diffIndex < lastColuNumber; diffIndex++) {
        const lastColGigenDiffIndex = lastColuNumber - diffIndex;
        for (var curCol = 0; curCol <= lastColGigenDiffIndex; curCol ++ ) {
          const first = curCol;
          const second = curCol + diffIndex;
          //	double currentShiftedJlast = 0.0;
          var currentShiftedJ = 0.0;
          var currentJ = 0.0;
          var indexOther1 = 0;
          var indexOther2 = 0;
          for (var indexList = 0; indexList < this.content.length; indexList++) {
            var fs = this.content[indexList].indexColumn1;
            var fl = this.content[indexList].indexColumn2;
            //if (fs > fl) {const del = fl; fl = fs; fs = del;} // Swap
            var OK = false;
            if (fs == first && fl == second) {
              currentJ = this.content[indexList].Jvalue;
              currentShiftedJ = this.content[indexList].JvalueShifted;
              OK =true;
              break;
            }
            if (fs == second && fl == first) {
              currentJ = this.content[indexList].Jvalue;
              currentShiftedJ = this.content[indexList].JvalueShifted;
              OK =true;
              break;
            }
          }
          //if (hasJ(first, second, currentJ, currentShiftedJ)) {
          if (OK) {
            const currentJwithTrueSign = currentJ;
            currentJ = abs(currentJ);
            currentShiftedJ = abs(currentShiftedJ);
          }
         }
    }
  }
}