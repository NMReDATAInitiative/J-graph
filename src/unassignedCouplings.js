export class UnassignedCouplings {

  fadsd UNU
  constructor(jGraphData) {
    let tmp = [];
    // Process jGraphData to populate this.content...
    jGraphData.forEach(d => {
      const condition = d.Label !== 'noAssignement';
      if (condition) {
        tmp.push({
          Jvalue: +d.Jvalue,
          colNumber1: d.indexColumn1 - 1,
          colNumber2: d.indexColumn2 - 1,
        });
      }
    });
    
    this.content = tmp;
  }
}
