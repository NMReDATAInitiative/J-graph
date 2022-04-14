export function updateColumnsAction(spreadPositions, timeAnimation, positionJscale, topJGraphYposition, colorShowLine, colorHideLine, generalUseWidth, x, width, jgraphObj, blockWidth) {
 

            jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             });

           jgraphObj.theColumns.theColumnsVerticalInSpectrum
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return x(d.chemShift); })
             .attr("x2", function (d) { return x(d.chemShift); })
             .attr("stroke", function (d) {
               if ((x(d.chemShift) > 0.0) && (x(d.chemShift) < width)) {
                 return colorShowLine;
               } else { return colorHideLine; }
             });

           jgraphObj.theColumns.theColumnsMainVerticalLine
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("stroke", function (d) {
               return "black";
             });

           jgraphObj.theColumns.theColumnsBase
             .transition().duration(timeAnimation)
             .attr("x1", function (d) { return spreadPositions[d.MyIndex] + generalUseWidth; })
             .attr("x2", function (d) { return spreadPositions[d.MyIndex] - generalUseWidth; })
             .attr("stroke", function (d) {
               return "black";
             });

           jgraphObj.theDots
             .transition().duration(timeAnimation)
             .attr("cx", function (d) { return spreadPositions[d.MyIndex]; })
             ;
/*
           theTextDots2
             .transition().duration(timeAnimation)
             .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
            ;
*/
           jgraphObj.theBlocks
             .transition().duration(timeAnimation)
             .attr("x", function (d) { return eval(spreadPositions[d.MyIndex] - blockWidth); });


           //  .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //.attr("transform", function (d) { return "rotate(-45," + spreadPositions[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
           //  .attr("opacity", 0.0)



           jgraphObj.theColumns.theColumnLabel
             .transition().duration(timeAnimation)
             .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
             .attr("transform", function (d) {
               return "rotate(-45," + spreadPositions[d.MyIndex] + "," +
                 eval(-6 + topJGraphYposition + positionJscale) + " )";
             });

           //   .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
           //  .attr("opacity", 0.0)

         }