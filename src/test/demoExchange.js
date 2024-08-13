
const { GraphBase } = require('../graphBase.js');

////////////////////////      END OF BASE CLASS DEFINITION     ////////////////////////
class Toto extends GraphBase {
  constructor(name) {
    super(name, {
      dataTypesSend: ['windowData'],
      dataTypesReceive: ['windowData'],
    });
  }
}

class Jgraph extends GraphBase {
  constructor(name) {
    super(name, {
      dataTypesSend: ['windowData', 'listPPMForPointFromPPM'],
      dataTypesReceive: ['windowData', 'pointFromPPM'],
    });
  }

  triggerlistPPMForPointFromPPM(content) {
    const type = 'listPPMForPointFromPPM';
    console.log(
      `${this.name} triggerlistPPMForPointFromPPM triggered a send ${type} event.`,
    );
    this.sendData(type, content);
  }
}

class NmrSpectrum extends GraphBase {
  constructor(name) {
    super(name, {
      dataTypesSend: ['windowData', 'pointFromPPM'],
      dataTypesReceive: ['windowData', 'listPPMForPointFromPPM'],
      logAllDataExchange: true, // Enable logging for this instance if true
    });
  }

  triggerpointFromPPM(content) {
    const type = 'pointFromPPM';
    console.log(
      `triggerpointFromPPM ${this.name} triggered an send for ${type}.`,
    );
    this.sendData(type, content);
  }

listPPMForPointFromPPM_UpdateFunction(data, sender) {
	// default action
    // this[data.type] = data.content;

	this.data_from_Jgraph_save_by_listPPMForPointFromPPM_UpdateFunction = data.content;
    const inContent = { returnedData: 156, ffd: 222, reception : "NMROK" };

    return inContent;
  }

}
function main() {
  // Create instances of each class with unique identifiers

  const toto1 = new Toto('Toto1');
  const toto2 = new Toto('Toto2');
  const toto3 = new Toto('Toto3');
  const jgraph1 = new Jgraph('Jgraph1');
  const nmrSpectrum1 = new NmrSpectrum('NmrSpectrum1');

  const classes = [toto1, toto2, toto3, jgraph1, nmrSpectrum1];

  // Register each class as a receiver for every other class based on data type compatibility
  classes.forEach((sender) => {
    classes.forEach((receiver) => {
      if (sender !== receiver) {
        // Register only if sender's dataTypesSend matches receiver's dataTypesReceive
        sender.getExportTypes().forEach((sendType) => {
          if (receiver.getImportTypes().includes(sendType)) {
            sender.registerReceiver(receiver, sendType);
          }
        });
      }
    });
  });

  // Trigger events and send data
  const doTrigerWindows = true;
  classes.forEach((cls) => {
    if (cls instanceof NmrSpectrum) {
      console.log(`========= ${cls.name} start `);
      if (doTrigerWindows)
        cls.triggerWindow({
          xxRand: Math.random() * 100,
          yRand: Math.random() * 100,
        }); // Toto sends data to all registered classes

      cls.triggerpointFromPPM({ dum: 1, ffd: Math.random() * 100 }); // Trigger event in NmrSpectrum, sending data to all registered classes
    } else if (cls instanceof Jgraph) {
      console.log(`========= ${cls.name} start `);

      cls.triggerlistPPMForPointFromPPM({ dum: 1, ffd: 4343 }); // Trigger event in Jgraph, sending data to all registered classes
      if (doTrigerWindows)
        cls.triggerWindow({
          xxRand: Math.random() * 100,
          yRand: Math.random() * 100,
        }); // Toto sends data to all registered classes
    } else if (cls instanceof Toto) {
      console.log(`========= ${cls.name} start `);

      if (doTrigerWindows)
        cls.triggerWindow({
          xxRand: Math.random() * 100,
          yRand: Math.random() * 100,
        }); // Toto sends data to all registered classes
    }
  });

  console.log('log 0 : ', classes[0].receptionLog);
  console.log('log 1 : ', classes[1].receptionLog);

  console.log('log 2 : ', classes[2].receptionLog);
  console.log('log 3 : ', classes[3].receptionLog);
  console.log('log 4 : ', classes[4].receptionLog);
  console.log('---------------------------------');
  console.log('---------------------------------');
  console.log('---------------------------------');
  console.log('classes 0 : ', classes[0]);
  console.log('---------------------------------');

  console.log('classes 1 : ', classes[1]);
  console.log('---------------------------------');

  console.log('classes 2 : ', classes[2]);
  console.log('---------------------------------');

  console.log('classes 3 : ', classes[3]);
  console.log('---------------------------------');

  console.log('classes 4 : ', classes[4]);
  console.log('---------------------------------');
}

// Run the main function
main();
