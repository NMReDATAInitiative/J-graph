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
      var JvalueShifted = jGraphData.map(function (d) { return d.Jvalue; });
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

    udateLineTrajectory(fDeltaDotAbove, fDeltaLineAbove) {

      for (var indexList = 0; indexList < this.content.length; indexList++) {
        this.content[indexList].JvalueShifted = this.content[indexList].Jvalue;
      }

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
          var indexOther = 0;
          var OK = false;
          for (var indexList = 0; indexList < this.content.length; indexList++) {
            var fs = this.content[indexList].indexColumn1;
            var fl = this.content[indexList].indexColumn2;
            //if (fs > fl) {const del = fl; fl = fs; fs = del;} // Swap
            if (fs == first && fl == second) {
              currentJ = this.content[indexList].Jvalue;
              currentShiftedJ = this.content[indexList].JvalueShifted;
              indexOther = indexList;
              OK = true;
              break;
            }
            if (fs == second && fl == first) {
              currentJ = this.content[indexList].Jvalue;
              currentShiftedJ = this.content[indexList].JvalueShifted;
              indexOther = indexList;
              OK = true;
              break;
            }
          }
          //if (hasJ(first, second, currentJ, currentShiftedJ)) {
          if (OK) {
            console.log("ZZ ENTERING = ");

            const currentJwithTrueSign = currentJ;
            currentJ = Math.abs(currentJ);
            currentShiftedJ = Math.abs(currentShiftedJ);

            var rangesToAvoidFirst= [];
            var rangesToAvoidSecond= [];

      			//vector < pair < double, double > > rangesToAvoid; 

      			// list all ranges of dots for which top is above currentJ 
      			for (var iter = 0; iter < this.content.length; iter++) 
              if (iter != indexOther ) {
                const it = this.content[iter];
                var itfs = it.indexColumn1;
                var itfl = it.indexColumn2;
                 if (itfs > itfl) {const del = itfl; itfl = itfs; itfs = del;} // Swap

            // avoid lines
                if ((itfs > first && itfs < second) || (itfl > first && itfl < second )) 
                  if (diffIndex <=  (itfl -itfs)) {

                //for (var inside = first + 1; inside <= second - 1; inside ++) { // exclude current
                  //  if (it.colNumber1 > first || it.colNumber2 == inside )
          					if (currentJ < (it.JvalueShifted + fDeltaLineAbove)) {
                      rangesToAvoidFirst.push(it.JvalueShifted + fDeltaLineAbove);
                      rangesToAvoidSecond.push(it.JvalueShifted - fDeltaLineAbove);
          //						rangesToAvoid.push_back(make_pair(it.Jvalues + fDeltaDotAbove, it.Jvalues - fDeltaDotBelow));
      					    }
      				  }
                // avoid itfs
                if (itfs > first && itfs < second) {
          					if (currentJ < (it.Jvalue + fDeltaDotAbove)) {
                      rangesToAvoidFirst.push(it.Jvalue + fDeltaDotAbove);
                      rangesToAvoidSecond.push(it.Jvalue - fDeltaDotAbove);
      					    }
      				  }
                // avoid itfs
                if (itfl > first && itfl < second) {
          					if (currentJ < (it.Jvalue + fDeltaDotAbove)) {
                      rangesToAvoidFirst.push(it.Jvalue + fDeltaDotAbove);
                      rangesToAvoidSecond.push(it.Jvalue - fDeltaDotAbove);
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

          for ( indexList = 0; indexList < this.content.length; indexList++) {
            const fs = this.content[indexList].indexColumn1;
            const fl = this.content[indexList].indexColumn2;
            //if (fs > fl) {const del = fl; fl = fs; fs = del;} // Swap
            if (fs == inside1 && fl == inside2) {
              currentJ2 = this.content[indexList].Jvalue;
              currentShiftedJ2 = this.content[indexList].JvalueShifted;
              OK2 = true;
              break;
            }
            if (fs == inside2 && fl == inside1) {
              currentJ2 = this.content[indexList].Jvalue;
              currentShiftedJ2 = this.content[indexList].JvalueShifted;
              OK2 = true;
              break;
            }
          }

          if (OK2) {
					//if (hasJ(inside1, inside2, currentJ2, currentShiftedJ2)) {
						currentJ2 = Math.abs(currentJ2);
						currentShiftedJ2 = Math.abs(currentShiftedJ2);
						if (currentJ2 < (currentShiftedJ2 + fDeltaLineAbove)) {
							rangesToAvoidFirst.push(currentShiftedJ2 + fDeltaLineAbove);
							rangesToAvoidSecond.push(currentShiftedJ2 - fDeltaLineAbove);
						}
		      }
        }
      }
      //sort(rangesToAvoid.begin(), rangesToAvoid.end()); // sort by first element
         console.log("ZZ rangesToAvoidFirst = " + JSON.stringify(rangesToAvoidFirst));
         console.log("ZZ rangesToAvoidSecond = " + JSON.stringify(rangesToAvoidSecond));


           var indices = new Array(rangesToAvoidFirst.length);
           for (var i = 0; i < rangesToAvoidFirst.length; ++i) indices[i] = i;

           indices.sort(function (a, b) {
             return rangesToAvoidFirst[a] > rangesToAvoidFirst[b] ? 1 : rangesToAvoidFirst[a] < rangesToAvoidFirst[b] ? -1 : 0; 
           });
          // var indicesSorted = new Array(rangesToAvoidFirst.length);
          // for (i = 0; i < rangesToAvoidFirst.length; ++i) indicesSorted[indices[i]] = i;
         //  console.log("ZZ                   indices " + JSON.stringify(indices));
                           console.log("ZZ  ===========currentJ " + JSON.stringify(currentJ));
                           console.log("ZZ  ===========currentShiftedJ " + JSON.stringify(currentShiftedJ));
const delBefore = currentShiftedJ;
    			for (var item = 0; item < rangesToAvoidFirst.length; item++) {

            var it1 = rangesToAvoidFirst [indices[item]];
            var it2 = rangesToAvoidSecond[indices[item]];
           console.log("ZZ                   it1 " + JSON.stringify(it1)  + "   it2 " + JSON.stringify(it2));

    				if ((currentShiftedJ < (it1)) && (currentShiftedJ > (it2))) {
    						currentShiftedJ = it1;
                           console.log("ZZ          currentShiftedJ " + JSON.stringify(currentShiftedJ));

    				} 
    			}
          if (delBefore > currentShiftedJ )
          console.log("ZZ     ????????????????????????????????? " + JSON.stringify(currentShiftedJ));
 if (currentJ > currentShiftedJ ) {
          console.log("ZZ    currentJ ????????????????????????????????? " + JSON.stringify(currentJ));
          console.log("ZZ    currentShiftedJ ????????????????????????????????? " + JSON.stringify(currentShiftedJ));
 }
             console.log("ZZ AA i = " + JSON.stringify(i));

      			//if (Math.abs(currentShiftedJ - currentJ)> 0.00001) {
            console.log("before = this.content[first].JvalueShifted " + JSON.stringify(this.content[indexOther].JvalueShifted));
            console.log("before = curthis.content[first].Jvalue " + JSON.stringify(this.content[indexOther].Jvalue));

              this.content[indexOther].JvalueShifted = currentShiftedJ;
              console.log("ZZZZAAAA  this.content[second].JvalueShifted = " + JSON.stringify(currentShiftedJ));

      				//setShiftedJ(first, second, currentShiftedJ);
      			//	setShiftedJ(second, first, currentShiftedJ);
      				//std::cerr << "For (" << first << "," << second << ") shifted to " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
      			//} else {
      			//	std::cerr << "For (" << first << "," << second << ") Not shifted to " << currentShiftedJ << " (for " <<  currentJ << " Hz)" << std::endl;
      	//		}
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