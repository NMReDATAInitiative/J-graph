import { GraphBase } from './graphBase.js';

export class SsSpectrum extends GraphBase {
  constructor(
    selector,
    JmolAppletA,
    width = 500,
    height = 252,
    name = 'nameIsWiredInConstructor_SsSpectrum',
  ) {
    // data for GraphBase which takes care of communication between classes
    super(name, {
      dataTypesSend: [],
      dataTypesReceive: ['controlSliders'],
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

  updatePrincipalComponents() {
    var values = [];
    values.push(Number(this.data[0]));
    values.push(Number(this.data[1]));
    values.push(Number(this.data[2]));
    console.log(' values :', values);

    const iso = (values[0] + values[1] + values[2]) / 3.0;
    console.log(' iso :', iso);
    console.log(' 0 :', this.data[0]);
    console.log(' 1 :', this.data[1]);
    console.log(' 2 :', this.data[2]);
    //const sorted = this.data.sort((a, b) => a - b);
    const sorted = this.data.sort(
      (a, b) => Math.abs(a - iso) - Math.abs(b - iso),
    );
    const zz = sorted[2]; // largest
    const xx = sorted[1]; // second largest
    const yy = sorted[0]; // smallest
    const sAni = zz - iso; // > 0
   const eta = (Math.abs(sAni) < 1e-10) ? 0.0 :(yy - xx) / sAni;
    //const eta = (yy - xx) / sAni;
    let etaRoundedDown = (Math.floor(eta * 100) / 100).toFixed(2); // Rounds down to 2 decimal places and converts to a string
    let etaRoundedUp = (Math.ceil(eta * 100) / 100).toFixed(2); // Rounds down to 2 decimal places and converts to a string
    const factorCorr = (eta - etaRoundedDown) * 100;
    const crudeArrayDown = this.rank2stat[etaRoundedDown];
          console.log('etaString :', etaRoundedDown);
    console.log('etaString :', etaRoundedUp);
 console.log('etaRoundedDown :', this.rank2stat[etaRoundedDown]);
    console.log('etaRoundedUp :', this.rank2stat[etaRoundedUp]);
    const i0Down = this.rank2stat[etaRoundedDown].i0;
    const crudeArrayUp = this.rank2stat[etaRoundedUp];
    const i0Up = this.rank2stat[etaRoundedUp].i0;

    let fullDown = new Array(crudeArrayDown.i0).fill(0.0);
    fullDown = fullDown.concat(crudeArrayDown.y);
    let fullUp = new Array(crudeArrayUp.i0).fill(0.0);
    fullUp = fullUp.concat(crudeArrayUp.y);

    const largestI0 = (i0Up > i0Down) ? i0Up : i0Down;
    var x = [];
    var y = [];
    for (var i = 0; i < (crudeArrayDown.y.length); i++) {
      const valx = this.rank2stat.x.origin + (i0Down + i) * this.rank2stat.x.increment;
      const valxFiexedAnis = sAni * valx / 1000.0 + iso;
      x.push(valxFiexedAnis);
      let valy0 = crudeArrayDown.y[i];
      // make first order correction using factorCorr and crudeArrayUp
      // var valyNext = valy0;
      //if ((i0Up - i0Down) > i)
      // valy0 += ...

      y.push(valy0);
    }
    this.plotx = x;
    this.ploty = y;
    
    console.log(' zz :', zz, ' yy :', yy, ' xx :', xx);
    console.log(
      'Sorted zz :',
      Math.abs(zz - iso),
      ' yy :',
      Math.abs(yy - iso),
      ' xx :',
      Math.abs(xx - iso),
    );
    console.log('eta :', eta);
    console.log('factorCorr :', factorCorr);
    console.log('sAni :', sAni);
    // const pickDown = this.rank2stat[etaRoundedDown];
    //   console.log('pickDown :', pickDown);
   
    console.log('fullDown :', fullDown);
    console.log('x :', x);
    console.log('y :', y);
  }

  async loadPickupDataFiles() {
    this.rank2ssbs = await d3
      .json('../data/ssNMR/rank2ssbs.json')
      .catch((error) => {
        console.error('Error loading the rank2ssbs file:', error);
        return null; // Ensure null is returned to avoid further processing
      });

    this.rank2stat = await d3
      .json('../data/ssNMR/rank2stat.json')
      .catch((error) => {
        console.error('Error loading the rank2stat file:', error);
        return null; // Ensure null is returned to avoid further processing
      });
  }

  controlSliders_UpdateFunction(data, sender) {
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
      this.data = [];
    }

      value.forEach((aValue, index) => {
        //this.data[`dispValue${index}`] = aValue;
        this.data[index] = aValue;
      });

    this.updatePrincipalComponents();

    // Redraw the SVG with updated data
    this.#draw();

    var inContent = null;
    inContent = { reception: 'sliderUpdateOK' };
    return inContent;
  }

  async init() {
  try {
      // Wait for the files to be loaded
      await this.loadPickupDataFiles();

      // After loading, you can do any additional initialization here
      console.log('Initialization complete, data is loaded');
      
      // Call any other methods that need the data to be loaded first
      this.updatePrincipalComponents();
    } catch (error) {
      console.error('Initialization failed:', error);
    }
   

    //this.#initialize(jsonData, options);
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

  #draw() {

 const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

// Create a group element within the SVG to apply margins
    const g = this.svg
      .append('g')
.attr('transform', `translate(${margin.left},${margin.top})`);

    // Define the scales for x and y
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(this.plotx) - 1, d3.max(this.plotx) + 1])  // Data range for x
      .range([0, width]);  // Scale to fit in the available width

    const yScale = d3
      .scaleLinear()
      //.domain([d3.min(this.ploty), d3.max(this.ploty)])  // Data range for y
      .domain([0, 1.0])  // Data range for y
      .range([height, 0]);  // Scale to fit in the available height (inverted for y)

    // Create and append x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Create and append y-axis
    g.append('g').call(d3.axisLeft(yScale));

    // Create the line generator function
    const line = d3
      .line()
      .x((d, i) => xScale(this.plotx[i]))  // x based on the xScale
      .y((d, i) => yScale(this.ploty[i]));  // y based on the yScale

    // Append the line to the plot
    g.append('path')
      .datum(this.ploty)  // Bind y data to the line
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')  // Line color
      .attr('stroke-width', 2)
      .attr('d', line);  // Call the line generator to create the path 
    return;
   
  }
}
