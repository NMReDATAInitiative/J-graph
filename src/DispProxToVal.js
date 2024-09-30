import { GraphBase } from './graphBase.js';

export class DispProxToVal extends GraphBase {
  constructor(
    selector,
    JmolAppletA,
    width = 50,
    height = 52,
    name = 'nameIsWiredInConstructor_DispProxToVal1',
  ) {
    // data for GraphBase which takes care of communication between classes
    super(name, {
      dataTypesSend: [],
      dataTypesReceive: ['dataValues'],
      logAllDataExchange: false, // Enable logging for this instance if true
    });

    this.JmolAppletA = JmolAppletA;
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.svg = d3
      .select(selector)
      .attr('width', this.width)
      .attr('height', this.height);
    d3.select(selector).style('shape-rendering', 'crispEdges');
  }

  dataValues_UpdateFunction(data, sender) {
    // this is the method called when receiving data catenate the datatype (see dataTypesReceive)
    const value = data.content;

    if (typeof value === 'undefined') {
      console.error('no data.content in recieved data');
      return;
    }

    // Clear the SVG before redrawing
    this.svg.selectAll('*').remove();

    // Ensure 'this.data' is defined
    if (!this.data) {
      console.error('Data is not initialized');
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((aValue, index) => {
        //this.data[`dispValue${index}`] = aValue;
        this.data[index].dispValue1 = aValue;
      });
    } else {
      // Update data or settings based on new value if needed
      this.data.forEach((entry) => {
        entry.dispValue1 = value; // Update the value
        // If you have multiple values, update them accordingly
        // entry.dispValue2 = value; // For example, if needed
      });
    }

    // Redraw the SVG with updated data
    this.#draw();

    var inContent = null;
    inContent = { reception: 'highlightOK' };
    return inContent;
  }

  // Private method to get value from a path
  #getValueFromPath(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  async init(fileName, options = {}) {
    const data = await d3.json(fileName).catch((error) => {
      console.error('Error loading the JSON file:', error);
      return null; // Ensure null is returned to avoid further processing
    });

    if (data) {
      this.#initialize(data, options);
    }
  }

  async initJson(jsonData, options = {}) {
    this.#initialize(jsonData, options);
  }

  updateValue(updateContainer) {
    const { value, showIngestionInLog, callerClass } = updateContainer;

    if (typeof value === 'undefined') {
      return;
    }

    if (showIngestionInLog) {
      if (callerClass) {
        console.log(`updateValue from  ${callerClass} class: value = ${value}`);
      }
      console.log(`updateValue ...  value = ${value}`);
    }

    // Clear the SVG before redrawing
    this.svg.selectAll('*').remove();

    // Ensure 'this.data' is defined
    if (!this.data) {
      console.error('Data is not initialized');
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((aValue, index) => {
        //this.data[`dispValue${index}`] = aValue;
        this.data[index].dispValue1 = aValue;
      });
    } else {
      // Update data or settings based on new value if needed
      this.data.forEach((entry) => {
        entry.dispValue1 = value; // Update the value
        // If you have multiple values, update them accordingly
        // entry.dispValue2 = value; // For example, if needed
      });
    }

    // Redraw the SVG with updated data
    this.#draw();
  }

  #initialize(data, options = {}) {
    const defaults = {
      keys: ['label', 'value'],
      types: ['toCen'],
      extract: 'array',
      selectionKeyTrue: '',
      atomNumberKey: 'molAtomIndices',
    };

    // Override defaults with passed values
    this.settings = { ...defaults, ...options };
    this.numberGraphVertical = this.settings.keys.length;
    this.settings.numberGraphVertical = this.settings.keys.length;

    try {
      this.data = this.#processData(data);
      this.#draw();
    } catch (error) {
      console.error('Error initializing with data:', error);
    }
  }

  #processData(jsonData) {
    let filteredData = jsonData;
    // Apply extraction if specified
    if (this.settings.extract !== '') {
      filteredData = this.#getValueFromPath(jsonData, this.settings.extract);
    }

    // Dynamically filter and map based on the number of keys
    return filteredData
      .filter(
        (item) =>
          (this.settings.selectionKeyTrue === '' ||
            item[this.settings.selectionKeyTrue] === true) &&
          this.settings.keys.every((key) => key in item),
      )
      .map((item) => {
        // Dynamically create the object based on keys
        const result = {};
        result.molAtomIndices = item[this.settings.atomNumberKey];
        this.settings.keys.forEach((key, index) => {
          // Assuming the first key is always for labelVarSet, the rest are for dispValues
          if (index === 0) {
            result.labelVarSet = item[key];
          } else {
            result[`dispValue${index}`] = item[key];
          }
        });
        return result;
      });
  }

  #getColorFromMap(expVal, index = 0) {
    expVal = Math.max(0, Math.min(expVal, 1.0));
    const colorMaps = [
      ['#FF0000', '#FF00FF', '#7777FF', '#00FFFF'],
      ['#FF7700', '#FF7777', '#FF77FF', '#7777FF', '#0077FF'],
      ['#FFFF00', '#FFFF77', '#FFFFFF', '#77FFFF', '#00FFFF'],
      ['#DD0000', '#008800'],
      ['#4444DD', '#008800', '#DD0000'],
    ];
    const usedColor = colorMaps[index] || colorMaps[0];
    const ni = usedColor.length - 1;
    let baseColorIndex = Math.floor(expVal * ni);
    if (baseColorIndex > ni - 1) baseColorIndex = ni - 1;
    let adjust = ni * expVal - baseColorIndex;
    if (adjust > 1.0) adjust = 1.0;

    const colorStart = usedColor[baseColorIndex];
    const colorEnd = usedColor[baseColorIndex + 1] || usedColor[baseColorIndex];
    const cR = this.#interpolate(
      colorStart.substring(1, 3),
      colorEnd.substring(1, 3),
      adjust,
    );
    const cG = this.#interpolate(
      colorStart.substring(3, 5),
      colorEnd.substring(3, 5),
      adjust,
    );
    const cB = this.#interpolate(
      colorStart.substring(5, 7),
      colorEnd.substring(5, 7),
      adjust,
    );

    return `#${cR}${cG}${cB}`;
  }

  #interpolate(startHex, endHex, factor) {
    const start = parseInt(startHex, 16);
    const end = parseInt(endHex, 16);
    const result = Math.round(start + (end - start) * factor).toString(16);
    return result.padStart(2, '0');
  }

  #plot01(
    refposX = 0,
    refposY = 0,
    ratio = 0.9937,
    molAtomIndices = [],
    is1Max = true,
    numberSteps = 3,
    width = 3,
  ) {
    const stroke_width = 1;
    let ratioDispData = [];
    if (!is1Max) {
      for (let i = 0; i < numberSteps; i++) {
        ratioDispData.push((ratio - 1.0) * Math.pow(10.0, i));
      }
    } else {
      for (let i = 0; i < numberSteps; i++) {
        ratioDispData.push((1.0 - ratio) * Math.pow(10.0, i));
      }
    }

    const heightCurBlockC = 14;
    let heightCurBlock = heightCurBlockC;

    ratioDispData.forEach((data, i) => {
      heightCurBlock -= 4;
      let value0to1 = !is1Max ? (data + 1.0) / 2.0 : 1.0 - data;
      if (isNaN(value0to1)) return;
      value0to1 = Math.max(0, Math.min(value0to1, 1.0));

      const space = heightCurBlockC - heightCurBlock;
      const shiftUpBlock = space * value0to1;
      const colorCodeCode = is1Max ? 3 : 4;

      this.svg
        .append('rect')
        .attr('x', Math.round(refposX + i * width))
        .attr(
          'y',
          Math.round(refposY + heightCurBlockC - shiftUpBlock - heightCurBlock),
        )
        .attr('width', Math.round(width))
        .attr('height', heightCurBlock)
        .attr('fill', this.#getColorFromMap(value0to1, colorCodeCode))
        .attr('stroke', 'black')
        .attr('stroke-width', stroke_width);
    });

    const widhtOfScaleArea = this.#drawScale(
      Math.round(refposX + ratioDispData.length * width),
      refposY,
      heightCurBlockC,
      is1Max,
    );
    const fullwidthHiddenBox = ratioDispData.length * width + widhtOfScaleArea;

    // Calculate the bounds for the invisible rectangle
    const bounds = {
      x: refposX,
      y: refposY,
      width: fullwidthHiddenBox,
      height: heightCurBlockC,
    };

    var tooltip = d3.select('#tooltip');

    if (tooltip.empty()) {
      console.log(
        'The tooltip div is missing. Please include the following HTML snippet in your document: <div id="tooltip" style="position: absolute; visibility: hidden; padding: 8px; background-color: white; border: 1px solid #ccc; border-radius: 5px; pointer-events: none; z-index: 10;"></div>',
      );
    } else {
      const self = this;

      this.svg
        .append('rect')
        .attr('x', bounds.x)
        .attr('y', bounds.y)
        .attr('width', bounds.width)
        .attr('height', bounds.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseover', function () {
          tooltip.style('visibility', 'visible');
          if (self.JmolAppletA !== undefined && self.JmolAppletA !== null) {
            for (let i = 0; i < molAtomIndices.length; i++) {
              console.log('select atomno = ' + molAtomIndices[i]);
              jmolScript(
                'select atomno = ' +
                  (molAtomIndices[i] + 1) +
                  ' ;color [0,255,0]',
                self.JmolAppletA,
              );
            }
          }
        })
        .on('mousemove', function (event) {
          tooltip
            .text(ratio) // Update this based on the data or element
            .style('left', event.pageX + 10 + 'px') // Position tooltip to the right of the cursor
            .style('top', event.pageY + 10 + 'px'); // Position tooltip below the cursor
        })
        .on('click', function (event) {
          if (self.JmolAppletA !== undefined && self.JmolAppletA !== null) {
            for (let i = 0; i < molAtomIndices.length; i++) {
              jmolScript(
                'select atomno = ' +
                  (molAtomIndices[i] + 1) +
                  ' ;color [0,255,255]',
                self.JmolAppletA,
              );
            }
          }
        })
        .on('mouseout', function () {
          tooltip.style('visibility', 'hidden');
          if (self.JmolAppletA !== undefined && self.JmolAppletA !== null) {
            for (let i = 0; i < molAtomIndices.length; i++) {
              jmolScript(
                'select atomno = ' + (molAtomIndices[i] + 1) + ' ;color cpk;',
                self.JmolAppletA,
              );
            }
          }
        });
    }
  }

  #drawScale(refposX, refposY, totalHeight, is1Max) {
    const lengthHorizontalTic = 3;
    const toCen = is1Max; // is1Max
    const shift_line = toCen ? 0 : totalHeight / 2;
    const shift_text = toCen ? totalHeight - 5 : totalHeight + 2;
    //horizontal line
    this.svg
      .append('line')
      .attr('x1', refposX)
      .attr('y1', refposY + shift_line)
      .attr('x2', refposX + lengthHorizontalTic)
      .attr('y2', refposY + shift_line)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    this.svg
      .append('line')
      .attr('x1', refposX)
      .attr('y1', refposY)
      .attr('x2', refposX)
      .attr('y2', refposY + totalHeight + 1)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    let textElem = this.svg
      .append('text')
      .attr('x', refposX + lengthHorizontalTic)
      .attr('y', refposY + shift_text)
      .text('1')
      .attr('font-size', '10px')
      .attr('font-family', 'Helvetica')
      .attr('font-weight', 'bold');
    const bboxWidth = textElem.node().getBBox().width;
    const widhtOfScaleArea = bboxWidth + lengthHorizontalTic;
    return widhtOfScaleArea;
  }

  #draw() {
    let posX = 0;
    const posYsp = 15;
    const posYproj = posYsp + 18;

    this.data.forEach((entry, i) => {
      const { dispValue1, dispValue2, labelVarSet, molAtomIndices } = entry;

      // Determine if the first element of this.settings.type is "toCen"
      const isToCen1 = this.settings.types[0] === 'toMax';
      const isToCen2 = this.settings.types[1] === 'toMax';

      // Call plot01 with isToCen determining the last parameter
      const numberSteps = 3;
      const width = 3; // width in pt
      const totalWidthInPt = numberSteps * width + 8;

      let textElem = this.svg
        .append('text')
        .attr('x', posX)
        .attr('y', 10)
        .text(labelVarSet)
        .attr('font-size', '10px')
        .attr('font-family', 'Helvetica')
        .attr('font-weight', 'bold');

      let bbox = textElem.node().getBBox();
      let smallestValue = Math.max(bbox.width, totalWidthInPt);
      let additionalShift = 0;
      if (bbox.width > totalWidthInPt) {
        additionalShift = Math.round((bbox.width - totalWidthInPt) / 2.0);
      }

      this.#plot01(
        posX + additionalShift,
        posYsp,
        dispValue1,
        molAtomIndices,
        isToCen1,
        numberSteps,
        width,
      );
      if (this.settings.types.length > 1) {
        this.#plot01(
          posX + additionalShift,
          posYproj,
          dispValue2,
          molAtomIndices,
          isToCen2,
          numberSteps,
          width,
        ); // Assuming you want to keep this as false
      }
      // shift the position for next one...
      posX += smallestValue + 3;
    });
    this.svg.attr('width', posX - 3).attr('height', this.height);
  }
}
