//Jmol.getApplet("JmolAppletA", Cholest);
//JmolAppletA("reset");
//Jmol.script(JmolAppletA,"spin on");

   //    Cholest.jmolButton(myJmol, "reset", "Reset to original orientation");

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

   function getJgraphColor(Jcoupling, darkmode) {
     // https://nmredatainitiative.github.io/color-map-J-coupling/
     // input
     // Color maps. First color for 0 Hz, second color for 2 Hz, etc. up to 20 Hz

     var colormap = [0, 1, 1, 0, 1, 0, 0.8, 0.8, 0, 0.9, 0.4, 0, 1, 0, 0, 1, 0, 0.5, 1, 0, 1, 0.5, 0, 1, 0, 0, 1, 0, 0, 0.5, 0, 0, 0]; // for white background
     if (darkmode) {
       colormap = [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0.5, 0, 1, 0, 0, 1, 0, 0.5, 1, 0, 1, 0.5, 0, 0.9, 0.2, 0.2, 1, 0.4, 0.4, 0.5, 1, 1, 1]; // for black background
     }

     const JcouplingAbs = Math.abs(Jcoupling); // Hz
     var baseColorInt = Math.floor(JcouplingAbs / 2.0); // -20 - 20.0 ->  0 - 9 
     if (baseColorInt > 9) baseColorInt = 9; // baseColorInt 0 - 9
     var adjust = +(JcouplingAbs - 2.0 * baseColorInt) / 2.0; // normalized diff (0-1) for 2 Hz
     if (adjust > 1.0) adjust = 1.0; // adjust 0 - 1.0
     const baseColorIndex = 3 * baseColorInt; // 3 because RGB

     // the loop is language dependent, lets drop it...
     const r = Math.floor(+255.0 * colormap[baseColorIndex + 0] + adjust * (colormap[baseColorIndex + 3 + 0] - colormap[baseColorIndex + 0]));
     const g = Math.floor(+255.0 * colormap[baseColorIndex + 1] + adjust * (colormap[baseColorIndex + 3 + 1] - colormap[baseColorIndex + 1]));
     const b = Math.floor(+255.0 * colormap[baseColorIndex + 2] + adjust * (colormap[baseColorIndex + 3 + 2] - colormap[baseColorIndex + 2]));

     //const negExpVal = (Jcoupling < 0.0); // used to change line type for negative values.                   

     return (["rgb(", r, ",", g, ",", b, ")"].join(""));
   }
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
     var unassignedCouplings = []; // marked with label "noAssignement" in file
     var theAssignedCouplings = [];
     var labelColumnarray = [];

     {
       var curChemShiftToReplace1 = [];
       var curChemShiftToReplace2 = [];
       var indexArray1 = [];
       var indexArray2 = [];

       curChemShiftToReplace1 = jGraphData.map(function (d) { return d.chemShift1; })
       curChemShiftToReplace2 = jGraphData.map(function (d) { return d.chemShift2; })
       labelColumn1 = jGraphData.map(function (d) { return d.labelColumn1; })
       labelColumn2 = jGraphData.map(function (d) { return d.labelColumn2; })
       indexArray1 = jGraphData.map(function (d) { return d.indexColumn1; })
       indexArray2 = jGraphData.map(function (d) { return d.indexColumn2; })
       label = jGraphData.map(function (d) { return d.Label; })
       Jvalue = jGraphData.map(function (d) { return d.Jvalue; })
       JvalueShifted = jGraphData.map(function (d) { return d.JvalueShifted; })
       indexColumn1 = jGraphData.map(function (d) { return d.indexColumn1; })
       indexColumn2 = jGraphData.map(function (d) { return d.indexColumn2; })
       chemShift1 = jGraphData.map(function (d) { return d.chemShift1; })
       chemShift2 = jGraphData.map(function (d) { return d.chemShift2; })
       indexInMolFile1 = jGraphData.map(function (d) { return d.indexInMolFile1; })
       indexInMolFile2 = jGraphData.map(function (d) { return d.indexInMolFile2; })
       //index 1
       for (i = 0; i < curChemShiftToReplace1.length; i++) {
         const index1 = indexArray1[i];
         const index2 = indexArray2[i];
         arrayColumns[index1 - 1] = curChemShiftToReplace1[i];
         arrayColumns[index2 - 1] = curChemShiftToReplace2[i];
         labelColumnarray[index1 - 1] = labelColumn1[i];
         labelColumnarray[index2 - 1] = labelColumn2[i];
         if (label[i] == "noAssignement") {
           unassignedCouplings.push({
             Jvalue: +Jvalue[i],
             colNumber1: (index1 - 1),
             colNumber2: (index2 - 1),
           })
         } else {
           theAssignedCouplings.push({
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
           })
         }
       }
     }
     console.log("unassignedCouplings :" + JSON.stringify(unassignedCouplings))
     console.log("arrayColumns1 " + arrayColumns);

     // sort by decreasing values
     var len = arrayColumns.length;
     var indices = new Array(len);
     for (var i = 0; i < len; ++i) indices[i] = i;
     indices.sort(function (a, b) { return arrayColumns[a] < arrayColumns[b] ? 1 : arrayColumns[a] > arrayColumns[b] ? -1 : 0; });
     // console.log("arrayColumns2 " + arrayColumns);
     //arrayColumns.sort().reverse();
     var indices2 = new Array(len);
     for (var i = 0; i < len; ++i) indices2[indices[i]] = i;
     var indices3 = new Array(len); for (var i = 0; i < len; ++i) indices3[i] = indices[i];
     //  console.log("arrayColumns indices2 " + indices2);
     //  console.log("arrayColumns indices3 " + indices3);

     // renumber index jGraphData(from 0 instread of 1 and decreasing chemical shift)
     for (var i = 0; i < jGraphData.length; ++i) {
       //  console.log("arrayColumnsTTTT  " + i + " " + jGraphData[i].indexColumn1);
       jGraphData[i].indexColumn1 = indices2[jGraphData[i].indexColumn1 - 1];
       jGraphData[i].indexColumn2 = indices2[jGraphData[i].indexColumn2 - 1];
     }

     var dataColumns = [];
     for (i = 0; i < arrayColumns.length; i++) {
       dataColumns.push({
         'chemShift': arrayColumns[indices[i]],
         'labelColumn': labelColumnarray[indices[i]],
         'MyIndex': i,
       });
     }

     var dataUnassignedCoupCircles = [];
     for (i = 0; i < unassignedCouplings.length; i++) {
       const inInd1 = indices2[unassignedCouplings[i].colNumber1];
       const inInd2 = indices2[unassignedCouplings[i].colNumber2];
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd1],
         'value': unassignedCouplings[i].Jvalue,
         'MyIndex': inInd1,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
       dataUnassignedCoupCircles.push({
         'chemShift': arrayColumns[inInd2],
         'value': unassignedCouplings[i].Jvalue,
         'MyIndex': inInd2,
         'uniqIndex': dataUnassignedCoupCircles.length,
       });
     }

     var dataAssignedCoupCircles = [];
     for (i = 0; i < theAssignedCouplings.length; i++) {
       {
         const inInd = indices2[theAssignedCouplings[i].colNumber1];
         dataAssignedCoupCircles.push({
           'chemShift': arrayColumns[inInd],
           'value': theAssignedCouplings[i].Jvalue,
           'MyIndex': inInd,
           'uniqIndex': dataAssignedCoupCircles.length,
         });
       }
       {
         const inInd = indices2[theAssignedCouplings[i].colNumber2];
         dataAssignedCoupCircles.push({
           'chemShift': arrayColumns[inInd],
           'value': theAssignedCouplings[i].Jvalue,
           'MyIndex': inInd,
           'uniqIndex': dataAssignedCoupCircles.length,
         });
       }
     }

     for (i = 0; i < theAssignedCouplings.length; i++) {
       theAssignedCouplings[i].indexColumn1 = indices2[theAssignedCouplings[i].indexColumn1 - 1];
       theAssignedCouplings[i].indexColumn2 = indices2[theAssignedCouplings[i].indexColumn2 - 1];
     }

     // Make list of positions accoding to size of jGraphData
     const numberItem = arrayColumns.length;  //
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

     console.log("Left pos :" + JSON.stringify(leftPosColumns))
     console.log("Right pos :" + JSON.stringify(rightPosColumns))

     var yJs = d3.scaleLinear()
       .domain([0, maxScaleJ])
       .range([heightJscale + positionJscale, positionJscale]);
     yAxisn = svg.append("g")
       // .attr("transform", function(d) { return "translate(" + x(5.5) + ")"; })
       .call(d3.axisLeft(yJs).ticks(3));

     var color = d3.scaleOrdinal()
       .domain(["sefsdosa", "versifsdcolor", "vigdfginica", "asdf"]) // colors do not need to match the ones of the file only the numver in the file matters
       // .range([ "#440154ff", "#21908dff", "#fde725ff", "red"]) // fourth color
       .range(["orange", "green", "blue", "red", "#440154ff", "#21908dff", "#fde725ff", "orange", "cyan", "magenta", "black", "gray"]) // fourth color
     //listOfChemicalShifts = ["chemShift1","chemShift2"]
     // listOfPosition = ["JvalueShif","JvalueShifted","y3","y4"]
     /*
            for (var key in dataLines[0]) {
            listOfChemicalShifts.push(key)
       }
       for (var key in dataLines[0]) {
            listOfChemicalShifts.push(key)
       }
       listOfChemicalShifts.pop()
     */
     // Highlight the specie that is hovered
     var highlightLines = function (d) {
       d3.selectAll(".toBeHidden")
         .transition().duration(10).delay(0)
         .remove()

       selected_specie = d.Label
       // first every group turns grey
       d3.selectAll(".line")
         .transition().duration(200)
         .style("stroke", "black")
         .style("opacity", "0.2")
         .transition().duration(200).delay(3000)
         //   .style("stroke", function (d) { return (color(d.Label)) })
         // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
         .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
         .style("opacity", "1")

       // Second the hovered specie takes its color
       d3.selectAll("." + selected_specie)
         .transition().duration(200)
         //  .style("stroke", color(selected_specie))
         //.style("stroke", getJgraphColor(d.Jvalue, darkMode))
         .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
         .style("opacity", 1.0)


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
         .remove()

       var toto = function (d) { return d.lineText; }
      // document.getElementById("textMainPage").innerHTML = "For " + d.lineText + " the indices of the atoms are " +
         d.indexInMolFile1 + " and " + d.indexInMolFile2 + ".";
         Jmol.script(JmolAppletA,"select hydrogen; color white");

         Jmol.script(JmolAppletA,"select atomno = " + d.indexInMolFile1 + ";color [127,255,127];spacefill 80");
         Jmol.script(JmolAppletA,"select atomno = " + d.indexInMolFile2 + ";color [127,255,127];spacefill 80");

     }

     // Unhighlight
     var doNotHighlightLines = function (toto) {


       /*

        d3.selectAll(".line")
          .transition().duration(200).delay(300)
          //   .style("stroke", function (d) { return (color(d.Label)) })
          // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
          .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
          .style("opacity", "1")

     
*/
     }

     var highlightDot = function (d) {

       //unselect
       Jmol.script(JmolAppletA,"select hydrogen; color white");

       const delayBeforeErase = 3000;

       d3.selectAll(".line")
         .transition().duration(200)
         .style("stroke", "black")
         .style("opacity", "0.1")
         .transition().duration(20).delay(delayBeforeErase)
         .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode); })
         .style("opacity", "1")

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
         .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
         .attr("transform", function (d) { return "rotate(-45," + spreadPositions[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
         .attr("opacity", 0.0)
         .transition().duration(100).delay(3000)
         .remove()
       const highlightWidth = lineWidth * 2.0;

       // first every group dimmed
       d3.selectAll(".circleL")
         .transition().duration(200).delay(0)
         .style("stroke", "black")
         .style("opacity", "0.1")
         .style("stroke-width", lineWidth)

       // specific to those matching the condition of similarity of J's
       var a = 0;
       const deltaSearchJ = 0.5;
       d3.selectAll(".circleL")
         .filter(function (p) {
           if (Math.abs(d.value - p.value) <= deltaSearchJ)
             if (d.uniqIndex != p.uniqIndex)
               a++;
         })

       var highColor = "green"
       if (a > 1)
         highColor = "red"

       d3.selectAll(".circleL")
         .transition().duration(10).delay(300)
         .filter(function (p) { return (Math.abs(d.value - p.value) <= deltaSearchJ) && (d.uniqIndex != p.uniqIndex) })
         .style("stroke", highColor)
         .style("opacity", "1.0")
         .style("stroke-width", highlightWidth)

       d3.selectAll(".circleL")
         .transition().duration(200).delay(delayBeforeErase)
         .style("stroke", "black")
         .style("opacity", "1.0")
         .style("stroke-width", lineWidth)

       d3.selectAll(".rulerClass")
         .transition().duration(200).delay(00)
         .attr("y1", yJs(Math.abs(d.value)))
         .attr("y2", yJs(Math.abs(d.value)))
         .style("opacity", '1.0')
         .style("stroke", highColor)
         .transition().duration(200).delay(delayBeforeErase)
         .attr("y1", yJs(Math.abs(d.value)))
         .attr("y2", yJs(Math.abs(d.value)))
         .style("opacity", '0.0')
         .style("stroke", "black")

       d3.select(this)
         .transition(10).duration(200)
         .style("opacity", "1.0")
         .style("stroke", "black")
         .style("stroke-width", lineWidth)

       selected_specie = "textCircle" + d.uniqIndex;
       d3.selectAll("." + selected_specie)
         .transition().duration(100).delay(10)
         .style("opacity", "1.0")
         .transition().duration(200).delay(delayBeforeErase)
         .style("opacity", "0.0")
     }


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
         return { chemShift: d.x, value: d.y }
       },

       function (chemShift) {
         // Add X axis 
         var x = d3.scaleLinear()
           .domain([
             d3.max(chemShift, function (d) { return +d.chemShift; }),
             d3.min(chemShift, function (d) { return +d.chemShift; })
           ])
           .range([0, width]);
         xAxis = svg.append("g")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x));

         // Add Y axis2


         yAxisn2 = svg.append("g")
           .attr("transform", function (d) { return "translate(" + (width) + ")"; })
           .call(d3.axisRight(yJs).ticks(3))
           ;
         // level of tickLine
         /* var dataTicksLinesold = [
            { Jval: 0 },
            { Jval: 5 },
            { Jval: 10 },
            { Jval: 15 },
            { Jval: 20 },
          ];*/
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

         let dimensions = [1, 1.2, 1.3, 2, 3, 5];

         var yn = {}
         for (i in dimensions) {
           name = dimensions[i]
           yn[name] = d3.scaleLinear()
             .domain([0.0, 22.0]) // --> Same axis range for each group
             // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
             .range([height / 3.0, height / 6.0]);
         }
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
           .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

         // Create the line variable: where both the line and the brush take place
         var lineSpectrum = svg.append('g')
           .attr("clip-path", "url(#clip)")


         // Add the spectrum
         lineSpectrum.append("path")
           .datum(chemShift)
           .attr("class", "lineG")  // add the class line to be able to modify this line later on.
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           // .attr("stroke", "red")
           .attr("stroke-width", lineWidth)
           .attr("d", d3.line()
             .x(function (d) { return x(d.chemShift) })
             .y(function (d) { return y(d.value) })
           )



         // Columns
         const colorShowLine = "#CCCCCC";
         const colorHideLine = "#EEEEEE00";
         // oblique
         var spreadPositionsUU = updateColumnsPositions();

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
         //.style("font-weight", "2pt")            
         // Lines
         function pathFun(d) {

           //  console.log("BEFEG" + JSON.stringify(d))
           const y1 = yJs(Math.abs(d.Jvalue));
           const y2 = yJs(Math.abs(d.JvalueShifted));
           const horizontalShiftX = circleRadius;
           var usedHorizontalShiftX = eval(horizontalShiftX);
           const cs1 = spreadPositionsZZ[d.indexColumn1];
           const cs2 = spreadPositionsZZ[d.indexColumn2];
           if (cs1 > cs2) {
             var usedHorizontalShiftX = eval(- usedHorizontalShiftX);
           }
           const x1 = ((cs1));
           const x2 = ((cs2));
           const x1p = ((cs1) + usedHorizontalShiftX);
           const x2p = ((cs2) - usedHorizontalShiftX);

           const combine = [[x1, y1], [x1p, y2], [x2p, y2], [x2, y1]];
           d.xx = (x1 + x2) / 2.0;
           var Gen = d3.line();

           return Gen(combine);
         }

         function getSpread(spreadDelta, smallSpace) {
           // determine how to spead objects to avoid contacts
           // there muss be anough space for this function to work
           // this is obtained by setting smallSpace to a value below the width/number of items
           for (i = 0; i < spreadDelta.length; i++) {
             const curDelta = spreadDelta[i];
             if (curDelta < smallSpace) {
               const spreadFull = (smallSpace - curDelta);
               var spreadleft = spreadFull / 2.0;
               // try shift left (1 of 3)
               for (j = i - 1; j >= 0; j -= 1) {
                 const curExtraSpace = (spreadDelta[j] - smallSpace);
                 if (curExtraSpace > 0.0) {
                   if (curExtraSpace > spreadleft) {
                     spreadDelta[j] -= spreadleft;
                     spreadDelta[i] += spreadleft;
                     spreadleft = 0;
                   } else {
                     spreadDelta[j] -= curExtraSpace;
                     spreadDelta[i] += curExtraSpace;
                     spreadleft -= curExtraSpace;
                   }
                 }
               }
               // work left over
               var spreadRight = spreadFull - spreadleft;
               // try shift right (2 of 3)
               for (j = i + 1; j < spreadDelta.length; j += 1) {
                 const curExtraSpace = (spreadDelta[j] - smallSpace);
                 if (curExtraSpace > 0.0) {
                   if (curExtraSpace > spreadRight) {
                     spreadDelta[j] -= spreadRight;
                     spreadDelta[i] += spreadRight;
                     spreadRight = 0;
                   } else {
                     spreadDelta[j] -= curExtraSpace;
                     spreadDelta[i] += curExtraSpace;
                     spreadRight -= curExtraSpace;
                   }
                 }
               }
               // work left over (rare but there may be a left over....)
               if (spreadRight > 0.0) {
                 spreadleft = spreadRight;
                 // try shift left (3 of 3)
                 for (j = i - 1; j >= 0; j -= 1) {
                   const curExtraSpace = (spreadDelta[j] - smallSpace);
                   if (curExtraSpace > 0.0) {
                     if (curExtraSpace > spreadleft) {
                       spreadDelta[j] -= spreadleft;
                       spreadDelta[i] += spreadleft;
                       spreadleft = 0;
                     } else {
                       spreadDelta[j] -= curExtraSpace;
                       spreadDelta[i] += curExtraSpace;
                       spreadleft -= curExtraSpace;
                     }
                   }
                 }
               }
               // Done 3/3
             }
           }
           return spreadDelta;
         }


         function updateColumnsAction(spreadPositions, timeAnimation) {

           theColumns1
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             })

           theColumns2
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return x(d.chemShift); })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             })

           theColumns3
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("stroke", function (d) {
               return "black";
             })

           theColumns4
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex] + circleRadius; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex] - circleRadius; })
             .attr("stroke", function (d) {
               return "black";
             })

           theDots
             .transition().duration(timeAnimation)
             .attr("cx", function (d) { return spreadPositions[d.MyIndex]; })

           theDots2
             .transition().duration(timeAnimation)
             .attr("cx", function (d) { return spreadPositions[d.MyIndex]; })


           //  .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //.attr("transform", function (d) { return "rotate(-45," + spreadPositions[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           //  .attr("opacity", 0.0)



           theColumnLabel.transition().duration(timeAnimation)
             .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("transform", function (d) {
               return "rotate(-45," + spreadPositions[d.MyIndex] + "," +
                 eval(-6 + topJGraphYposition + positionJscale) + " )";
             })

           //   .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //  .attr("opacity", 0.0)

         }
         function updateColumnsPositions() {
           spreadPositions = [];
           spreadDelta = [];
           for (i = 0; i < dataColumns.length; i++) {
             var returnValue = 0.0;
             const curChemShift = dataColumns.map(function (d) { return d.chemShift; })
             const curChem = curChemShift[i];
             if (leftPosColumns[i] < x(curChem)) {
               if (rightPosColumns[i] > x(curChem)) {
                 returnValue = x(curChem);
               } else {
                 returnValue = rightPosColumns[i];
               }
             } else {
               returnValue = leftPosColumns[i];
             }
             spreadPositions.push(returnValue);
             if (i > 0) {
               spreadDelta.push(returnValue - spreadPositions[i - 1]);
             }
           }
           console.log("spreadPositions  " + JSON.stringify(spreadPositions))
           console.log("spreadDelta  " + JSON.stringify(spreadDelta))
           // See if need to seprated in the central region.
           spreadDelta = getSpread(spreadDelta, smallSpace);
           console.log("spreadDeltaspreadDelta  " + JSON.stringify(spreadDelta))

           for (i = 0; i < spreadDelta.length; i++) {
             spreadPositions[i + 1] = spreadPositions[i] + spreadDelta[i];
           }


           return spreadPositions;
         }
         var spreadPositionsZZ = updateColumnsPositions();
         var theLinesW = svg
           .selectAll("myPath222")
           .attr("class", "lineW")
           //.data(jGraphData)
           .data(theAssignedCouplings)
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
           .style("stroke", function (d) { return getJgraphColor(Math.abs(d.Jvalue), darkMode) })
           .style("opacity", 0.5)
           .on("click", highlightLines)
           .on("mouseover", highlightLines)
           .on("mouseleave", doNotHighlightLines)






         // Circles
         var theDots = svg.selectAll("dots")
           .data(dataUnassignedCoupCircles)
           .enter()
           .append("circle")
           .attr("class", "circleL")
           .attr("cx", function (d) { return x(d.chemShift); })
           .attr("cy", function (d) { return yJs(Math.abs(d.value)); })
           .attr("r", circleRadius)
           .style("fill", function (d) { return getJgraphColor(Math.abs(d.value), darkMode); })
           .attr("stroke", "black")
           .style("stroke-width", lineWidthCircle)
           .on("mouseenter", highlightDot)
           .on("click", highlightDot)
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
           .style("fill", "gray")
           .attr("stroke", "black")
           .style("stroke-width", lineWidthCircleSmall)




         updateColumnsAction(spreadPositionsZZ, 0);

         // Add the brushing
         lineSpectrum
           .append("g")
           .attr("class", "brush")
           .call(brush);

         // A function that set idleTimeOut to null
         var idleTimeout
         function idled() { idleTimeout = null; }

         // A function that update the chart for given boundaries
         function updateChart() {
           console.log("Function updateChart ...===========")

           // What are the selected boundaries?
           extent = d3.event.selection

           // If no selection, back to initial coordinate. Otherwise, update X axis domain
           if (!extent) {
             if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
             x.domain([
               d3.max(chemShift, function (d) { return +d.chemShift; }),
               d3.min(chemShift, function (d) { return +d.chemShift; })
             ])
           } else {
             x.domain([
               x.invert(extent[0]),
               x.invert(extent[1])
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


           spreadPositionsZZ = updateColumnsPositions();
           updateColumnsAction(spreadPositionsZZ, 1000);
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
       })
   })

