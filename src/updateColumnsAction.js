export function updateColumnsAction(spreadPositions, timeAnimation, positionJscale, topJGraphYposition, colorShowLine, colorHideLine, circleRadius, x, width, theColumns1, theColumns2, theColumns3, theColumns4, theDots, theDots2, theColumnLabel) {
 //            updateColumnsAction(spreadPositionsZZ, 1000,         colorShowLine, colorHideLine, circleRadius, x, width, theColumns1, theColumns2, theColumns3, theColumns4, theDots, theDots2, theColumnLabel);
 
            theColumns1
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             });

           theColumns2
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return x(d.chemShift); })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             });

           theColumns3
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("stroke", function (d) {
               return "black";
             });

           theColumns4
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex] + circleRadius; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex] - circleRadius; })
             .attr("stroke", function (d) {
               return "black";
             });

           theDots
             .transition().duration(timeAnimation)
             .attr("cx", function (d) { return spreadPositions[d.MyIndex]; });

           theDots2
             .transition().duration(timeAnimation)
             .attr("cx", function (d) { return spreadPositions[d.MyIndex]; });


           //  .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //.attr("transform", function (d) { return "rotate(-45," + spreadPositions[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           //  .attr("opacity", 0.0)



           theColumnLabel.transition().duration(timeAnimation)
             .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("transform", function (d) {
               return "rotate(-45," + spreadPositions[d.MyIndex] + "," +
                 eval(-6 + topJGraphYposition + positionJscale) + " )";
             });

           //   .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //  .attr("opacity", 0.0)

         }