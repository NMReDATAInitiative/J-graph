class BaseClass {
  constructor(name, options = {}) {
    // Initialize core properties
    this.name = name;

    // Save the entire options object
    this.options = options;

    // Handle options with defaults
    this.dataTypesSend = options.dataTypesSend || [];
    this.dataTypesReceive = options.dataTypesReceive || [];
    this.logAllDataExchange =
      options.logAllDataExchange !== undefined
        ? options.logAllDataExchange
        : true;

    this.receivers = []; // To store registered receivers
    this.receptionLog = []; // To store reception details
  }

  generateHashCode() {
    return Math.random().toString(36).substring(2, 6); // Generate a 4-character hash
  }

  sendData(type, inContent = []) {
    const sourceName = this.name;
    const dataToSend = {
      type: type,
      text: `${type} from ${this.name}`,
      name: this.name,
      hashCode: this.generateHashCode(),
      content: inContent,
    };
    this.receivers.forEach(({ receiver, dataType }) => {
      if (dataToSend.type === dataType) {
        console.log(
          'sendData ',
          dataType,
          ' from ',
          sourceName,
          ' to ',
          receiver,
        );
        receiver.receiveData(dataToSend, this.name);
      }
    });
  }

  receiveData(data, sender) {
    const receptionTime = new Date().toISOString();
    console.log(`${this.name} received from ${sender}:`, data);

    // Store the reception details
    if (this.logAllDataExchange) {
      this.receptionLog.push({
        hashCode: data.hashCode,
        time: receptionTime,
        text: data.text,
        typeMessage: 'receiveData',
      });
    }

    const updateFunctionName = data.type + '_UpdateFunction';
    let updateResult;
    if (typeof this[updateFunctionName] === 'function') {
      updateResult = this[updateFunctionName](data, sender);
    } else {
      console.log(
        `The member function ${updateFunctionName} does not exists. Save data as ${data.type} to this`,
      );

      // Store the received data, replacing any existing data for this data type
      this[data.type] = data.content;
      /* For storage as an array (good for full log)
      // Dynamically create a new property if it doesn't exist, based on the data type
      const dataTypeKey = data.type + '_array';
      if (!this.hasOwnProperty(dataTypeKey)) {
        this[dataTypeKey] = []; // Initialize the property as an array
      }

      // Store the received data and origin in the newly created or existing property
      this[dataTypeKey].push({
        data: data.content, // Store the entire data object
        origin: sender, // Store the sender's information
        time: receptionTime, // Store the reception time
      });
	  */
    }

    // Send a reply only to the initial sender with the same hashCode
    const replyData = {
      type: data.type,
      name: this.name,
      text: `${this.name}'s response to ${data.type}`,
      hashCode: data.hashCode, // Use the same hashCode as received
      content: updateResult,
    };
    this.sendReply(replyData, sender);
  }

  sendReply(data, originalSender) {
    // Find the original sender in the receivers list and send the reply only to them
    const receiverEntry = this.receivers.find(
      ({ receiver }) => receiver.name === originalSender,
    );

    if (receiverEntry) {
      receiverEntry.receiver.receiveResponse(data, this.name);
    }
  }

  receiveResponse(data, sender) {
    const receptionTime = new Date().toISOString();
    console.log(`${this.name} received response from ${sender}:`, data);

    if (data.content != null) {
      const updateFunctionName = data.type + '_UpdateFunctionResponse';

      if (typeof this[updateFunctionName] === 'function') {
        this[updateFunctionName](data, sender);
      } else {
        const dataTypeReturn = data.type + '_DefaultSave_Returned';
        console.log(
          `The member function ${updateFunctionName} does not exists. Save data as ${dataTypeReturn} to this`,
        );

        // Store the received data, replacing any existing data for this data type
        this[dataTypeReturn] = data.content;
      }
    }
    // Store the reception details for the response
    if (this.logAllDataExchange) {
      this.receptionLog.push({
        hashCode: data.hashCode,
        time: receptionTime,
        text: data.text,
        typeMessage: 'returnData',
      });
    }
  }

  getExportTypes() {
    return this.dataTypesSend;
  }

  getImportTypes() {
    return this.dataTypesReceive;
  }

  registerReceiver(receiver, dataType) {
    console.log(
      this.name,
      ' registers data type ',
      dataType,
      ' for class ',
      receiver.name,
    );
    this.receivers.push({ receiver, dataType }); // Register each receiver with its data type
  }

  triggerWindow(content) {
    const type = 'windowData';
    console.log(`${this.name} triggered a ${type} event.`);
    this.sendData(type, content);
  }

  windowData_UpdateFunction(data, sender) {
    console.log(this.name, '-----_windowDataUpdateFunction > data :', data);
    console.log(
      this.name,
      '-----_windowDataUpdateFunction > data.content :',
      data.content,
      ' sender ',
      sender,
    );

    // store in array...
    const dataTypeKey = data.type + '_array';
    if (!this.hasOwnProperty(dataTypeKey)) {
      this[dataTypeKey] = []; // Initialize the property as an array
    }
    const receptionTime = new Date().toISOString();

    // Store the received data and origin in the newly created or existing property
    this[dataTypeKey].push({
      type: data.type, // Store the entire data object
      data: data.content, // Store the entire data object
      origin: sender, // Store the sender's information
      time: receptionTime, // Store the reception time
    });

    const inContent = { returnedData: 155, ffd: 33, reception : "OK" };

    return inContent;
  }
  windowData_UpdateFunctionResponse(data, sender) {
    console.log(
      this.name,
      '-----_windowData_UpdateFunctionReturn > data :',
      data,
    );

    // this.savedBy_windowData_UpdateFunctionReturn = data;
    // store in array...
    const dataTypeKey = data.type + '_array_returned';
    if (!this.hasOwnProperty(dataTypeKey)) {
      this[dataTypeKey] = []; // Initialize the property as an array
    }
    const receptionTime = new Date().toISOString();

    // Store the received data and origin in the newly created or existing property
    this[dataTypeKey].push({
      type: data.type, // Store the entire data object
      data: data.content, // Store the entire data object
      origin: sender, // Store the sender's information
      time: receptionTime, // Store the reception time
    });
  }
}

////////////////////////      END OF BASE CLASS DEFINITION     ////////////////////////
class Toto extends BaseClass {
  constructor(name) {
    super(name, {
      dataTypesSend: ['windowData'],
      dataTypesReceive: ['windowData'],
    });
  }
}

class Jgraph extends BaseClass {
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

class NmrSpectrum extends BaseClass {
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
