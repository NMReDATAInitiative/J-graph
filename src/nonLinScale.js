import { GraphBase } from './graphBase.js';

export class NonLinScale extends GraphBase {
  constructor(
    selector,
    JmolAppletA,
    width = 500,
    height = 252,
    name = 'nameIsWiredInConstructor_NonLinScale1',
  ) {
    // data for GraphBase which takes care of communication between classes
    super(name, {
      dataTypesSend: [],
      dataTypesReceive: ['controlSliders'],
      logAllDataExchange: false, // Enable logging for this instance if true
    });
this.stackAlternate = true;
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
    const eta = Math.abs(sAni) < 1e-10 ? 0.0 : (yy - xx) / sAni;
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

    const largestI0 = i0Up > i0Down ? i0Up : i0Down;
    var x = [];
    var y = [];
    for (var i = 0; i < crudeArrayDown.y.length; i++) {
      const valx =
        this.rank2stat.x.origin + (i0Down + i) * this.rank2stat.x.increment;
      const valxFiexedAnis = (sAni * valx) / 1000.0 + iso;
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
  roundDownToUnit(date, unit) {
    const newDate = new Date(date); // Create a copy of the original date
    switch (unit) {
      case 'year':
        newDate.setMonth(0, 1); // Set to January 1st
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'month':
        newDate.setDate(1); // Set to 1st of the month
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'day':
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'hour':
        newDate.setMinutes(0, 0, 0); // Set to :00:00.000
        break;
      case 'minute':
        newDate.setSeconds(0, 0); // Set to :00.000
        break;
      default:
        break;
    }
    return newDate;
  }
  roundUpToUnit(date, unit) {
    const newDate = new Date(date); // Create a copy of the original date
    switch (unit) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1); // Next year
        newDate.setMonth(0, 1); // Set to January 1st
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1); // Next month
        newDate.setDate(1); // Set to 1st of the month
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1); // Next day
        newDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
        break;
      case 'hour':
        newDate.setHours(newDate.getHours() + 1); // Next hour
        newDate.setMinutes(0, 0, 0); // Set to :00:00.000
        break;
      case 'minute':
        newDate.setMinutes(newDate.getMinutes() + 1); // Next minute
        newDate.setSeconds(0, 0); // Set to :00.000
        break;
      default:
        break;
    }
    return newDate;
  }

  layOverStaightDrive(xyValues, dim, shiftArr = [0, 0]) {

	 const initX = xyValues.x + shiftArr[0];
    var initY = xyValues.y * this.heightLevels+ shiftArr[1];
	if ( !   this.stackAlternate ) {
		initY = ((xyValues.y % 2) == 0) ? - shiftArr[1] :  shiftArr[1];
	} 

    

    //On line with angle from 0 0;
    const angle = ((this.data[0] / 10.0) * Math.PI) / 180.0;
    const angleOrtho = angle + Math.PI / 2.0;

    const driveX = initX * Math.cos(angle);
    const driveY = initX * Math.sin(angle);

    const newX = driveX + initY * Math.cos(angleOrtho);
    const newY = driveY + initY * Math.sin(angleOrtho);

    if (dim == 'x') {
      return 50 + newX;
    }
    if (dim == 'y') {
      return 200 - newY;
    }
  }

  layOverBezierDrive(bezierLine, xyValues, dim, shiftArr = [0, 0]) {
    const initX = xyValues.x + shiftArr[0];
    var initY = xyValues.y * this.heightLevels+ shiftArr[1];
	if ( !   this.stackAlternate ) {
		initY = ((xyValues.y % 2) == 0) ? - shiftArr[1] :  shiftArr[1];
	}


    //On line with angle from 0 0;
    const pointOnBezier = bezierLine.getPointAtLength(initX);

    const driveX = pointOnBezier.x;
    const driveY = pointOnBezier.y;

    const delta = 0.01; // Small value for numerical derivative
    const pointBefore = bezierLine.getPointAtLength(initX - delta); // A point slightly before
    const pointAfter = bezierLine.getPointAtLength(initX + delta); // A point slightly after
    const angle = Math.atan2(
      pointAfter.y - pointBefore.y,
      pointAfter.x - pointBefore.x,
    );

    const newX = driveX + initY * Math.sin(angle);
    const newY = driveY - initY * Math.cos(angle);

    if (dim == 'x') {
      return newX;
    }
    if (dim == 'y') {
      return newY;
    }
	 if (dim == 'a') {
      return angle * 180.0 / Math.PI;
    }
  }

  moveText(distance) {
    const totD2 = distance / 10;
    const totD = distance / 10;
    this.movableText.toto.attr('startOffset', totD2 + 'px'); // Move the text by setting startOffset
    this.movableText.textElement.attr('startOffset', totD + 'px'); // Move the text by setting startOffset
    setTimeout(() => {
      this.movableText.textElement.attr('startOffset', 0 + 'px'); // Move the text by setting startOffset
    }, 1000);
  }
   createEquidistantArrayX(start, increment, numValues) {
    const array = [];
    for (let i = 0; i < numValues; i++) {
      array.push({ x: start + i * increment, y: 0 });
    }
    return array;
  }
  createLogArrayX(start, increment, numValues, logInitial, logFinal) {
	this.heightLevels = 15;
	const end = 213.4454342523523534423;
  var array = [];
	var startCurr = start;
	if (true) {
		const incrementLoop = (logInitial <= logFinal) ? 1 : -1;
		var incLevel = 0;
		console.log("arrayff",logInitial,logFinal, incrementLoop)

		for (var loopLog = logInitial ; loopLog != logFinal; loopLog += incrementLoop, incLevel ++) {
						console.log("loopLog loopLog : ", loopLog)

			const tickIncrement = Math.pow(10.0, loopLog);
									console.log("loopLog tickIncrement : ", tickIncrement)

			const fromC = tickIncrement * Math.ceil(startCurr / tickIncrement);
            const fromF = tickIncrement * Math.floor(startCurr / tickIncrement);
            const endC = tickIncrement * Math.ceil(end / tickIncrement);
            const endF = tickIncrement * Math.floor(end / tickIncrement);
			console.log("loopLog F: ", fromF);
			console.log("loopLog C: ", fromC);
				console.log("loopLog F: ", endF);
			console.log("loopLog C: ", endC);
			var counterMaxEmergency = 0;
			var last = 0;
			const refLoopS = fromC;
			const refLoopE = endF;
			for (let i = refLoopS; tickIncrement > 0 ? i < refLoopE + tickIncrement / 2: i > refLoopE - tickIncrement / 2; i+= tickIncrement) {
				const isFirst = (i === refLoopS);
				const isLast2 = (i + tickIncrement > refLoopE);
				const isLast = Math.abs(refLoopE - i) < tickIncrement / 2.0;
				const posx = 120 +20* ( -Math.log( end - i));
				var label = String(i / tickIncrement) + "e" + String(loopLog);
				//var label = i.toExponential(0) + " !"; //String( Math.round(i));
				if (loopLog ==0) {
									 label = i.toFixed(); //String( Math.round(i));

								}

				if (loopLog < 0) {//1:10  0:1 -1:
				 label = i.toFixed(-loopLog) ;//String(tickIncrement *  Math.round(i / tickIncrement));
				}

			      array.push({ x: posx, y: incLevel, zT : i, first : isFirst, last : isLast, label, label});
				  counterMaxEmergency++;
				  last = i;
				  
			}
										console.log("loopLog------- add  ", counterMaxEmergency, " ticks  last : ",last, " ", array[array.length - 1].x);

			startCurr = endF;

		}
	} else {
	    for (let i = 0; i < numValues; i++) {
	      array.push({ x: start + i * increment, y: 0 * this.heightLevels });
	    }
	}

    return array;
  }
  addText(text, x, y, align = "center", alignVert = "bottom", angle = 0, fontSize = 20) {
            // Append text element to the svg
            var textElement = this.svg.append("text")
                .attr("x", x) // Position X
                .attr("y", y) // Position Y
                .attr("font-size", fontSize) // Set font size
				.style("text-anchor", align) // Set text alignment (left, center, right)
   				.style("dominant-baseline", alignVert) // Set vertical alignment (hanging, middle, bottom)
                .attr("transform", `rotate(${angle}, ${x}, ${y})`) // Rotate around (x, y)
                .text(text);



            // Get the bounding box (size of the text)
            var bbox = textElement.node().getBBox();

            // Log the text size (width and height)
            console.log(`Text width: ${bbox.width}, Text height: ${bbox.height}`);

            return bbox;
        }
  #draw() {
    //const dateWithTime = new Date(2024, 0, 1, 10, 30, 0);  // January 1, 2024 at 10:30:00
    //const dateArray = [new Date('2024-01-01'), new Date('2024-02-01'), new Date('2024-03-01')];

    // Start point for the spiral
    const center = [450, 50];
    let controlDistance = 20; // Initial distance of control point from start
    let startX = center[0];
    let startY = center[1] + controlDistance;

    // Parameters for spiral growth
    const numberOfCurves = 10; // Number of quadratic curves
    let angle = 0; // Initial angle
    let angleIncrement = Math.PI / 4; // Increment angle by 45 degrees for each segment
    let spiralExpansion = 5; // How much the spiral expands outward

    let pathData = `M ${startX} ${startY}`; // Move to start point

    for (let i = 0; i < numberOfCurves; i++) {
      // Calculate control and end points for each curve segment
      let controlX =
        startX + (controlDistance * Math.cos(angle)) / Math.sqrt(2);
      let controlY =
        startY + (controlDistance * Math.sin(angle)) / Math.sqrt(2);
      angle += angleIncrement;

      let endX = startX + (controlDistance + spiralExpansion) * Math.cos(angle);
      let endY = startY + (controlDistance + spiralExpansion) * Math.sin(angle);
      angle += angleIncrement;
      controlDistance += spiralExpansion;

      // Add quadratic curve to the path
      pathData += ` Q ${controlX} ${controlY} ${endX} ${endY}`;

      // Update the start point for the next curve
      startX = endX;
      startY = endY;

      // Increase the control distance for the next curve to create a spiral effect
    }

    // Append the spiral path to the SVG
    this.svg
      .append('path')
      .attr('id', 'myCurve2') // Give the path an ID to reference later
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2);

    // Create the curve path using D3 and append it to the SVG
    this.svg
      .append('path')
      .attr('id', 'myCurve') // Give the path an ID to reference later
      .attr('d', 'M 50 150 Q 250 50 450 150') // Define a quadratic curve
      .attr('fill', 'none')
      .attr('stroke', 'black');

    // Append the text and align it along the dynamically created path
    var textElement = this.svg
      .append('text')
      .append('textPath')
      .attr('href', '#myCurve') // Reference the path using its id
      //  .attr("startOffset", "50%") // Optional: center the text

       .attr("dominant-baseline", "hanging") //"middle"

      .text('Text along a curve using D3.js!');

    // Append the repeated text to the path using textPath with the specific start distance

    const svg = d3.select('svg');

    // Set the font size via a variable
    const fontSize = 12; // Font size in pixels

    // Get the length of the path
    const pathElement = document.getElementById('myCurve');
    const pathElement2 = document.getElementById('myCurve2');
    const pathLength2 = pathElement2.getTotalLength();

    // Define the text to be repeated
    //const repeatedText = 'Yes No ';
    const repeatedText = '. ';

    // Create a temporary text element to measure its width
    const tempText = svg
      .append('text')
      .attr('x', -1000) // Position off-screen
      .attr('y', -1000) // Position off-screen
      .style('font-size', fontSize + 'px') // Apply the dynamic font size
      .style('font-weight', 'bold') // Apply bold style
      .text(repeatedText);
    const textWidth = tempText.node().getComputedTextLength(); // Measure text width
    // Remove the temporary text element after measuring
    tempText.remove();

    // Calculate how many times the text can be repeated based on the curve length
    const repetitions = Math.floor(pathLength2 / textWidth); // Number of times text fits on the path
    let fullText = repeatedText.repeat(repetitions - 1);
    this.movableText = {};
    const toto = svg
      .append('text')
      .style('font-size', fontSize + 'px') // Apply the dynamic font size
      .append('textPath')
      .attr('href', '#myCurve2') // Reference the curve by its ID
      .attr('startOffset', '3px') // Start at the beginning of the curve
      .style('font-weight', 'bold') // Apply bold style
      .text(fullText);

    this.movableText.toto = toto;
    this.movableText.textElement = textElement;
    this.moveText(this.data[0]);

    var margin = { top: 20, right: 30, bottom: 30, left: 40 };
    var width = this.width - margin.left - margin.right;
    var height = this.height - margin.top - margin.bottom;

    var xyValues = this.createEquidistantArrayX(0, 15, 20);
    var xyValues = this.createLogArrayX(0, 15, 20, 1, -6);
	
	     // xyValues.push({ x:5, y: 0 });

	console.log("xyValues",xyValues);
    for (let i = 0; i < xyValues.length; i++) {
      // For each point, create a line segment at the constant y position
      const tickLength = 12;
 const xPos2 = this.layOverBezierDrive(pathElement, xyValues[i], 'x', [
        0,
        tickLength,
      ]);
      const yPos2 = this.layOverBezierDrive(pathElement, xyValues[i], 'y', [
        0,
        tickLength,
      ]);
      this.svg
        .append('line')
        .attr('x1', this.layOverStaightDrive(xyValues[i], 'x'))
        .attr('y1', this.layOverStaightDrive(xyValues[i], 'y'))
        .attr('x2', this.layOverStaightDrive(xyValues[i], 'x', [0, tickLength]))
        .attr('y2', this.layOverStaightDrive(xyValues[i], 'y', [0, tickLength]))
        .attr('stroke', 'green') // Line color
        .attr('stroke-width', 2); // Line thickness
      this.svg
        .append('line')
        .attr('x1', this.layOverBezierDrive(pathElement2, xyValues[i], 'x'))
        .attr('y1', this.layOverBezierDrive(pathElement2, xyValues[i], 'y'))
        .attr(
          'x2',
          this.layOverBezierDrive(pathElement2, xyValues[i], 'x', [
            0,
            tickLength,
          ]),
        )
        .attr(
          'y2',
          this.layOverBezierDrive(pathElement2, xyValues[i], 'y', [
            0,
            tickLength,
          ]),
        )
        .attr('stroke', 'blue') // Line color
        .attr('stroke-width', 2); // Line thickness
		const fontSize = 12;
const spaceXForLabels = fontSize / 3;
const spaceYForLabels = (tickLength > fontSize) ? (tickLength - fontSize) / 2 : 0;
      const xPos = this.layOverBezierDrive(pathElement, xyValues[i], 'x');
      const xPosP = this.layOverBezierDrive(pathElement, xyValues[i], 'x', [spaceXForLabels, spaceYForLabels]);
      const xPosM = this.layOverBezierDrive(pathElement, xyValues[i], 'x', [-spaceXForLabels, spaceYForLabels]);
      const yPos = this.layOverBezierDrive(pathElement, xyValues[i], 'y');
	  const yPosP = this.layOverBezierDrive(pathElement, xyValues[i], 'y', [spaceXForLabels, spaceYForLabels]);
      const yPosM = this.layOverBezierDrive(pathElement, xyValues[i], 'y', [-spaceXForLabels, spaceYForLabels]);

      const angle = this.layOverBezierDrive(pathElement, xyValues[i], 'a');
     
	   const xPos2P = this.layOverBezierDrive(pathElement, xyValues[i], 'x', [spaceXForLabels, tickLength + spaceYForLabels]);
      const xPos2M = this.layOverBezierDrive(pathElement, xyValues[i], 'x', [-spaceXForLabels, tickLength + spaceYForLabels]);
	  const yPos2P = this.layOverBezierDrive(pathElement, xyValues[i], 'y', [spaceXForLabels, tickLength + spaceYForLabels]);
      const yPos2M = this.layOverBezierDrive(pathElement, xyValues[i], 'y', [-spaceXForLabels, tickLength + spaceYForLabels]);
      this.svg
        .append('line')
        .attr('x1', xPos)
        .attr('y1', yPos)
        .attr('x2', xPos2)
        .attr('y2', yPos2)
        .attr('stroke', 'red') // Line color
        .attr('stroke-width', 2); // Line thickness

      var horizRef = 'middle'; // Set text alignment (start, middle, end)
      var alignVertRef = 'bottom'; // Set vertical alignment (hanging, middle, bottom)
      var yPosText = yPos;
      var xPosText = xPos;
	  
	  if (false) { // up/down labels
      if (xyValues[i].first) {
        horizRef = 'end'; // Set text alignment (start, middle, end)
		alignVertRef = 'text-bottom'; // Set vertical alignment (hanging, middle, bottom)
       xPosText = xPos2M;
       yPosText = yPos2M;
		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      } 
      if (xyValues[i].last) {
       yPosText = yPosP;
       xPosText = xPosP;
        horizRef = 'start'; // Set text alignment (start, middle, end)
		       alignVertRef = 'hanging'; // Set vertical alignment (hanging, middle, bottom)

		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      }
	}
	
	if (this.stackAlternate) {
      if (xyValues[i].first) {
        horizRef = 'end'; xPosText = xPosM;yPosText = yPosM;// Set text alignment (start, middle, end)
		alignVertRef = 'text-bottom'; // Set vertical alignment (hanging, middle, bottom)
       
		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      } 
      if (xyValues[i].last) {
       yPosText = yPos;
        horizRef = 'start'; xPosText = xPosP;yPosText = yPosP;// Set text alignment (start, middle, end)
		alignVertRef = 'text-bottom'; // Set vertical alignment (hanging, middle, bottom)

		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      }
      //this.addText(xyValues[i].label, xPos, yPosText, horizRef, alignVertRef, angle, 8); // left aligned (start)

    } else {
	horizRef = 'middle'; xPosText = xPos2;yPosText = yPos2;// Set text alignment (start, middle, end)

	const isUpAlternate = (xyValues[i].y % 2) == 0;
	if (!isUpAlternate) alignVertRef = 'text-bottom'; else alignVertRef = 'hanging';
      if (xyValues[i].first) {
       
		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      } 
      if (xyValues[i].last) {

		      this.addText(xyValues[i].label, xPosText, yPosText, horizRef, alignVertRef, angle, fontSize); // left aligned (start)

      }
	}

    // Create a group element within the SVG to apply margins
    const g = this.svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define the scales for x and y
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(this.plotx) - 1, d3.max(this.plotx) + 1]) // Data range for x
      .range([0, width]); // Scale to fit in the available width

    const yScale = d3
      .scaleLinear()
      //.domain([d3.min(this.ploty), d3.max(this.ploty)])  // Data range for y
      .domain([0, 1.0]) // Data range for y
      .range([height, 0]); // Scale to fit in the available height (inverted for y)

    // Create and append x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Create and append y-axis
    g.append('g').call(d3.axisLeft(yScale));

    // Create the line generator function
    const line = d3
      .line()
      .x((d, i) => xScale(this.plotx[i])) // x based on the xScale
      .y((d, i) => yScale(this.ploty[i])); // y based on the yScale

    // Append the line to the plot
    g.append('path')
      .datum(this.ploty) // Bind y data to the line
      .attr('fill', 'none')
      .attr('stroke', 'steelblue') // Line color
      .attr('stroke-width', 2)
      .attr('d', line); // Call the line generator to create the path
  }
}
}