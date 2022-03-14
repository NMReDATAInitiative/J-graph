export class UnassignedCouplings {
    constructor(jGraphData) {
     var tmp = [];
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
       
      if (label[i] == "noAssignement") {
        tmp.push({
           Jvalue: +Jvalue[i],
           colNumber1: (index1 - 1),
           colNumber2: (index2 - 1),
         });
       } 
    }
    this.content = tmp;
    
}
  }