import { GraphBase } from './graphBase.js';

export class NmrSpectrum extends GraphBase {
  constructor(
    chemShifts,
    svg,
    settingsInput,
    smallScreen = false,
    regionsData = {},
  ) {
    // data for base which takes care of communication between classes
    const name = 'nameIsWiredInConstructor_NmrSpectrum1';
    super(name, {
      dataTypesSend: ['xAxisSpectrum'],
      dataTypesReceive: [],
    });

    if (this.isArrayOfArrays(chemShifts)) {
      this.chemShiftsList = chemShifts;
    } else {
      this.chemShiftsList = [chemShifts];
    }

    this.fullSettings = this.initializeSettings(settingsInput);

    this.svg = svg;

    if (
      typeof regionsData === 'object' &&
      regionsData !== null &&
      Object.keys(regionsData).length === 0
    ) {
      this.regionsData = this.getRegionFullSpectrum();
    } else {
      this.regionsData = regionsData;
    }

    this.settings = this.fullSettings.spectrum;
    this.jgraphObj = {};

    this.gapSizePt = 6;
    this.idleTimeout = null; // for brush

    const maxY = d3.max(this.chemShiftsList[0], function (d) {
      return +d.value;
    });
    const minScale = d3.min(this.chemShiftsList[0], function (d) {
      return +d.chemShift;
    });
    const maxScale = d3.max(this.chemShiftsList[0], function (d) {
      return +d.chemShift;
    });

    this.scaleData = this.getScaleData();

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
    // Assuming this.chemShiftsList is an array of arrays
    // Iterate over each spectrum in the list
    this.chemShiftsList.forEach((chemShiftAr, index) => {
      lineSpectrum
        .append('path')
        .datum(chemShiftAr) // Bind the data for the current spectrum
        .attr('class', `lineGA lineG-${index}`) // Add a unique class for each spectrum based on the index
        .attr('fill', 'none')
        .attr('stroke', d3.schemeCategory10[index % 10]) // Use a color from the scheme based on the index    .attr('stroke-width', this.settings.lineWidth)
        .attr(
          'd',
          d3
            .line()
            .x(function (d) {
              return x(d.chemShift);
            })
            .y(function (d) {
              return y(d.value); // Apply vertical shift based on index
            }),
        );
    });

    // Add the brushing
    this.updateZigZag(this.regionsData, this.scaleData);
    lineSpectrum.append('g').attr('class', 'brush').call(brush);
    console.log('calling_constructor');
    // Add Y axis2
    var xAxis = this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.settings.height + ')')
      .call(d3.axisBottom(x).tickValues(this.scaleData.tickValues));

    var x = d3
      .scaleLinear()
      .domain(this.scaleData.xDomain)
      .range(this.scaleData.xRange);

    var jgraphObj = {};
    jgraphObj.originalRegionsData = this.regionsData;
    jgraphObj.originalScaleData = this.scaleData;
    jgraphObj.totalWidth = this.scaleData.totalWidth; // Store the original domain for reset
    jgraphObj.originalXrange = this.scaleData.xRange.slice(); // Store the original domain for reset
    jgraphObj.originalXDomain = this.scaleData.xDomain.slice(); // Store the original domain for reset
    jgraphObj.originalTickValues = this.scaleData.tickValues.slice(); // Store the original tick values
    jgraphObj = {
      ...jgraphObj, // Copy all existing properties of jgraphObj
      x: x,
      y: y,
      lineSpectrum: lineSpectrum,
      brush: brush,
      xAxis: xAxis,
      spectrumData: this.chemShiftsList[0],
      regionsData: this.regionsData,
      gapSizePt: this.gapSizePt,
    };
    this.jgraphObj = jgraphObj;
  }

  isArrayOfArrays(input) {
    if (Array.isArray(input) && input.length > 0) {
      return Array.isArray(input[0]);
    }
    return false;
  }

  getRegionFullSpectrum() {
    const minScale = d3.min(this.chemShiftsList[0], (d) => +d.chemShift);
    const maxScale = d3.max(this.chemShiftsList[0], (d) => +d.chemShift);

    const regions = [{ start: maxScale, end: minScale }];

    var totalCoveredPPM = 0.0;
    regions.forEach(function (currentRegion, i) {
      totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
    });

    return {
      totalCoveredPPM,
      regions,
    };
  }

  getSettings() {
    return this.fullSettings;
  }
  initializeSettings(overrideSettings = {}) {
    // Default settings
    /*let defaultSettings = {
      spectrum: {
        lineWidth: smallScreen ? 5 : 1.5,
      }
    };*/

    // Merge default settings with overrides
    //let settings = { ...defaultSettings, ...overrideSettings };
    let settings = overrideSettings;

    // Calculate derived values

    return settings;
  }
  getScaleDataShuldSetFormatTicksNOtDoingIt() {
    const gapSizePt = this.gapSizePt;
    let tickValues = [];
    let xDomain = [];
    let xRange = [];
    let totalWidthForSpectrum = this.settings.widthOfThePlot;
    totalWidthForSpectrum =
      this.settings.widthOfThePlot -
      gapSizePt * (this.regionsData.regions.length - 1);
    let currentX = 0;
    const numberTotalTicks = (10.0 / 700.0) * this.settings.widthOfThePlot;

    const totalCoveredPPM = this.regionsData.totalCoveredPPM;

    this.regionsData.regions.forEach(function (region, i) {
      const curWidth = Math.abs(region.start - region.end);
      const regionWidth = totalWidthForSpectrum * (curWidth / totalCoveredPPM); // Calculate width per region
      const numTicksForThisRegion = Math.round(
        numberTotalTicks * (curWidth / totalCoveredPPM),
      ); // Calculate number of ticks per region

      // Update domain and range
      xDomain.push(region.start, region.end);
      xRange.push(currentX, currentX + regionWidth);
      currentX += regionWidth + gapSizePt;

      // Create the scale and generate ticks
      const regionScale = d3.scaleLinear().domain([region.start, region.end]);

      const regionTicks = regionScale.ticks(numTicksForThisRegion);

      // Format ticks
      const formattedRegionTicks = regionTicks.map(d3.format('.1f'));

      // Concatenate formatted ticks to the tickValues array
      tickValues = tickValues.concat(formattedRegionTicks);
    });

    return {
      tickValues: tickValues,
      xDomain: xDomain,
      xRange: xRange,
      totalWidth: totalWidthForSpectrum,
    };
  }

  getScaleData() {
    const gapSizePt = this.gapSizePt;
    // Step 2: Create the X axis scale with gaps
    var tickValues = [];
    var xDomain = [];
    var xRange = [];
    var totalWidthForSpectrum = this.settings.widthOfThePlot;
    totalWidthForSpectrum =
      this.settings.widthOfThePlot -
      gapSizePt * (this.regionsData.regions.length - 1);
    var currentX = 0;
    const numberTotalTicks = (10.0 / 700.0) * this.settings.widthOfThePlot;

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
      var regionTicks = d3
        .scaleLinear()
        .domain([region.start, region.end])
        .ticks(numTicksForThisRegion);
      tickValues = tickValues.concat(regionTicks);
    });

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
    if (!extent) {
      if (!this.idleTimeout)
        return (this.idleTimeout = setTimeout(this.idled.bind(this), 350));

      const minScale = d3.min(this.chemShiftsList[0], function (d) {
        return +d.chemShift;
      });
      const maxScale = d3.max(this.chemShiftsList[0], function (d) {
        return +d.chemShift;
      });
      // Reset the X domain to the original domain for the custom X-axis

      const selectedDomain = [maxScale, minScale];

      // Find the corresponding segment of the custom domain

      this.regionsData = this.getNewRegions(selectedDomain);
      this.scaleData = this.getScaleData();
      this.updateZigZag(this.regionsData, this.scaleData);
      this.jgraphObj.x
        .domain(this.scaleData.xDomain)
        .range(this.scaleData.xRange);
      // Restore the original tick values

      // Update the X axis with the new ticks
      this.jgraphObj.xAxis
        .transition()
        .duration(1000)
        //.call(d3.axisBottom(jgraphObj.x).tickValues(newTickValues));
        .call(
          d3.axisBottom(this.jgraphObj.x).tickValues(this.scaleData.tickValues),
        );

      //  this.regionsData = this.jgraphObj.originalRegionsData;
      // this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);

      //this.updateZigZag(this.scaleData, this.scaleData);
      this.updateZigZag(
        this.jgraphObj.originalRegionsData,
        this.jgraphObj.originalScaleData,
      );
    } else {
      // Update the X domain based on the brush selection
      const selectedDomain = [
        this.jgraphObj.x.invert(extent[0]),
        this.jgraphObj.x.invert(extent[1]),
      ];

      // Find the corresponding segment of the custom domain
      this.regionsData = this.getNewRegions(selectedDomain);

      // this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);
      this.scaleData = this.getScaleData();
      this.updateZigZag(this.regionsData, this.scaleData);

      this.jgraphObj.x
        .domain(this.scaleData.xDomain)
        .range(this.scaleData.xRange);

      this.jgraphObj.lineSpectrum
        .select('.brush')
        .call(this.jgraphObj.brush.move, null); // Clear the brush

      // Update the X axis with the new ticks
      this.jgraphObj.xAxis
        .transition()
        .duration(1000)
        .call(
          d3.axisBottom(this.jgraphObj.x).tickValues(this.scaleData.tickValues),
        );
    }

    // Update the line path with a transition
    this.chemShiftsList.forEach((chemShifts, index) => {
      this.jgraphObj.lineSpectrum
        .selectAll(`.lineGA`)
        .transition()
        .duration(1000)
        .attr(
          'd',
          d3
            .line()
            .x((d) => {
              return this.jgraphObj.x(d.chemShift);
            })
            .y((d) => {
              return this.jgraphObj.y(d.value);
            }),
        );
    });

    console.log('send =======================');
    this.triggerSendAxis();
    return;
  }

  getNewRegions(selectedDomain) {
    var newDomain = [];
    var from = 0;
    var to = 0;

    var totalCoveredPPM = 0.0;

    this.jgraphObj.regionsData.regions.forEach(function (d, i) {
      from = d.start;
      to = d.end;
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
      } else {
        if (c111 && c222) {
          const toAdd = {
            start: selectedDomain[0],
            end: selectedDomain[1],
          };

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
          } else {
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
        }
      }
    });

    const obj = {
      totalCoveredPPM: totalCoveredPPM,
      regions: newDomain,
    };
    return obj;
  }

  idled() {
    this.idleTimeout = null;
  }

  storeJgraphObj(jgraphObj) {
    this.jgraphObj = {
      ...this.jgraphObj, // Retain existing fields
      ...jgraphObj, // Update with new fields from jgraphObj
    };
  }

  triggerSendAxis() {
    const content = {
      x: this.jgraphObj.x,
    };

    this.triggerSend('xAxisSpectrum', content);
  }

  triggerSend(type, content) {
    if (this.dataTypesSend.includes(type)) {
      console.log(
        `${this.name}  tries to send ${type}. It is in the dataTypesSend array`,
      );
    } else {
      console.error(
        `${this.name}  tries to send ${type}. It is not in the dataTypesSend array`,
      );
      return;
    }

    this.sendData(type, content);
  }
}
