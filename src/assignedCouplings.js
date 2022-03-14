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
    updateBrokeLines() {
      
    }
  }