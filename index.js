//import * as d3 from "d3"; // 
import { getJgraphColor } from './src/getJgraphColor.js';
import { getJisOK } from './src/getJisOK.js';
import { updateColumnsPositions } from './src/updateColumnsPositions.js';
import { updateColumnsAction } from './src/updateColumnsAction.js';
import { AssignedCouplings } from './src/assignedCouplings.js';
import { UnassignedCouplings } from './src/unassignedCouplings.js';
//import { pathFun } from './src/pathFun.js'; 
//import { updateChart } from './src/updateChart.js'; 


   //
   // set the dimensions and margins of the graph
   var margin = { top: 10, right: 30, bottom: 30, left: 60 };
   var bodyWidth = 800;
   var bodyHeight = 450;
   var lineWidth = 1.5;
   var maxScaleJ = 22.0;
   var ratioOccupyJgraph = 1.0 / 4.0;
   var circleRadius = 5;
   var spaceBetweenColumns = 10;
   var darkMode = false; // True not implemented
   //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   if ((/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
     circleRadius = 15;
     margin = { top: 50, right: 10, bottom: 30, left: 10 }; // For vertical
     bodyWidth = 800;
     bodyHeight = 1000; // Not good when horizontal....
     lineWidth = 5;
     ratioOccupyJgraph = 1.0 / 2.0;
     spaceBetweenColumns = spaceBetweenColumns / 2.0;
   }
   var circleRadiusSmall = circleRadius / 2;

   var width = bodyWidth - margin.left - margin.right;
   var height = bodyHeight - margin.top - margin.bottom;
   var heightJscale = height * ratioOccupyJgraph;
   var positionJscale = 20;

   var lineWidthCircle = lineWidth;
   var lineWidthColumn = lineWidth / 2;

   var lineWidthCircleSmall = lineWidth / 2;

   var preferedDistanceInPtBetweenColumns = 2.0 * (circleRadius) + lineWidthCircle + spaceBetweenColumns; // In pt

   var topJGraphYposition = 0;
   var bottomJGraphYposition = heightJscale;
   var pointingLineColum = bottomJGraphYposition + 20;


   /*
       const jcccol = getJgraphColor(11.2, darkMode);
       console.log("getJgraphColor :jcccol " + jcccol);
   */
   // append the svg object to the body of the page
   var svg = d3.select("#my_dataviz")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform",
       "translate(" + margin.left + "," + margin.top + ")");
   d3.csv("./androNew.csv", function (jGraphData) {
     // get chemical shifts from lines... should come from other source !
     var arrayColumns = [];
     var labelColumnarray = [];
     var indexAtomMol = []; // atom index in the mol structure
     {
       var labelColumn1 = jGraphData.map(function (d) { return d.labelColumn1; });
       var labelColumn2 = jGraphData.map(function (d) { return d.labelColumn2; });
       var indexArray1 = jGraphData.map(function (d) { return d.indexColumn1; });
       var indexArray2 = jGraphData.map(function (d) { return d.indexColumn2; });
       var chemShift1 = jGraphData.map(function (d) { return d.chemShift1; });
       var chemShift2 = jGraphData.map(function (d) { return d.chemShift2; });
       var indexInMolFile1 = jGraphData.map(function (d) { return d.indexInMolFile1; });
       var indexInMolFile2 = jGraphData.map(function (d) { return d.indexInMolFile2; });
       //index 1
       for (i = 0; i < chemShift1.length; i++) {
         const index1 = indexArray1[i];
         const index2 = indexArray2[i];
         arrayColumns[index1 - 1] = chemShift1[i];
         arrayColumns[index2 - 1] = chemShift2[i];
         labelColumnarray[index1 - 1] = labelColumn1[i];
         labelColumnarray[index2 - 1] = labelColumn2[i];
         indexAtomMol[index1 - 1] = indexInMolFile1[i];
         indexAtomMol[index2 - 1] = indexInMolFile2[i];    
       }
     }

     var unassignedCouplings = new UnassignedCouplings(jGraphData);
     var assignedCouplings = new AssignedCouplings(jGraphData);

     // sort arrayColumns by decreasing values of chemical shift
     var len = arrayColumns.length;
     var indices = new Array(len);
     for (var i = 0; i < len; ++i) indices[i] = i;
     indices.sort(function (a, b) {
       return arrayColumns[a] < arrayColumns[b] ? 1 : arrayColumns[a] > arrayColumns[b] ? -1 : 0; 
     });
     var indicesSorted = new Array(len);
     for (i = 0; i < len; ++i) indicesSorted[indices[i]] = i;

     // renumber index jGraphData(from 0 instead of 1 and decreasing chemical shift)
    /* for (i = 0; i < jGraphData.length; ++i) {
       jGraphData[i].indexColumn1 = indicesSorted[jGraphData[i].indexColumn1 - 1];
       jGraphData[i].indexColumn2 = indicesSorted[jGraphData[i].indexColumn2 - 1];
     }*/

     var dataColumns = [];
     for (i = 0; i < arrayColumns.length; i++) {
       dataColumns.push({
         'chemShift': arrayColumns[indices[i]],
         'labelColumn': labelColumnarray[indices[i]],
         'MyIndex': i,
         'atomIndexMol': indexAtomMol[indices[i]],
       });
     }

     var dataUnassignedCoupCircles = [];
     for (i = 0; i < unassignedCouplings.content.length; i++) {
       const inInd1 = indicesSorted[unassignedCouplings.content[i].colNumber1];
       const inInd2 = indicesSorted[unassignedCouplings.content[i].colNumber2];
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd1],
         'value': unassignedCouplings.content[i].Jvalue,
         'MyIndex': inInd1,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd2],
         'value': unassignedCouplings.content[i].Jvalue,
         'MyIndex': inInd2,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
     }

     var dataAssignedCoupCircles = [];
     for (i = 0; i < assignedCouplings.content.length; i++) {
       {
         const inInd = indices2[assignedCouplings.content[i].colNumber1];
         dataAssignedCoupCircles.push({
           'chemShift': arrayColumns[inInd],
           'value': assignedCouplings.content[i].Jvalue,
           'MyIndex': inInd,
           'uniqIndex': dataAssignedCoupCircles.length,
         });
       }
       {
         const inInd = indices2[assignedCouplings.content[i].colNumber2];
         dataAssignedCoupCircles.push({
           'chemShift': arrayColumns[inInd],
           'value': assignedCouplings.content[i].Jvalue,
           'MyIndex': inInd,
           'uniqIndex': dataAssignedCoupCircles.length,
         });
       }
     }

     for (i = 0; i < assignedCouplings.content.length; i++) {
       assignedCouplings.content[i].indexColumn1 = indicesSorted[assignedCouplings.content[i].indexColumn1 - 1];
       assignedCouplings.content[i].indexColumn2 = indicesSorted[assignedCouplings.content[i].indexColumn2 - 1];
     }

     assignedCouplings.udateLineTrajectory();

     // Make list of positions according to size of jGraphData
     const numberItem = arrayColumns.length;
     var smallSpace = width / (numberItem + 1); // five items, six spaces
     if (smallSpace > preferedDistanceInPtBetweenColumns) {
       smallSpace = preferedDistanceInPtBetweenColumns;
     }

     var leftPosColumns = [];
     var rightPosColumns = [];
     for (i = 0; i < numberItem; i++) {
       const curPosLeft = (i + 0.5) * smallSpace;
       const curPosRight = width - ((numberItem - i) - 0.5) * smallSpace;
       leftPosColumns.push(curPosLeft);
       rightPosColumns.push(curPosRight);
     }

     console.log("Left pos :" + JSON.stringify(leftPosColumns));
     console.log("Right pos :" + JSON.stringify(rightPosColumns));

     var yJs = d3.scaleLinear()
       .domain([0, maxScaleJ])
       .range([heightJscale + positionJscale, positionJscale]);
     var yAxisn = svg.append("g")
       .call(d3.axisLeft(yJs).ticks(3));

      var highlightColumn = function (d) {
				Jmol.script(JmolAppletA, "select hydrogen; color white");
				const number = d.atomIndexMol;
				Jmol.script(JmolAppletA,"select atomno = " + number + ";color [127,255,127];spacefill 80");
				setTimeout(function () {
					Jmol.script(JmolAppletA, "select hydrogen; color white");
				}, 3200);
			};

     var highlightLines = function (d) {
       d3.selectAll(".toBeHidden")
         .transition().duration(10).delay(0)
         .remove();
      var selected_specie = d.Label;
       // first every group turns grey
       d3.selectAll(".line")
         .transition().duration(200)
         .style("stroke", "black")
         .style("opacity", "0.2")
         .transition().duration(200).delay(3000)
         //   .style("stroke", function (d) { return (color(d.Label)) })
         // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
         .style("stroke", function (d) { return getJisOK(d.jOKcolor); })
         .style("opacity", "1");

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
         .style("opacity", "1");;


       var theTextLine2 = svg
         .append("text")
         .attr("class", "toBeHidden")
         .attr("x", d.xx)
         .attr("y", yJs(Math.abs(d.JvalueShifted)) - 3.0)
         .text("" + d.lineText)
         .attr('dx', 1.3 * circleRadius)
         .style("font-size", circleRadius * 2.5)
         .style("font-family", "Helvetica")
         .style("text-anchor", "middle")
         .transition().duration(100).delay(3000)
         .remove();

       var toto = function (d) { return d.lineText; };

         Jmol.script(JmolAppletA,"select hydrogen; color white");
         Jmol.script(JmolAppletA,"select atomno = " + d.indexInMolFile1 + ";color [127,255,127];spacefill 80");
         Jmol.script(JmolAppletA,"select atomno = " + d.indexInMolFile2 + ";color [127,255,127];spacefill 80");
      
          //https://chemapps.stolaf.edu/jmol/docs/#getproperty
          // What are the directly bound atoms of the two selected hydrogen (we don't test 1J)   
          const at1 = d.indexInMolFile1;
          const at2 = d.indexInMolFile2;
          var at1to = -1;
          var at2to = -1;
          var bondInfo = Jmol.getPropertyAsArray(JmolAppletA, "bondInfo");
          var atomInfo = Jmol.getPropertyAsArray(JmolAppletA, "atomInfo");

/*
https://chemapps.stolaf.edu/jmol/docs/#getproperty

https://chemapps.stolaf.edu/jmol/docs/misc/bondInfo.txt

https://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
atomInfo[0].bondCount=1
atomInfo[0].atomno=1
atomInfo[0].elemno=1
atomInfo[0].z=0
atomInfo[0].y=-0.8425599
atomInfo[0].x=1.0406722
atomInfo[0].partialCharge=0.1744213
atomInfo[0].sym="H"
atomInfo[0].colix=-32767
atomInfo[0].info="H 1/1 #1"
atomInfo[0]._ipt=0
atomInfo[0].formalCharge=0
*/

          for (var i = 0; i < bondInfo.length; i++) {
            const atom1 = bondInfo[i].atom1.atomno;
            const atom2 = bondInfo[i].atom2.atomno;
            if (atom1 == at1) at1to = atom2;
            if (atom1 == at2) at2to = atom2;
            if (atom2 == at1) at1to = atom1;
            if (atom2 == at2) at2to = atom1; 
          }
          const defaultText = "More than 4 bonds apart!";
          var textToDisplay = defaultText;
          if (at1to > -1 && at2to > -1) {
            // Is this 2J, 3J, 4J ?
            // Important note: A pair may be both 3J and 4J (think of cyclopropane)
            if (at1 == at2to && at2 == at1to) { // is a 1J
               // var distance = Jmol.evaluateVar(JmolAppletA, "distance(@" + at1 + ", @" + at2 + ")") 
               // console.log("2J, angle H-X-H : " + distance.toFixed(2));
               textToDisplay = "1" + d.lineText ;
            } else {
              if (at1to == at2to) { // is a 2J
                 const elementNumber = atomInfo[at1to - 1].elemno;
                 const numberOfBonds = atomInfo[at1to - 1].bondCount;
                 // const partialCharge = atomInfo[at1to - 1].partialCharge;
                 var theta = Jmol.evaluateVar(JmolAppletA, "angle(@" + at1 + ", @" + at1to + ", @" + at2 + ")");
                 textToDisplay = ("<sup>2</sup>" + d.lineText + " angle H-X-H : " + theta.toFixed(2));
                 if (elementNumber == 6 && numberOfBonds == 4) { // is sp3
                    textToDisplay += " sp3 carbon";
                 }
                 if (elementNumber == 6 && numberOfBonds == 3) { // is sp2
                    textToDisplay += " sp2 carbon";
                 }
                 if (elementNumber == 6 && numberOfBonds == 2) { // is sp1
                    textToDisplay += " sp1 carbon";
                 }
              } else {
                var tmps = at1to;
                var tmpl = at2to;
                if (tmps > tmpl) {const tmpz = tmps; tmps = tmpl; tmpl = tmpz;}
                var middleAtomFro4J = -1;
                for (var i = 0; i < bondInfo.length; i++) {
                  var atomsi = bondInfo[i].atom1.atomno;
                  var atomli = bondInfo[i].atom2.atomno;
                  if (atomsi > atomli) {const tmpz = atomsi; atomsi = atomli; atomli = tmpz;}
                  if (tmps == atomsi && tmpl == atomli) { // is a 3J
                    const elementNumber1 = atomInfo[at1to - 1].elemno;
                    const numberOfBonds1 = atomInfo[at1to - 1].bondCount;
                    const elementNumber2 = atomInfo[at2to - 1].elemno;
                    const numberOfBonds2 = atomInfo[at2to - 1].bondCount;
                    var theta = Jmol.evaluateVar(JmolAppletA, "angle(@" + at1 + ", @" + at1to + ", @" + at2to + ", @" + at2 + ")"); 
                    textToDisplay = ("<sup>3</sup>" + d.lineText + " dihedral angle H-X-X-H : " + theta.toFixed(2));
                    if (elementNumber1 == 6 && numberOfBonds1 == 4 && elementNumber2 == 6 && numberOfBonds2 == 4) {
                      textToDisplay += " on C-C bond";
                    }
                    if (elementNumber1 == 6 && numberOfBonds1 == 2 && elementNumber2 == 6 && numberOfBonds2 == 2) {
                      textToDisplay += " on C=C bond";
                    }
                    break;
                  }
                  for (var j = 0; j < bondInfo.length; j++) {
                    if (bondInfo[i].atom1.atomno == at1to && bondInfo[j].atom1.atomno == at2to && bondInfo[i].atom2.atomno == bondInfo[j].atom2.atomno) middleAtomFro4J = bondInfo[i].atom2.atomno;
                    if (bondInfo[i].atom2.atomno == at1to && bondInfo[j].atom1.atomno == at2to && bondInfo[i].atom1.atomno == bondInfo[j].atom2.atomno) middleAtomFro4J = bondInfo[i].atom1.atomno;
                    if (bondInfo[i].atom1.atomno == at1to && bondInfo[j].atom2.atomno == at2to && bondInfo[i].atom2.atomno == bondInfo[j].atom1.atomno) middleAtomFro4J = bondInfo[i].atom2.atomno;
                    if (bondInfo[i].atom2.atomno == at1to && bondInfo[j].atom2.atomno == at2to && bondInfo[i].atom1.atomno == bondInfo[j].atom1.atomno) middleAtomFro4J = bondInfo[i].atom1.atomno;
                  }
                  if (middleAtomFro4J > -1) { // is a 4J
                    textToDisplay = ("<sup>4</sup>" + d.lineText + " via (@" + at1 + ", @" + at1to + ", @" + middleAtomFro4J +", @" + at2to + ", @" + at2 + ")" );
                    // here don't break in case a 4J is replaced with a 3J.
                  }
                }
              }
            }
          }
        document.getElementById("textMainPage").innerHTML = textToDisplay;

        setTimeout(function () {
					Jmol.script(JmolAppletA, "select hydrogen; color white");
        //  document.getElementById("textMainPage").innerHTML = defaultText;
				}, 3200);
     };

     // Unhighlight
            /*

     var doNotHighlightLines = function (toto) {

    //  Jmol.script(JmolAppletA,"select hydrogen; color white");

        d3.selectAll(".line")
          .transition().duration(200).delay(300)
          //   .style("stroke", function (d) { return (color(d.Label)) })
          // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
          .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
          .style("opacity", "1")
     };
*/

     var highlightDot = function (d) {
      var x = d3.scaleLinear();

      var spreadPositionsNew = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace);

       //unselect hydrogens
       Jmol.script(JmolAppletA,"select hydrogen; color white");

       const delayBeforeErase = 3000;

       d3.selectAll(".line")
         .transition().duration(200)
         .style("stroke", "black")
         .style("opacity", "0.1")
         .transition().duration(20).delay(delayBeforeErase)
         .style("stroke", function (d) { return getJisOK(d.jOKcolor); })
         .style("opacity", "1");

       var theTextDots2 = svg.selectAll("textt")
         .data(dataUnassignedCoupCircles)
         .enter()
         .append("text")
         .attr("class", function (d) { return "textCircle" + d.uniqIndex; })
         .attr("y", function (d) { return yJs(Math.abs(d.value)); })
         // .style("fill", "gray")
         //   .attr("stroke", "red")
         // .style("stroke-width", lineWidthCircleSmall)
         .text(function (d) { return "J = " + d.value; })
         .attr('dx', 1.3 * circleRadius)
         .style("font-size", circleRadius * 2.5)
         .style("font-family", "Helvetica")
         .attr("x", function (d) { return spreadPositionsNew[d.MyIndex]; })
         .attr("transform", function (d) { return "rotate(-45," + spreadPositionsNew[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
         .attr("opacity", 0.0)
         .transition().duration(100).delay(3000)
         .remove();

       // first every group dimmed
       d3.selectAll(".circleL")
         .transition().duration(200).delay(0)
         .style("stroke", "black")
         .style("opacity", "0.1")
         .style("stroke-width", lineWidth);

       // specific to those matching the condition of similarity of J's
       var numberCandidate = 0;
       const deltaSearchJ = 0.5;
       d3.selectAll(".circleL")
         .filter(function (p) {
           if (Math.abs(d.value - p.value) <= deltaSearchJ)
             if (d.uniqIndex != p.uniqIndex)
               numberCandidate++;
         });

       // select color when only one candidate, or more ...
       var highColor = "green";
       if (numberCandidate > 1)
         highColor = "red";

       const highlightWidth = lineWidth * 2.0;
       d3.selectAll(".circleL")
         .transition().duration(10).delay(300)
         .filter(function (p) { return (Math.abs(d.value - p.value) <= deltaSearchJ) && (d.uniqIndex != p.uniqIndex) })
         .style("stroke", highColor)
         .style("opacity", "1.0")
         .style("stroke-width", highlightWidth);

       d3.selectAll(".circleL")
         .transition().duration(200).delay(delayBeforeErase)
         .style("stroke", "black")
         .style("opacity", "1.0")
         .style("stroke-width", lineWidth);

       d3.selectAll(".rulerClass")
         .transition().duration(200).delay(0)
         .attr("y1", yJs(Math.abs(d.value)))
         .attr("y2", yJs(Math.abs(d.value)))
         .style("opacity", '1.0')
         .style("stroke", highColor)
         .transition().duration(200).delay(delayBeforeErase)
         .attr("y1", yJs(Math.abs(d.value)))
         .attr("y2", yJs(Math.abs(d.value)))
         .style("opacity", '0.0')
         .style("stroke", "black");

       d3.select(this)
         .transition(10).duration(200)
         .style("opacity", "1.0")
         .style("stroke", "black")
         .style("stroke-width", lineWidth);

       var selectedCicle = "textCircle" + d.uniqIndex;
       d3.selectAll("." + selectedCicle)
         .transition().duration(100).delay(10)
         .style("opacity", "1.0")
         .transition().duration(200).delay(delayBeforeErase)
         .style("opacity", "0.0");
     };

     //  Unhighlight
     /*    var doNotHighlightDot = function (d) {
           d3.selectAll(".circleL")
             .transition().duration(200).delay(300)
             .style("opacity", "1")
           selected_specie = "textCircle" + d.uniqIndex;
   
           d3.selectAll("." + selected_specie)
             .transition().duration(200).delay(3000)
             // .style("stroke", color(selected_specie))
             .style("opacity", "0")
   
           d3.selectAll(".rulerClass")
             .transition().duration(200).delay(3000)
             .attr("y1", yJs(0.0))
             .attr("y2", yJs(0.0))
             .style("opacity", '0.0')
         }
   */
   
     d3.csv("./Androsten_forMult_analysis.csv",
       // format variables:
       function (d) {
         return { chemShift: d.x, value: d.y};
       },

       function (chemShift) {
         // Add X axis 
         var x = d3.scaleLinear()
           .domain([
             d3.max(chemShift, function (d) { return +d.chemShift; }),
             d3.min(chemShift, function (d) { return +d.chemShift; })
           ])
           .range([0, width]);
           var xAxis = svg.append("g")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x))
           ;

         // Add Y axis2
         var yAxisn2 = svg.append("g")
           .attr("transform", function (d) { return "translate(" + (width) + ")"; })
           .call(d3.axisRight(yJs).ticks(3))
           ;
         var dataTicksLines = [0, 5, 10, 15, 20];
         var theTicksLines = svg
           .selectAll("tickLines")
           .data(dataTicksLines)
           .enter()
           .append("line")
           .attr("class", "Grid")
           .attr("x1", lineWidth)
           .attr("y1", function (d) { return yJs(d); })
           .attr("x2", width)
           .attr("y2", function (d) { return yJs(d); })
           .attr("stroke", "#EEEEEE")
           .style("stroke-width", lineWidth)
           ;

         var theRuler = svg
           .selectAll("theRuler")
           .data(dataTicksLines)
           .enter()
           .append("line")
           .attr("class", "rulerClass")
           .attr("x1", lineWidth)
           .attr("y1", yJs(0.0))
           .attr("x2", width)
           .attr("y2", yJs(0.0))
           .attr("stroke", "red")
           .style("stroke-dasharray", [lineWidth * 2, lineWidth * 2])
           .style("stroke-width", lineWidth)
           .style("opacity", '0.0')
           ;

         var dimensions = [1, 1.2, 1.3, 2, 3, 5];
         /*
         var yn = {};
         for (i in dimensions) {
           var name = dimensions[i];
           yn[name] = d3.scaleLinear()
             .domain([0.0, 22.0]) // --> Same axis range for each group
             // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
             .range([height / 3.0, height / 6.0]);
         }
         */

         // Add Y axis
         var y = d3.scaleLinear()
           .domain([0, d3.max(chemShift, function (d) { return +d.value; })])
           .range([height, 0]);
         //yAxis = svg.append("g") .call(d3.axisLeft(y));

         // Add a clipPath: everything out of this area won't be drawn.
         var clip = svg.append("defs").append("svg:clipPath")
           .attr("id", "clip")
           .append("svg:rect")
           .attr("width", width)
           .attr("height", height)
           .attr("x", 0)
           .attr("y", 0);

         // Add brushing
         var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
           .extent([[0, 0], [width, height]])  // initialize the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
           .on("end", updateChart);             // Each time the brush selection changes, trigger the 'updateChart' function

         // Create the line variable: where both the line and the brush take place
         var lineSpectrum = svg.append('g')
           .attr("clip-path", "url(#clip)");

         // Add the spectrum
         lineSpectrum.append("path")
           .datum(chemShift)
           .attr("class", "lineG")  // add the class line to be able to modify this line later on.
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           // .attr("stroke", "red")
           .attr("stroke-width", lineWidth)
           .attr("d", d3.line()
             .x(function (d) { return x(d.chemShift);})
             .y(function (d) { return y(d.value);})
           );



         // Columns
         const colorShowLine = "#CCCCCC";
         const colorHideLine = "#EEEEEE00";
         // oblique
         var spreadPositionsUU = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace);

         var theColumns1 = svg.selectAll("columnns")
           .data(dataColumns)
           .enter()
           .append("line")
           .attr("class", "ColunnSegment1")
           .attr("x1", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("x2", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("y1", function (d) { return bottomJGraphYposition + positionJscale; })
           .attr("y2", function (d) { return pointingLineColum + positionJscale; })
           .attr("stroke", colorHideLine) // just sketched... update wil fix colors
           .style("stroke-width", lineWidthCircle)
           .on("click", highlightColumn)
           .on("mouseover", highlightColumn)
           ;

         // streight down
         var theColumns2 = svg.selectAll("ColunnSegment2")
           .data(dataColumns)
           .enter()
           .append("line")
           .attr("class", "Colunn")
           .attr("x1", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("x2", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("y1", function (d) { return pointingLineColum + positionJscale; })
           .attr("y2", function (d) { return height; })
           .attr("stroke", colorHideLine) // just sketched... update wil fix colors
           .style("stroke-width", lineWidthCircle)
           .on("click", highlightColumn)
           .on("mouseover", highlightColumn)
           ;

         var theColumns3 = svg.selectAll("ColunnSegment3")
           .data(dataColumns)
           .enter()
           .append("line")
           .attr("class", "Colunn")
           .attr("x1", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("x2", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("y1", function (d) { return topJGraphYposition + positionJscale; })
           .attr("y2", function (d) { return bottomJGraphYposition + positionJscale; })
           .attr("stroke", "black") // just sketched... update wil fix colors
           .style("stroke-width", lineWidthColumn)
           .on("click", highlightColumn)
           .on("mouseover", highlightColumn);


         var theColumns4 = svg.selectAll("ColunnSegment4")
           .data(dataColumns)
           .enter()
           .append("line")
           .attr("class", "Colunn")
           .attr("x1", function (d) { return spreadPositionsUU[d.MyIndex] + circleRadius; })
           .attr("x2", function (d) { return spreadPositionsUU[d.MyIndex] - circleRadius; })
           .attr("y1", function (d) { return bottomJGraphYposition + positionJscale; })
           .attr("y2", function (d) { return bottomJGraphYposition + positionJscale; })
           .attr("stroke", "black") // just sketched... update wil fix colors
           .style("stroke-width", lineWidthCircle)
           .on("click", highlightColumn)
           .on("mouseover", highlightColumn);


         var theColumnLabel = svg.selectAll("textc")
           .data(dataColumns)
           .enter()
           .append("text")
           .attr("class", function (d) { return "textColumn" + d.uniqIndex; })
           .attr("x", function (d) { return spreadPositionsUU[d.MyIndex]; })
           .attr("y", function (d) { return -3 + topJGraphYposition + positionJscale; })
           // .text(function (d) { return "" + d.chemShift; })
           .text(function (d) { return "" + d.labelColumn; })
           .attr('dx', -1.0 * circleRadius)
           .style("font-size", circleRadius * 2.5)
           .style("font-family", "Helvetica")
           .on("click", highlightColumn)
           .on("mouseover", highlightColumn);
         //.style("font-weight", "2pt")            
         // Lines
        
         function pathFun(d) {
          /*
              ________
             /        |
          */
          const y1 = yJs(Math.abs(d.Jvalue));
          const y2 = yJs(Math.abs(d.JvalueShifted));
          const horizontalShiftX = circleRadius;
          var usedHorizontalShiftX = eval(horizontalShiftX);
          const cs1 = spreadPositionsZZ[d.indexColumn1];
          const cs2 = spreadPositionsZZ[d.indexColumn2];
          if (cs1 > cs2) {
             usedHorizontalShiftX = eval(- usedHorizontalShiftX);
          }
          const x1p = ((cs1) + usedHorizontalShiftX);
          const x2p = ((cs2) - usedHorizontalShiftX);
          const combine = [[cs1, y1], [x1p, y2], [x2p, y2], [cs2, y1]];
          d.xx = (cs1 + cs2) / 2.0;
          var Gen = d3.line();

          return Gen(combine);
        }

         var spreadPositionsZZ = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace);
         var theLinesW = svg
           .selectAll("myPath222")
           .attr("class", "lineW")
           //.data(jGraphData)
           .data(assignedCouplings.content)
           .enter()
           .append("path")
           .attr("class", function (d) { return "line " + d.Label }) // 2 class for each line: 'line' and the group name
           //.attr("d", function (d) { return d3.line()(listOfChemicalShifts.map(function(p) { return [x(p), yJs(d[p])]; })); })
           .attr("d", pathFun)
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
           .style("stroke", "grey")
           .style("opacity", 0.5)
           .on("click", highlightLines)
           .on("mouseover", highlightLines)
           ;
          // .on("mouseleave", doNotHighlightLines)

         // Circles
         var theDots = svg.selectAll("dots")
           .data(dataUnassignedCoupCircles)
           .enter()
           .append("circle")
           .attr("class", "circleL")
           .attr("cx", function (d) { return x(d.chemShift); })
           .attr("cy", function (d) { return yJs(Math.abs(d.value)); })
           .attr("r", circleRadius)
           .style("fill",  function (d) { return getJgraphColor(Math.abs(d.value), darkMode); })
           .attr("stroke", "black")
           .style("stroke-width", lineWidthCircle)
           .on("mouseover", highlightDot)
           .on("click", highlightDot)
           ;
         // .on("mouseleave", doNotHighlightDot)

         // Dots
         var theDots2 = svg.selectAll("dots")
           .data(dataAssignedCoupCircles)
           .enter()
           .append("circle")
           .attr("class", "circleS")
           .attr("cx", function (d) { return x(d.chemShift); })
           .attr("cy", function (d) { return yJs(Math.abs(d.value)); })
           .attr("r", circleRadiusSmall)
           .style("fill",function (d) { return getJgraphColor(Math.abs(d.value), darkMode); })
           .attr("stroke", "black")
           .style("stroke-width", lineWidthCircleSmall)
           ;

         updateColumnsAction(spreadPositionsZZ, 0, positionJscale, topJGraphYposition, colorShowLine, colorHideLine, circleRadius, x, width, theColumns1, theColumns2, theColumns3, theColumns4, theDots, theDots2, theColumnLabel);

         // Add the brushing
         lineSpectrum
           .append("g")
           .attr("class", "brush")
           .call(brush)
           ;

         // A function that set idleTimeOut to null
         var idleTimeout;
         function idled() { idleTimeout = null; }

         // A function that update the chart for given boundaries
        
         function updateChart() {

          // What are the selected boundaries?
          var extent = d3.event.selection;

          // If no selection, back to initial coordinate. Otherwise, update X axis domain
          if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([
              d3.max(chemShift, function (d) {return +d.chemShift;}),
              d3.min(chemShift, function (d) {return +d.chemShift;}),
            ])
          } else {
            x.domain([
              x.invert(extent[0]),
              x.invert(extent[1]),
            ])
            lineSpectrum.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
          }

          // Update axis and line position
          xAxis.transition().duration(1000).call(d3.axisBottom(x))

          lineSpectrum
            .select('.lineG')
            .transition().duration(1000)
            .attr("d", d3.line()
              .x(function (d) { return x(d.chemShift) })
              .y(function (d) { return y(d.value) })
            )

          spreadPositionsZZ = updateColumnsPositions(dataColumns, leftPosColumns, x, rightPosColumns, smallSpace);
          updateColumnsAction(spreadPositionsZZ, 1000, positionJscale, topJGraphYposition, colorShowLine, colorHideLine, circleRadius, x, width, theColumns1, theColumns2, theColumns3, theColumns4, theDots, theDots2, theColumnLabel);
          theLinesW
            //.select('.lineW')
            .transition().duration(1000)
            .attr("d", pathFun)
        }

        // If user double click, reinitialize the chart
        svg.on("dblclick", function () {
          x.domain([
            d3.max(chemShift, function (d) { return +d.chemShift; }),
            d3.min(chemShift, function (d) { return +d.chemShift; })
          ])
          xAxis.transition().call(d3.axisBottom(x))
          lineSpectrum
            .select('.line')
            .transition()
            .attr("d", d3.line()
              .x(function (d) { return x(d.chemShift) })
              .y(function (d) { return y(d.value) })
            )
        });

      }) // reading file 1
    }) // reading file 2


