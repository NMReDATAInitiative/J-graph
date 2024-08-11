export class NmrSpectrum {
  constructor(
    chemShifts,
    regionsData,
    settings,
    settingsjGraph,
    svg,
    jgraphObj,
  ) {
    this.svg = svg;
    this.chemShifts = chemShifts;
    this.regionsData = regionsData;
    this.settingsjGraph = settingsjGraph;
    this.settings = settings;
    this.jgraphObj = jgraphObj;

    this.gapSizePt = 6;
    this.idleTimeout = null; // for brush
  }

  build() {
    const maxY = d3.max(this.chemShifts, function (d) {
      return +d.value;
    });
    const minScale = d3.min(this.chemShifts, function (d) {
      return +d.chemShift;
    });
    const maxScale = d3.max(this.chemShifts, function (d) {
      return +d.chemShift;
    });

    this.scaleData = this.getScaleData();
    console.log('sellu scaleData.xRange', this.scaleData.xRange);
    console.log('sellu regionsData.regions', this.regionsData.regions);

    console.log('sellu xDomain ', this.scaleData.xDomain);
    console.log('sellu xRange ', this.scaleData.xRange);
    var x = d3
      .scaleLinear()
      .domain(this.scaleData.xDomain)
      .range(this.scaleData.xRange);

    // Add Y axis
    var y = d3.scaleLinear().domain([0, maxY]).range([this.settings.height, 0]);
    //yAxis = svg.append("g") .call(d3.axisLeft(y));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = this.svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.settings.widthOfThePlot)
      .attr('height', this.settings.height)
      .attr('x', 0)
      .attr('y', 0);

    // Add brushing
    var brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [this.settings.widthOfThePlot, this.settings.height],
      ]) // Initialize the brush area: start at 0,0 and finish at width,settings.height: it means I select the whole graph area
      .on('end', (event) => {
        this.updateChart(event); // `this` correctly refers to the class instance
      });

    // Create the line variable: where both the line and the brush take place
    var lineSpectrum = this.svg.append('g').attr('clip-path', 'url(#clip)');

    // Add the spectrum
    lineSpectrum
      .append('path')
      .datum(this.chemShifts)
      .attr('class', 'lineG') // add the class line to be able to modify this line later on.
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      // .attr("stroke", "red")
      .attr('stroke-width', this.settings.lineWidth)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(d.chemShift);
          })
          .y(function (d) {
            return y(d.value);
          }),
      );
    // Add the brushing
    this.updateZigZag(this.regionsData, this.scaleData);
    lineSpectrum.append('g').attr('class', 'brush').call(brush);

    // Add Y axis2
    var xAxis = this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.settings.height + ')')
      .call(d3.axisBottom(x).tickValues(this.scaleData.tickValues));

    var x = d3
      .scaleLinear()
      .domain(this.scaleData.xDomain)
      .range(this.scaleData.xRange);
    this.jgraphObj.originalRegionsData = this.regionsData;
    this.jgraphObj.originalScaleData = this.scaleData;
    this.jgraphObj.totalWidth = this.scaleData.totalWidth; // Store the original domain for reset
    this.jgraphObj.originalXrange = this.scaleData.xRange.slice(); // Store the original domain for reset
    this.jgraphObj.originalXDomain = this.scaleData.xDomain.slice(); // Store the original domain for reset
    this.jgraphObj.originalTickValues = this.scaleData.tickValues.slice(); // Store the original tick values
    this.jgraphObj = {
      ...this.jgraphObj, // Copy all existing properties of jgraphObj
      x: x,
      y: y,
      lineSpectrum: lineSpectrum,
      brush: brush,
      xAxis: xAxis,
      spectrumData: this.chemShifts,
      regionsData: this.regionsData,
      gapSizePt: this.gapSizePt,
    };
  }

  getScaleData() {
    const gapSizePt = this.gapSizePt;
    // Step 2: Create the X axis scale with gaps
    var tickValues = [];
    var xDomain = [];
    var xRange = [];
    var totalWidthForSpectrum =
      this.settings.widthOfThePlot -
      gapSizePt * (this.regionsData.regions.length - 1);
    var currentX = 0;
    const numberTotalTicks = (10.0 / 700) * this.settings.widthOfThePlot;
    console.log('this.getScaleData sellu regions ', this.regionsData.regions);

    this.regionsData.regions.forEach((region, i1) => {
      console.log('this.getScaleData sellu regions ', i1, ' ', region);
    });
    const totalCoveredPPM = this.regionsData.totalCoveredPPM;
    this.regionsData.regions.forEach(function (region, i) {
      const curWidth = Math.abs(region.start - region.end);
      var regionWidth = totalWidthForSpectrum * (curWidth / totalCoveredPPM); // Calculate width per region
      var numTicksForThisRegion = Math.round(
        numberTotalTicks * (curWidth / totalCoveredPPM),
      ); // Calculate width per region
      xDomain.push(region.start, region.end);
      xRange.push(currentX, currentX + regionWidth);
      currentX += regionWidth + gapSizePt;
      console.log(
        'this.getScaleData sellu numTicksForThisRegion ',
        numTicksForThisRegion,
      );
      var regionTicks = d3
        .scaleLinear()
        .domain([region.start, region.end])
        .ticks(numTicksForThisRegion);

      tickValues = tickValues.concat(regionTicks);
    });
    console.log('this.getScaleData sellu  tickValues', tickValues);
    console.log('this.getScaleData sellu  xDomain', xDomain);
    console.log('this.getScaleData sellu  xRange', xRange);

    const objRet = {
      tickValues: tickValues,
      xDomain: xDomain,
      xRange: xRange,
      totalWidth: totalWidthForSpectrum,
    };
    return objRet;
  }

  updateZigZag(regionsData, scaleData) {
    // Remove any existing zigzag paths before adding new ones
    this.svg.selectAll('.zigzag-path').remove();
    const settings = this.settings;
    var svg = this.svg;
    regionsData.regions.forEach(function (region, i) {
      if (i > 0) {
        console.log('ZZZ v sellu region', region);

        const currentX1 = scaleData.xRange[i * 2 - 1];
        const currentX2 = scaleData.xRange[i * 2];

        var zigzagHeight = 4; // Height of each zigzag segment
        var zigzagWidth = 3; // Width of each zigzag segment
        var numZigs = 3; // Number of zigzag segments
        var zigzagPath1 = `M${currentX1},${
          settings.height + (numZigs * zigzagHeight) / 2
        }`;
        var zigzagPath2 = `M${currentX2},${
          settings.height + (numZigs * zigzagHeight) / 2
        }`;
        var zigzagPath3 = `M${currentX1 * 0.5 + currentX2 * 0.5},${
          settings.height + (numZigs * zigzagHeight) / 2
        }`;
        for (var j = 0; j < numZigs; j++) {
          var xOffset = j % 2 === 0 ? zigzagWidth : -zigzagWidth;
          var yOffset = -zigzagHeight;
          zigzagPath1 += ` l${xOffset},${yOffset}`;
          zigzagPath2 += ` l${xOffset},${yOffset}`;
          zigzagPath3 += ` l${xOffset},${yOffset}`;
        }

        // Append the zigzag paths to the SVG

        svg
          .append('path')
          .transition()
          .duration(20)
          .delay(310)
          .attr('d', zigzagPath3)
          .attr('class', 'zigzag-path') // Assign a class for easy removal
          .attr('stroke', 'white')
          .attr('stroke-width', settings.gapSizePt)
          .attr('fill', 'none');

        svg
          .append('path')
          .transition()
          .duration(20)
          .delay(310)
          .attr('d', zigzagPath1)
          .attr('class', 'zigzag-path') // Assign a class for easy removal
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('fill', 'none');

        svg
          .append('path')
          .transition()
          .duration(20)
          .delay(310)
          .attr('d', zigzagPath2)
          .attr('class', 'zigzag-path') // Assign a class for easy removal
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('fill', 'none');
      }
    });
  }

  updateChart(event) {
    var extent = event.selection;
    console.log('startP updateChart', extent);
    console.log('startP updateChart this.idleTimeout', this.idleTimeout);

    if (!extent) {
      if (!this.idleTimeout)
        return (this.idleTimeout = setTimeout(this.idled.bind(this), 350));
      console.log('startP reset scale');
      // Reset the X domain to the original domain for the custom X-axis
      this.jgraphObj.x
        .domain(this.jgraphObj.originalXDomain)
        .range(this.jgraphObj.originalXrange);
      // Restore the original tick values
      this.jgraphObj.xAxis
        .transition()
        .duration(1000)
        .call(
          d3
            .axisBottom(this.jgraphObj.x)
            .tickValues(this.jgraphObj.originalTickValues),
        );
      this.regionsData = this.jgraphObj.originalRegionsData;
      // this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);
      this.scaleData = this.getScaleData();

      //this.updateZigZag(this.scaleData, this.scaleData);
      this.updateZigZag(
        this.jgraphObj.originalRegionsData,
        this.jgraphObj.originalScaleData,
      );

      console.log('end reset scale');
    } else {
      console.log('startP setnew scale');

      // Update the X domain based on the brush selection
      var selectedDomain = [
        this.jgraphObj.x.invert(extent[0]),
        this.jgraphObj.x.invert(extent[1]),
      ];
      console.log('sellu selectedDomain ==========', selectedDomain);
      // Find the corresponding segment of the custom domain
      this.regionsData = this.getNewRegions(selectedDomain);
      console.log('sellu newDomain calling ==========', this.regionsData);

      // this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);
      this.scaleData = this.getScaleData();
      this.updateZigZag(this.regionsData, this.scaleData);
      console.log('sellu new scaleData  ==========', this.scaleData);
      console.log('sellu scaleData.xDomain===', this.scaleData.xDomain);
      console.log('sellu scaleData.xDomain===', this.scaleData.xRange);

      this.jgraphObj.x
        .domain(this.scaleData.xDomain)
        .range(this.scaleData.xRange);

      // var x = d3.scaleLinear().domain(scaleData.xDomain).range(scaleData.xRange);

      console.log('sellu out of domain');

      this.jgraphObj.lineSpectrum
        .select('.brush')
        .call(this.jgraphObj.brush.move, null); // Clear the brush
      console.log('sellu out of lineSpectrum');

      // Calculate the new ticks based on the new domain
      /*var newTickValues = this.jgraphObj.originalTickValues.filter(function (tick) {
        return (
          tick >= this.regionsData[0] && tick <= this.regionsData[newDomain.length - 1]
        );
      });*/
      console.log('sellu out of newTickValues');

      // Update the X axis with the new ticks
      this.jgraphObj.xAxis
        .transition()
        .duration(1000)
        //.call(d3.axisBottom(jgraphObj.x).tickValues(newTickValues));
        .call(
          d3.axisBottom(this.jgraphObj.x).tickValues(this.scaleData.tickValues),
        );
      console.log('sellu out of updateChart');
    }

    // Update the line path with a transition
    this.jgraphObj.lineSpectrum
      .select('.lineG')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .line()
          .x((d) => {
            return this.jgraphObj.x(d.chemShift); // `this` refers to the class instance
          })
          .y((d) => {
            return this.jgraphObj.y(d.value); // `this` refers to the class instance
          }),
      );

    var numberItem = 1;
    if ('dataColumns' in this.jgraphObj && 'theColumns' in this.jgraphObj) {
      this.jgraphObj.dataColumns.length;
      this.jgraphObj.smallSpace =
        settings.spectrum.widthOfThePlot / (numberItem + 1); // five items, six spaces
      if (
        this.jgraphObj.smallSpace >
        settings.jGraph.preferedDistanceInPtBetweenColumns
      ) {
        this.jgraphObj.smallSpace =
          settings.jGraph.preferedDistanceInPtBetweenColumns;
      }
      this.jgraphObj.assignedCouplings.spreadPositionsZZ =
        updateColumnsPositions(
          this.jgraphObj.dataColumns,
          this.jgraphObj.leftPosColumns,
          this.jgraphObj.x,
          this.jgraphObj.rightPosColumns,
          this.jgraphObj.smallSpace,
        );
      updateColumnsAction(
        this.jgraphObj.assignedCouplings.spreadPositionsZZ,
        1000,
        settings.jGraph.positionJscale,
        settings.jGraph.topJGraphYposition,
        settings.jGraph.jGraphParameters.colorShowLine,
        settings.jGraph.jGraphParameters.colorHideLine,
        settings.jGraph.generalUseWidth,
        this.jgraphObj.x,
        settings.spectrum.widthOfThePlot,
        this.jgraphObj,
        settings.jGraph.blockWidth,
        this.jgraphObj.yJs,
      );
      console.log('yes2 dataColumns && theColumns in jgraphObj', settings);
    } else {
      console.log('no dataColumns && theColumns in jgraphObj');
    }

    if ('assignedCouplings' in this.jgraphObj) {
      this.jgraphObj.assignedCouplings.updateTheLines(
        this.jgraphObj.yJs,
        this.jgraphObj.smallSpace,
        this.settingsjGraph.blockWidth,
        this.pathFun,
      );
      console.log(
        'yes3 dataColumns assignedCouplings in jgraphObj this.jgraphObj.assignedCouplings',
        this.jgraphObj.assignedCouplings,
      );
      console.log(
        'yes3 dataColumns assignedCouplings in jgraphObj this.jgraphObj.smallSpace',
        this.jgraphObj.smallSpace,
      );
      console.log(
        'yes3 dataColumns assignedCouplings in jgraphObj this.jgraphObj.yJs',
        this.jgraphObj.yJs,
      );
    } else {
      console.log('no dataColumns assignedCouplings in jgraphObj');
    }
    console.log('finished dataColumns ');
  }

  getNewRegions(selectedDomain) {
    var newDomain = [];
    var from = 0;
    var to = 0;
    console.log(
      'sellu old jgraphObj.originalXDomain ==========',
      this.jgraphObj.originalXDomain,
    );
    console.log(
      'sellu old jgraphObj.originalXDomain ==========',
      this.jgraphObj.originalXDomain,
    );
    var totalCoveredPPM = 0.0;
    console.log('Zsellu trtr');
    console.log('Zsellu jgraphObj.regionsData', this.jgraphObj.regionsData);
    console.log(
      'Zsellu jgraphObj.regionsData.regions',
      this.jgraphObj.regionsData.regions,
    );

    this.jgraphObj.regionsData.regions.forEach(function (d, i) {
      console.log('Zsellu jgraphObj.regionsData  ttr', d);
      from = d.start;
      to = d.end;

      console.log('Zsellu test i = ', i, ' ', from, ' ', to);

      const c1 =
        (from >= selectedDomain[0] && from <= selectedDomain[1]) ||
        (from <= selectedDomain[0] && from >= selectedDomain[1]);
      const c2 =
        (to >= selectedDomain[0] && to <= selectedDomain[1]) ||
        (to <= selectedDomain[0] && to >= selectedDomain[1]);
      const c111 =
        (from >= selectedDomain[0] && to <= selectedDomain[0]) ||
        (from <= selectedDomain[0] && to >= selectedDomain[0]);
      const c222 =
        (from >= selectedDomain[1] && to <= selectedDomain[1]) ||
        (from <= selectedDomain[1] && to >= selectedDomain[1]);
      if (c1 && c2) {
        const toAdd = {
          start: from,
          end: to,
        };
        newDomain.push(toAdd);
        totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
      }
      if (c111 && c222) {
        const toAdd = {
          start: selectedDomain[0],
          end: selectedDomain[1],
        };
        console.log('Zsellu test i = ', i, ' ', from, ' ', to, ' IN');

        newDomain.push(toAdd);
        totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
      } else {
        if (c222) {
          // only
          const toAdd = {
            start: from,
            end: selectedDomain[1],
          };
          newDomain.push(toAdd);

          totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
        }
        if (c111) {
          // only
          const toAdd = {
            start: selectedDomain[0],
            end: to,
          };

          newDomain.push(toAdd);
          totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
        }
      }
    });

    console.log('sellu newDomain ==========', newDomain);
    const obj = {
      totalCoveredPPM: totalCoveredPPM,
      regions: newDomain,
    };
    return obj;
  }

  idled() {
    this.idleTimeout = null;
    console.log('startP                to zeo');
  }
  pathFun(d) {
    /*
          The four points for assignment lines  
           | __ |
           |/  \|
           O    O
           |    |
          */

    const y1a = jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap1));
    const y1b = jgraphObj.yJs(Math.abs(d.JvalueAntiOverlap2));
    // const y2 = yJs(Math.abs(d.JvalueShifted));
    //const iiidex = d.iindex;
    //   console.log("iiidex = " + JSON.stringify(d.iindex));
    //     console.log("assignedCouplings.content[d.iindex].JvalueShifted = " + JSON.stringify(assignedCouplings.content[d.iindex].JvalueShifted));
    // HERE
    //const alterative = dataColumns[0].JvalueAntiOverlap1;//
    //console.log("test same... = " + JSON.stringify(alterative) + " "  +  JSON.stringify(Math.abs(assignedCouplings.content[d.iindex].JvalueShifted)) );
    const y2 = jgraphObj.yJs(Math.abs(d.JvalueShifted));
    //const y2 = yJs(Math.abs(d.JvalueShifted));
    const horizontalShiftX =
      jgraphObj.smallSpace - settings.jGraph.blockWidth - 1.5; // make larger here !
    const horizontalShiftSideBlock = settings.jGraph.blockWidth; // make larger here !
    var usedHorizontalShiftX = eval(horizontalShiftX);
    var usedHorizontalShiftSideBlock = eval(horizontalShiftSideBlock);
    const cs1 = jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn1];
    const cs2 = jgraphObj.assignedCouplings.spreadPositionsZZ[d.indexColumn2];
    if (cs1 > cs2) {
      usedHorizontalShiftX = eval(-usedHorizontalShiftX);
      usedHorizontalShiftSideBlock = eval(-usedHorizontalShiftSideBlock);
    }

    const combine = [
      [cs1 + usedHorizontalShiftSideBlock, y1a],
      [cs1 + usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftX, y2],
      [cs2 - usedHorizontalShiftSideBlock, y1b],
    ];
    d.xx = (cs1 + cs2) / 2.0;
    var Gen = d3.line();

    return Gen(combine);
  }
}
