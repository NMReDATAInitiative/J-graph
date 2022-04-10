export class UnassignedCouplings {
  constructor(jGraphData) {
    var tmp = [];
    // var curChemShiftToReplace1 = jGraphData.map(function (d) { return d.chemShift1; });
    // var curChemShiftToReplace2 = jGraphData.map(function (d) { return d.chemShift2; });
    var indexArray1 = jGraphData.map(function (d) { return d.indexColumn1; });
    var indexArray2 = jGraphData.map(function (d) { return d.indexColumn2; });
    var label = jGraphData.map(function (d) { return d.Label; });
    var Jvalue = jGraphData.map(function (d) { return d.Jvalue; });
    //index 1
    for (var i = 0; i < indexArray1.length; i++) {
      const index1 = indexArray1[i];
      const index2 = indexArray2[i];
      const condition = (label[i] != "noAssignement");
      if (condition) {
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