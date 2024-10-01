import { GraphBase } from './graphBase.js';

export class ControlSliders extends GraphBase {
  constructor(
    containerSelector,
    options = {},
    name = 'nameIsWiredInConstructor_ControlSliders1',
  ) {
    // data for GraphBase which takes care of communication between classes
    super(name, {
      dataTypesSend: ['controlSliders'],
      dataTypesReceive: [],
      logAllDataExchange: false, // Enable logging for this instance if true
    });

    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      console.error(`Container element not found: ${containerSelector}`);
      return;
    }

    // Set default options and override with provided options
    this.options = {
      min: options.min !== undefined ? options.min : 0,
      max: options.max !== undefined ? options.max : 0,
      step: options.step !== undefined ? options.step : 1,
      initialValue:
        options.initialValue !== undefined ? options.initialValue : null,
      width: options.width !== undefined ? options.width : '100 pt',
      margin: options.margin !== undefined ? options.margin : '20px 0',
      precision: options.precision !== undefined ? options.precision : 0,
      constantShift:
        options.constantShift !== undefined ? options.constantShift : 0,
      shiftLog: options.shiftLog !== undefined ? options.shiftLog : 0,
      logScale: options.logScale !== undefined ? options.logScale : false,
      number: options.number !== undefined ? options.number : 1,
    };

    this.recalculatedValues = [];
    this.init();
  }

  init() {
    this.createSliders();
    for (let i = 0; i < this.options.number; i++) {
      this.updateValueDisplay(this.sliders[i].value, i);
    }
  }

  createSliders() {
    this.container.style.display = 'flex'; // Use flexbox for layout
    this.container.style.flexDirection = 'column'; // Stack elements vertically
    this.container.style.width = '200px'; // Set desired width of the container
    this.container.style.width = parseInt(this.options.width) + 50 + 'px'; // Add 50 to this.options.width

    // Initialize an array to store the sliders
    this.sliders = [];
    this.valueDisplay = [];

    // Set the number of sliders you want to create

    // Loop to create multiple sliders
    for (let i = 0; i < this.options.number; i++) {
      // Create a container to hold both the slider and the value display
      let sliderContainer = document.createElement('div');
      sliderContainer.style.display = 'flex'; // Use flexbox to align items in a row
      sliderContainer.style.alignItems = 'center'; // Align slider and span vertically

      let slider = document.createElement('input');
      slider.type = 'range';
      slider.min = this.options.min;
      slider.max = this.options.max;
      slider.step = this.options.step;
      if (this.options.initialValue === null) {
        slider.value =
          this.options.min +
          Math.random() * (this.options.max - this.options.min);
      } else {
        slider.value = this.options.initialValue;
      }
      slider.style.width = this.options.width;
      slider.style.margin = this.options.margin;
      this.sliders[i] = slider;

      // Add event listener for input change, using a closure to capture the correct value of `i`
      this.sliders[i].addEventListener(
        'input',
        ((index) => {
          return (event) => {
            this.updateValueDisplay(event.target.value, index); // Pass the index of the slider
            this.updateDispQuality();
          };
        })(i),
      ); // Immediately invoked function to capture the current value of `i`

      // Append slider to the slider container
      sliderContainer.appendChild(slider);

      // Create and append value display for each slider
      this.valueDisplay[i] = document.createElement('span');
      this.valueDisplay[i].style.marginLeft = '10px';
      sliderContainer.appendChild(this.valueDisplay[i]);

      // Append the container with both slider and value display to the main container
      this.container.appendChild(sliderContainer);
    }

    // Append container to a parent element (e.g., document body or another container)
    document.body.appendChild(this.container); // or any other parent element
  }

  updateValueDisplay(value, index) {
    let usedValue = value;
    if (this.options.logScale) {
      if (value > 0) {
        usedValue =
          this.options.constantShift +
          Math.pow(10.0, -this.options.shiftLog + Math.abs(value));
      } else {
        if (value < 0) {
          usedValue =
            this.options.constantShift -
            Math.pow(10.0, -this.options.shiftLog + Math.abs(value));
        } else {
          usedValue = this.options.constantShift;
        }
      }
    }

    const formattedValue = parseFloat(usedValue).toFixed(
      this.options.precision,
    );
    this.valueDisplay[index].textContent = formattedValue;

    // Store the recalculated value
    this.recalculatedValue = usedValue;
    this.recalculatedValues[index] = usedValue;
  }

  updateDispQuality() {
    const content = this.recalculatedValues;
    this.triggerSend('controlSliders', content);
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
