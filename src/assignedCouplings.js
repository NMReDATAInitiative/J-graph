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
      var counter = 0;
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
            iindex: counter,
          });
          counter ++;
        }
      }
      this.content = theAssignedCouplings;
    }
    udateLineTrajectory(fDeltaDotAbove) {
      // parameters 

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
          
          //if (hasJ(first, second, currentJ, currentShiftedJ)) {
          if (OK) {
            const currentJwithTrueSign = currentJ;
            currentJ = Math.abs(currentJ);
            currentShiftedJ = Math.abs(currentShiftedJ);


var rangesToAvoidFirst= [];
var rangesToAvoidSecond= [];

			//vector < pair < double, double > > rangesToAvoid; 

			// list all ranges of dots for which top is above currentJ 
			for (var inside = first + 1; inside <= second - 1; inside ++) { // exclude current
				for (var iter = 0; iter < this.content.length; iter++) {
          const it = this.content[iter];
					if (currentJ < (it.Jvalues + fDeltaDotAbove)) {
            rangesToAvoidFirst.push_back(it.Jvalues + fDeltaDotAbove);
            rangesToAvoidSecond.push_back(it.Jvalues - fDeltaDotAbove);
//						rangesToAvoid.push_back(make_pair(it.Jvalues + fDeltaDotAbove, it.Jvalues - fDeltaDotBelow));
					}
				}
			}		

			// list all ranges of lines for which top is above currentJ 
			for (var inside1 = first + 1; inside1 <= second - 1; inside1 ++) { // includes current
				var from = 0;
				if (inside1 > diffIndex) from = inside1 - diffIndex;
				var to = lastColuNumber;
				if (inside1 + diffIndex < lastColuNumber) to = inside1 + diffIndex;
				for (var inside2 = from; inside2 <= to; inside2 ++) { // includes current
					if (inside1 == inside2) continue;
					//if (inside2 <= first && inside1 <= first) continue;
					//if (inside2 >= second && inside1 >= second) continue;
					//			std::cerr << "2)           test (" << inside1 << "," << inside2 << ") " << std::endl;

					var currentShiftedJ2 = 0.0;
					var currentJ2 = 0.0;




var OK2 = false;
            if (fs == inside1 && fl == inside2) {
              currentJ2 = this.content[indexList].Jvalue;
              currentShiftedJ2 = this.content[indexList].JvalueShifted;
              OK2 =true;
              break;
            }
            if (fs == inside2 && fl == inside1) {
              currentJ2 = this.content[indexList].Jvalue;
              currentShiftedJ2 = this.content[indexList].JvalueShifted;
              OK2 =true;
              break;
            }
if (OK2) {
					//if (hasJ(inside1, inside2, currentJ2, currentShiftedJ2)) {
						currentJ2 = abs(currentJ2);
						currentShiftedJ2 = abs(currentShiftedJ2);
						if (currentJ < (currentShiftedJ2 + fDeltaLineAbove)) {
							rangesToAvoidFirst.push_back(currentShiftedJ2 + fDeltaLineAbove);
							rangesToAvoidSecond.push_back(currentShiftedJ2 - fDeltaLineBelow);
						}
					}
				}
			}
      //sort(rangesToAvoid.begin(), rangesToAvoid.end()); // sort by first element
 var indices = new Array(this.content.length);
     for (var i = 0; i < this.content.length; ++i) indices[i] = i;
     indices.sort(function (a, b) {
       return rangesToAvoidFirst[a] < rangesToAvoidFirst[b] ? 1 : rangesToAvoidFirst[a] > rangesToAvoidFirst[b] ? -1 : 0; 
     });
     var indicesSorted = new Array(this.content.length);
     for (i = 0; i < this.content.length; ++i) indicesSorted[indices[i]] = i;






			for (var item = 0; item < this.content.length; item++) {
        const it1 = rangesToAvoidFirst [indicesSorted[item]];
        const it2 = rangesToAvoidSecond[indicesSorted[item]];
				if ((currentShiftedJ < (it1)) && (currentShiftedJ > (it2))) {
						currentShiftedJ = it1;
				} 
			}
			if (Math.abs(currentShiftedJ - currentJ)> 0.00001) {
        this.content[first].JvalueShifted = currentShiftedJ;
        this.content[second].JvalueShifted = currentShiftedJ;
				//setShiftedJ(first, second, currentShiftedJ);
			//	setShiftedJ(second, first, currentShiftedJ);
				//std::cerr << "For (" << first << "," << second << ") shifted to " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
			//} else {
			//	std::cerr << "For (" << first << "," << second << ") Not shifted to " << currentShiftedJ << " (for " <<  currentJ << " Hz)" << std::endl;
			}
			//  "chemShift1,chemShift2,indexColumn1,indexColumn2,Jvalue,JvalueShifted,Label"
/*
			std::cout
				<< this->fColumns[first].chemicalShift << ","
				<< this->fColumns[second].chemicalShift << ","
				<< first << "," << second << ","
				<< currentJwithTrueSign << "," << currentShiftedJ << ",";
        */
			
		 // else{
		  //	std::cout << "NO J for (" << first << "," << second << ") NO J " << std::endl;
		  // }
		


          }













          }
         }
    }
  }
}