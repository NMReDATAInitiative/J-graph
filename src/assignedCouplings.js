/*jshint esversion: 6 */
import { getJisOK } from './getJisOK.js';
import { getJgraphColor } from './getJgraphColor.js';
import { jmolGetInfo } from './jmolInterface.js';
import { jmolUnselectAll } from './jmolInterface.js';
import { jmolSelectPair } from './jmolInterface.js';
export class AssignedCouplings {
  constructor(dataColumns) {
    var theAssignedCouplings = [];
    var counter = 0;
    for (var indexList1 = 0; indexList1 < dataColumns.length; indexList1++) {
      for (var i1 = 0; i1 < dataColumns[indexList1].listOfJs.length; i1++) {
        if (dataColumns[indexList1].listOfJs[i1].isAssigned) {
          if (dataColumns[indexList1].listOfJs[i1].isFirstInAssignmentIndex) { // Otherwise will come twice - once for each partner
            const number1 = dataColumns[indexList1].listOfJs[i1].indexInAssignementList;
            // doubling the loop...
            var foundPartner = false;
          //  var log = "";
            for (var indexList2 = 0; indexList2 < dataColumns.length; indexList2++) {
              for (var i2 = 0; i2 < dataColumns[indexList2].listOfJs.length; i2++) {
              const number2 = dataColumns[indexList2].listOfJs[i2].indexInAssignementList;

          //   log += " " + indexList2 + "!=" + indexList1 + "." + " :" + i2 + "!=" + i1 + ":" + number2 + "=" + number1 + dataColumns[indexList2].listOfJs[i2].isFirstInAssignmentIndex + "=false true=" +dataColumns[indexList1].listOfJs[i1].isFirstInAssignmentIndex;

                if (dataColumns[indexList2].listOfJs[i2].isAssigned) {
                  if (!dataColumns[indexList2].listOfJs[i2].isFirstInAssignmentIndex) { // Otherwise will come twice - once for each partner
                    if (number1 == number2 ) { // are partners... could search for index with same value there directly...
                      //  console.log(" 1: :" + indexList + ":" + i);
                      //  console.log(" 2: :" + indexList2 + ":" + i2);
                      const JlevelAvoidContact1 = dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact;
                      const JlevelAvoidContact2 = dataColumns[indexList2].listOfJs[i2].JlevelAvoidContact;
                      const Jvalue1 = dataColumns[indexList1].listOfJs[i1].Jvalue;
                      const Jvalue2 = dataColumns[indexList2].listOfJs[i2].Jvalue;
                      //const assignmentPartner = dataColumns[indexList].listOfJs[i1].assignmentPartner;
                      
                      const avJcoupling = ((eval(Jvalue1) + eval(Jvalue2)) / 2.0); // Should be equal, but in case slightly different, take average

                      theAssignedCouplings.push({
                        jOKcolor: "grey",
                        Jvalue: avJcoupling, 
                        colNumber1: indexList1,
                        colNumber2: indexList2,
                        // J_H9_7ax
                        Label: "J_" + dataColumns[indexList1].labelColumn + "_" + dataColumns[indexList2].labelColumn, // used for highlight of lines
                        JvalueAntiOverlap1: +JlevelAvoidContact1,
                        JvalueAntiOverlap2: +JlevelAvoidContact2,
                        JvalueShifted: avJcoupling, // initial value, will be change later
                        indexColumn1: indexList1,
                        indexColumn2: indexList2,
                        indexJ1: i1,
                        indexJ2: i2,
                        chemShift1: dataColumns[indexList1].chemShift, // should probably remove - redundance... possibly problementic if shift
                        chemShift2: dataColumns[indexList2].chemShift, // should probably remove - redundance... possibly problementic if shift
                        labelColumn1: dataColumns[indexList1].labelColumn,
                        labelColumn2: dataColumns[indexList2].labelColumn,
                        lineText: ("J(" + dataColumns[indexList1].labelColumn + "," + dataColumns[indexList2].labelColumn + ") = " + avJcoupling + " Hz"),
                        xx: 0.0,
                        indexInMolFile1: dataColumns[indexList1].atomIndexMol,
                        indexInMolFile2: dataColumns[indexList2].atomIndexMol,
                        iindex: counter,
                      });                       
                      counter ++;
                      foundPartner = true;
                    }
                  }
                }
              }
            }
        //    if (!foundPartner) {
          //   console.log("Found no partner for " + indexList1 + " " + i1 + " " + dataColumns[indexList1].listOfJs[i1].Jvalue + log);
        //    }
          }
        }
      }
    }
    this.content = theAssignedCouplings;
  }

  consconstructFromJgraphtructor(jGraphData) {
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
          JvalueAntiOverlap1: +JvalueShifted[i],
          JvalueAntiOverlap2: +JvalueShifted[i],
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

   

      /*for (var indexList = 0; indexList < dataColumns.length; indexList++) {
        for (var i = 0; i < dataColumns[indexList].listOfJs.length; i++) {
          const iddex = dataColumns[indexList].listOfJs[i].indexInAssignementList;
          const JlevelAvoidContactTMP = dataColumns[indexList].listOfJs[i].JlevelAvoidContact;
          if (iddex >= this.content.length) {
            console.log("ERROR  iddex ");
          } else {
            console.log("OK  iddex " + iddex);

            if (dataColumns[indexList].listOfJs[i].isFirstInAssignmentIndex) {
              this.content[iddex].JvalueAntiOverlap1 = JlevelAvoidContactTMP;
            } else {
              this.content[iddex].JvalueAntiOverlap2 = JlevelAvoidContactTMP;
            }
          }
        }
      }
      */
    

  udateLineTrajectory(fDeltaDotAbove, fDeltaLineAbove, circleRadius, dataColumns) {

    for (var indexList = 0; indexList < this.content.length; indexList++) {
      this.content[indexList].JvalueShifted = this.content[indexList].Jvalue;
    }

    // parameters 

    const lastColuNumber = this.content.length - 1;// .size() - 1;
    // from close by pairs to farther appart pairs
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
          //t         console.log("ZZ ENTERING = ");

          const currentJwithTrueSign = currentJ;
          currentJ = Math.abs(currentJ);
          currentShiftedJ = Math.abs(currentShiftedJ);

          var rangesToAvoidFirst= [];
          var rangesToAvoidSecond= [];

          for (var iterator = 0; iterator < dataColumns.length; iterator++) {
            if (iterator > first && iterator < second) {
              for (var iterJ = 0; iterJ < dataColumns[iterator].listOfJs.length; iterJ++) {
               var  delta = 0;
                if (dataColumns[iterator].listOfJs[iterJ].isAssigned) {
                  delta = fDeltaDotAbove;
                } else {
                  delta = circleRadius;
                }
                const refValue = dataColumns[iterator].listOfJs[iterJ].JlevelAvoidContact;
                if (currentJ < refValue + delta) {
                  rangesToAvoidFirst.push(refValue + delta);
                  rangesToAvoidSecond.push(refValue - delta);
                }
              }
            }
          }
          // list all ranges of dots for which top is above currentJ 
         /* for (var iter = 0; iter < this.content.length; iter++) {
            if (iter != indexOther ) {
              const it = this.content[iter];
              var itfs = it.indexColumn1;
              var itfl = it.indexColumn2;
              var itfsVertPositionHz = dataColumns[it.indexColumn1].listOfJs[it.indexJ1].JlevelAvoidContact;
              var itflVertPositionHz = dataColumns[it.indexColumn2].listOfJs[it.indexJ2].JlevelAvoidContact;
              it.JvalueAntiOverlap1 = itfsVertPositionHz;
              it.JvalueAntiOverlap2 = itflVertPositionHz;
              if (itfs > itfl) { // swap
                  const del = itfl; itfl = itfs; itfs = del;
                  const del2 = itfsVertPositionHz; itfsVertPositionHz = itflVertPositionHz; itflVertPositionHz = del2;
               } // Swap
              
              // avoid lines
              
             
              // avoid itfs
              
              if (itfs > first && itfs < second) {
                if (currentJ < (it.Jvalue + fDeltaDotAbove)) {
                  rangesToAvoidFirst.push(itfsVertPositionHz + fDeltaDotAbove);
                  rangesToAvoidSecond.push(itfsVertPositionHz - fDeltaDotAbove);
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
          }
          */
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
      
          var indices = new Array(rangesToAvoidFirst.length);
          for (var i = 0; i < rangesToAvoidFirst.length; ++i) indices[i] = i;

          indices.sort(function (a, b) {
            return rangesToAvoidFirst[a] > rangesToAvoidFirst[b] ? 1 : rangesToAvoidFirst[a] < rangesToAvoidFirst[b] ? -1 : 0; 
          });
          // var indicesSorted = new Array(rangesToAvoidFirst.length);
          // for (i = 0; i < rangesToAvoidFirst.length; ++i) indicesSorted[indices[i]] = i;
          //  console.log("ZZ                   indices " + JSON.stringify(indices));
          //t                      console.log("ZZ  ===========currentJ " + JSON.stringify(currentJ));
          //t                      console.log("ZZ  ===========currentShiftedJ " + JSON.stringify(currentShiftedJ));
          const delBefore = currentShiftedJ;
          for (var item = 0; item < rangesToAvoidFirst.length; item++) {

            var it1 = rangesToAvoidFirst [indices[item]];
            var it2 = rangesToAvoidSecond[indices[item]];
             //t        console.log("ZZ                   it1 " + JSON.stringify(it1)  + "   it2 " + JSON.stringify(it2));

            if ((currentShiftedJ < (it1)) && (currentShiftedJ > (it2))) {
                currentShiftedJ = it1;
                 //t                       console.log("ZZ          currentShiftedJ " + JSON.stringify(currentShiftedJ));

            } 
          }
          // if (delBefore > currentShiftedJ )
          //t      console.log("ZZ     ????????????????????????????????? " + JSON.stringify(currentShiftedJ));
          // if (currentJ > currentShiftedJ ) {
          //t   console.log("ZZ    currentJ ????????????????????????????????? " + JSON.stringify(currentJ));
          //t  console.log("ZZ    currentShiftedJ ????????????????????????????????? " + JSON.stringify(currentShiftedJ));
          //}
          //t    console.log("ZZ AA i = " + JSON.stringify(i));

          //if (Math.abs(currentShiftedJ - currentJ)> 0.00001) {
          //t     console.log("before = this.content[first].JvalueShifted " + JSON.stringify(this.content[indexOther].JvalueShifted));
          //t    console.log("before = curthis.content[first].Jvalue " + JSON.stringify(this.content[indexOther].Jvalue));

          this.content[indexOther].JvalueShifted = currentShiftedJ;
          //t       console.log("ZZZZAAAA  this.content[second].JvalueShifted = " + JSON.stringify(currentShiftedJ));

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

  addAssignment(dataColumns, at1, at2, svg, lineWidth, darkMode, generalUseWidth, yJs, smallSpace, blockWidth, pathFun) {
     const daC1 = dataColumns[at1.dataColIndex1];
     const daC2 = dataColumns[at2.dataColIndex1];
     const dataC1 = dataColumns[at1.dataColIndex1].listOfJs[at1.dataColIndex2];
     const dataC2 = dataColumns[at2.dataColIndex1].listOfJs[at2.dataColIndex2];
// f1 = {"isAssigned":false,"indexInAssignementList":9,"isFirstInAssignmentIndex":true,"Jvalue":"2.45","JlevelAvoidContact":2.45}
      if (dataC1.isAssigned == false && dataC1.isAssigned == false) {
        dataC1.isAssigned = true;
        dataC2.isAssigned = true;
        const tmpJvalue = 0.5 * dataC1.Jvalue + 0.5 * dataC2.Jvalue; 

        dataC1.indexInAssignementList = this.content.length;
        dataC2.indexInAssignementList = this.content.length;
        dataC1.isFirstInAssignmentIndex = at1.dataColIndex1 > at2.dataColIndex1;
        dataC2.isFirstInAssignmentIndex = at1.dataColIndex1 < at2.dataColIndex1;

        var theAssignedCouplings = {
          jOKcolor: "black",
          Jvalue: tmpJvalue,
          colNumber1: at1.dataColIndex1,
          colNumber2: at2.dataColIndex1,
          Label: "J_" + daC1.labelColumn + "_" + daC2.labelColumn, // used for highlight of lines
          JvalueAntiOverlap1: +dataC1.JlevelAvoidContact,
          JvalueAntiOverlap2: +dataC2.JlevelAvoidContact,
          JvalueShifted: tmpJvalue,
          indexColumn1: at1.dataColIndex1,
          indexColumn2: at2.dataColIndex1,
          chemShift1: +daC1.chemShift,
          chemShift2: +daC2.chemShift,
          labelColumn1: daC1.labelColumn,
          labelColumn2: daC2.labelColumn,
          lineText: ("J(" + daC1.labelColumn + "," + daC2.labelColumn + ") = " + tmpJvalue + " Hz"),
          xx: 0.0,
          indexInMolFile1: daC1.atomIndexMol,
          indexInMolFile2: daC2.atomIndexMol,
          iindex: this.content.length,
        };
     
        this.content.push(theAssignedCouplings);
         this.addGraphicForLast(svg, lineWidth, darkMode, generalUseWidth, yJs, smallSpace, blockWidth, pathFun); 
      }
      return  svg
      .selectAll(".lineZ")
      ;
  }

     highlightLines(d, darkMode, generalUseWidth, svg, yJs) {
       d3.selectAll(".toBeHidden")
         .transition().duration(10).delay(0)
         .remove();

      var selected_specie = d.Label;
       // first every group turns grey
       d3.selectAll(".lineZ")
         .transition().duration(200)
         .style("stroke", "black")
         .style("opacity", 0.2)
         .transition().duration(200).delay(3000)
         //   .style("stroke", function (d) { return (color(d.Label)) })
         // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
          .style("stroke", function (d) { return getJisOK(d.jOKcolor); } )
          .style("opacity", 0.5)
          ;
       // Second the hovered specie takes its color
       d3.selectAll("." + selected_specie)
         .transition().duration(200)
         //  .style("stroke", color(selected_specie))
         //.style("stroke", getJgraphColor(d.Jvalue, darkMode))
         .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
         .style("opacity", 1.0)
         .transition().duration(200).delay(3000)
         //   .style("stroke", function (d) { return (color(d.Label)) })
         // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
         .style("stroke", function (d) { return getJisOK(d.jOKcolor); })
           .style("opacity", 0.5)
           ;

       var theTextLine2 = svg
         .append("text")
         .attr("class", "toBeHidden")
         .attr("x", d.xx)
         .attr("y", yJs(Math.abs(d.JvalueShifted)) - 3.0)
         .text("" + d.lineText)
         .attr('dx', 1.3 * generalUseWidth)
         .style("font-size", generalUseWidth * 2.5)
         .style("font-family", "Helvetica")
         .style("text-anchor", "middle")
         .transition().duration(100).delay(3000)
         .remove();

       var toto = function (d) { return d.lineText; };
         jmolUnselectAll();
         const atomColorHighlightPairs = [127,255,127];
         jmolSelectPair(d.indexInMolFile1, d.indexInMolFile2, atomColorHighlightPairs);
      
          //https://chemapps.stolaf.edu/jmol/docs/#getproperty
          // What are the directly bound atoms of the two selected hydrogen (we don't test 1J) 
        const at1 = d.indexInMolFile1;
        const at2 = d.indexInMolFile2;  
        var textToDisplay = jmolGetInfo(at1, at2, d.lineText);
       // const nbBond = jmolGetNBbonds(at1, at2);
        document.getElementById("textMainPage").innerHTML = textToDisplay;

        setTimeout(function () {
        jmolUnselectAll();
        //  document.getElementById("textMainPage").innerHTML = defaultText;
				}, 3200);
     };


  makeGraphic(x, svg, lineWidth, darkMode, generalUseWidth, smallSpace, blockWidth, yJs, pathFun) {
 
/*
  const toto2 =  svg
           .selectAll("myPath222")
           .attr("class", "lineW")
           //.data(jGraphData)
           .data(this.content)
           .enter()
           .append("path")
           .attr("class", function (d) { return "line " + d.Label }) // 2 class for each line: 'line' and the group name
           //.attr("d", function (d) { return d3.line()(listOfChemicalShifts.map(function(p) { return [x(p), yJs(d[p])]; })); })
           //.attr("d", this.pathFun)
         .attr("d", d => {this.pathFun(d, yJs, smallSpace, blockWidth);})
        // .attr("d", function (d) { return this.pathFun(d, yJs, smallSpace, blockWidth)})
          // .attr("d", pathFun)
           .style("stroke-width", lineWidth) // "4.0 * 0.0 * 1000.0 * () "
           .style("stroke-dasharray",
             function (d) { return ("" + eval(4.0 * (lineWidth + 1000.0 * (d.Jvalue > 0.0))) + "," + 2.0 * lineWidth); }
           )
           .style("fill", "none")
           .style("stroke", "grey")
           .style("opacity", 0.5)
           .on("click", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);} )
           .on("mouseover", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);})
           ;
          // .on("mouseleave", doNotHighlightLines)}
                  console.log("toto1 = " + JSON.stringify(toto2));
*/
          return svg
           .selectAll("myPath222")
           .attr("class", "lineW")
           //.data(jGraphData)
           .data(this.content)
           .enter()
           .append("path")
           .attr("class", function (d) { return "lineZ " + d.Label }) // 2 class for each line: 'line' and the group name
           //.attr("d", function (d) { return d3.line()(listOfChemicalShifts.map(function(p) { return [x(p), yJs(d[p])]; })); })
          // .attr("d", d => {this.pathFun(d, yJs, smallSpace, blockWidth);})
           .attr("d", pathFun)
           .style("stroke-width", lineWidth) // "4.0 * 0.0 * 1000.0 * () "
           .style("stroke-dasharray",
             function (d) { return ("" + eval(4.0 * (lineWidth + 1000.0 * (d.Jvalue > 0.0))) + "," + 2.0 * lineWidth); }
           )
           .style("fill", "none")
           .style("stroke", function (d) { return getJisOK(d.jOKcolor); })
           .style("opacity", 0.5)
           .on("click", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);} )
           .on("mouseover", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);})
           ;
          // .on("mouseleave", doNotHighlightLines)}

  }


addGraphicForLast(svg, lineWidth, darkMode, generalUseWidth, yJs, smallSpace, blockWidth, pathFun) {
  var tmpCOntent = [];
  tmpCOntent.push(this.content[this.content.length - 1]); // take only last

    return  svg
           .selectAll("myPath222")
           .attr("class", "lineW")
           //.data(jGraphData)
           .data(tmpCOntent) ///////////////////////
           .enter()
           .append("path")
           .attr("class", function (d) { return "lineZ " + d.Label }) // 2 class for each line: 'line' and the group name
           //.attr("d", function (d) { return d3.line()(listOfChemicalShifts.map(function(p) { return [x(p), yJs(d[p])]; })); })
          //.attr("d", d => {this.pathFun(d, yJs, smallSpace, blockWidth);})
           .attr("d", pathFun)
           //.attr("d", function (d) { return this.pathFun(d, yJs, smallSpace, blockWidth);})
           .style("stroke-width", lineWidth) // "4.0 * 0.0 * 1000.0 * () "
           .style("stroke-dasharray",
             function (d) { return ("" + eval(4.0 * (lineWidth + 1000.0 * (d.Jvalue > 0.0))) + "," + 2.0 * lineWidth) }
           )
           /*.attr("d", d3.line()
             //.x(pathx)
             .x(function(d){ listOfChemicalShifts.map(function(p) { return x(p); }); })
             //.y(pathy)
             .y(function(d){ listOfChemicalShifts.map(function(p) { return yJs(d[p]); }) })
           )*/
           .style("fill", "none")
           .style("stroke", function (d) { return getJisOK(d.jOKcolor); })
           .style("opacity", 0.5)
           .on("click", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);} )
           .on("mouseover", d => {this.highlightLines(d, darkMode, generalUseWidth, svg, yJs);})
           ;
          // .on("mouseleave", doNotHighlightLines)}
  }
  /*
      pathFun(d, yJs, smallSpace, blockWidth) {

        
          const y1a = yJs(Math.abs(d.JvalueAntiOverlap1));
          const y1b = yJs(Math.abs(d.JvalueAntiOverlap2));
         // const y2 = yJs(Math.abs(d.JvalueShifted));
         //const iiidex = d.iindex;
           //   console.log("iiidex = " + JSON.stringify(d.iindex));
         //     console.log("assignedCouplings.content[d.iindex].JvalueShifted = " + JSON.stringify(assignedCouplings.content[d.iindex].JvalueShifted));
//console.log("test same... fff = " + JSON.stringify(dataColumns[0]));
// HERE
//const alterative = dataColumns[0].JvalueAntiOverlap1;//
//console.log("test same... = " + JSON.stringify(alterative) + " "  +  JSON.stringify(Math.abs(assignedCouplings.content[d.iindex].JvalueShifted)) );
          const y2 = yJs(Math.abs(this.content[d.iindex].JvalueShifted));
          //const y2 = yJs(Math.abs(d.JvalueShifted));
          const horizontalShiftX = smallSpace - blockWidth - 1.5; // make larger here !
          const horizontalShiftSideBlock = blockWidth; // make larger here !
          var usedHorizontalShiftX = eval(horizontalShiftX);
          var usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
          const cs1 = this.spreadPositionsZZ[d.indexColumn1];
          const cs2 = this.spreadPositionsZZ[d.indexColumn2];
          if (cs1 > cs2) {
             usedHorizontalShiftX = eval(-usedHorizontalShiftX);
             usedHorizontalShiftSideBlock = eval(-usedHorizontalShiftSideBlock);
          }
         
          const fourPoints = [
            [cs1 + usedHorizontalShiftSideBlock, y1a],
            [cs1 + usedHorizontalShiftX, y2], 
            [cs2 - usedHorizontalShiftX, y2],
            [cs2 - usedHorizontalShiftSideBlock, y1b]
          ];   
          

          d.xx = (cs1 + cs2) / 2.0;
          var Gen = d3.line();

          return d3.line()(fourPoints);
        }
*/

  updateTheLines(yJs, smallSpace, blockWidth, pathFun) {
    this.theLinesW
    .transition().duration(1000)
    .attr("d", pathFun)
  }

}