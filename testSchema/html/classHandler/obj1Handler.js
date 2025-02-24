class Obj1Handler {
  constructor(obj = {}) {
    this.obj = obj;
  }

  
  showAllOptionsInHTML(container) {
    console.log("starts showAllOptionsInHTML");
    container.innerHTML = ''; // Clear existing content before adding new elements
    this.showViewer();
    this.showUpdate();

    const methods = this.listNonStaticMethods("_Elevator"); // get all elevator methods
    methods.forEach(method => {
      this.showConvertTo(method.info); // Call showConvertTo for each elevator
    });

    this.showViewer2();
  }


listNonStaticMethods(include) {
    const prototype = Object.getPrototypeOf(this);
    const className = this.constructor.name;
    
    console.log(`Class: ${className}`);
    console.log("Instance Methods:");

    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (prop) => typeof prototype[prop] === "function" && prop !== "constructor"
    );

    const results = [];

    methodNames.forEach((methodName) => {
      if (methodName.includes(include)) {
        const method = prototype[methodName];
        const result = method.call(this, "info"); // Call the method with "info"
        results.push({ method: methodName, info: result });
      }

      //console.log(`- ${methodName}`);
      //console.log(`  - Parameter count: ${prototype[methodName].length}`);
    });

    return results;
  }

  getDefaultValue(targetObj, htmlID) {
    const item = targetObj.arrayOfItems.find(item => item.htmlID === htmlID);
    return item ? item.defaultValue : {}; // Return undefined if not found
  }

  getValOrDefault(dataObj, input) {
        const content1 = document.getElementById(`${input}${dataObj.uniqueHTMLcode}`).dataset.content;
        return content1 ? JSON.parse(content1) : this.getDefaultValue(dataObj, input);// here add default value
}
  

  updateContent(data) {
    this.obj = data;
  }

  showUpdate() {
    const container = document.getElementById('dynamicContent');
    const frame = document.createElement('div');
    frame.className = 'frame blue-frame';
    frame.innerHTML = `<p>Update to: ${this.obj.age}</p>
            <button onclick="window.open('https://example.com/update', '_blank')">Update</button>`;
    container.appendChild(frame);
  }

  generateTableOfInput(frame, dataObj) {
    const dataArray = dataObj.arrayOfItems;
      frame.innerHTML = ""; // Clear previous content
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";

      dataArray.forEach(item => {
          if (!item.show) return; // Skip hidden rows

          const row = document.createElement("tr");

          // First column: Comment
          const commentCell = document.createElement("td");
          commentCell.textContent = item.comment;
          commentCell.style.border = "1px solid black";
          commentCell.style.padding = "5px";
          row.appendChild(commentCell);

          // Second column: Input field (either file or user input)
          const inputCell = document.createElement("td");
          inputCell.style.border = "1px solid black";
          inputCell.style.padding = "5px";

          let inputElement;
          if (item.type === "file") {
              inputElement = document.createElement("input");
              inputElement.type = "file";
              inputElement.id = item.htmlID + dataObj.uniqueHTMLcode;
              inputElement.accept = "application/json";
          } else if (item.type === "baseType") {
              inputElement = document.createElement("input");
              inputElement.id = item.htmlID  + dataObj.uniqueHTMLcode;

              // Set the correct input type based on baseType
              if (item.baseType === "int") {
                  inputElement.type = "number";
                  inputElement.step = "1"; // Only integers
                  if (item.defaultValue !== undefined) {
                      inputElement.value = parseInt(item.defaultValue, 10);
                  }
              } else if (item.baseType === "float") {
                  inputElement.type = "number";
                  inputElement.step = "any"; // Allow floating point numbers
                  if (item.defaultValue !== undefined) {
                      inputElement.value = parseFloat(item.defaultValue);
                  }
              } else if (item.baseType === "string") {
                  inputElement.type = "text";
                  if (item.defaultValue !== undefined) {
                      inputElement.value = item.defaultValue;
                  }
              }
          }
          if (inputElement) {
              inputCell.appendChild(inputElement);
          }
          row.appendChild(inputCell);
          table.appendChild(row);
      });
      frame.appendChild(table);
  }

  addFileInputListeners(dataObj, loadFileCallback, handleInputChange) {
    const dataArray = dataObj.arrayOfItems;
    dataArray.forEach(item => {
        const inputElement = document.getElementById(item.htmlID + dataObj.uniqueHTMLcode);
        if (!inputElement) return;
        if (item.type === "file") {
            // Add event listener for file inputs
            inputElement.addEventListener("change", loadFileCallback);
        } else if (item.type === "baseType") {
            // Add event listener for text/number inputs
            inputElement.addEventListener("input", handleInputChange);
        }
    });
  }
    
  showConvertTo(dataObj) {
    const container = document.getElementById('dynamicContent');
    const targetObjType = dataObj.targetObjType;
    const uniqueHTMLcode = dataObj.uniqueHTMLcode;

    
      // Create the container for the file input and button
      const frame = document.createElement('div');
      frame.className = 'frame red-frame';


      this.generateTableOfInput(frame, dataObj);
    
      frame.innerHTML += `          <button id="mergeButton${uniqueHTMLcode}">Create ${dataObj.targetObjType}</button>
          <pre id="mergeOutput${uniqueHTMLcode}"></pre>`;



      container.appendChild(frame);

      this.addFileInputListeners(dataObj, this.loadFile, this.handleInputChange);


      // Correctly bind "this" for combineFiles
      
    
    document
  .getElementById(`mergeButton${uniqueHTMLcode}`)
  .addEventListener("click", () => {
    const methodName = dataObj.elevatorMethod;// "combineFiles"; // Dynamic method name
    if (typeof this[methodName] === "function") {
      this[methodName](targetObjType, dataObj);
    } else {
      console.error(`Method "${methodName}" does not exist.`);
    }
  });

  }

  async loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      event.target.dataset.content = e.target.result;
    };
    reader.readAsText(file);
  }

  async handleInputChange(event) {
      event.target.dataset.content = event.target.value;
  }

  combineFiles(targetObjType, dataObj) {

    if (targetObjType == 'pairObj1') {
      const objm = this.getValOrDefault(dataObj, "input1");
      const obj1 = this.getValOrDefault(dataObj, "param1");
      
     
      // optional escape
     if(!document.getElementById(`input1${dataObj.uniqueHTMLcode}`).dataset.content) {
        const errorMessage = "Failed because of missing input1"
        document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = errorMessage;
        return;
      }
     

      const pairObj = {
        $schema:
          `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
        object1: this.obj,
        object2: objm,
        "param1" : obj1,
       
      };

      const content = { content: pairObj };
      const encodedContent = JSON.stringify(content);
      const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

      document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = JSON.stringify(
        pairObj,
        null,
        2,
      );
      window.open(linkUrl, '_blank');
    }
    if (targetObjType == 'groupObject1') {
      const content1 = document.getElementById(`input1${dataObj.uniqueHTMLcode}`).dataset.content;
      const content2 = document.getElementById(`input2${dataObj.uniqueHTMLcode}`).dataset.content;
      const content3 = document.getElementById(`param1${dataObj.uniqueHTMLcode}`).dataset.content;
     
      const obj11 = content1 ? JSON.parse(content1) : {}; // here add default value
      const obj22 = content2 ? JSON.parse(content2) : {};// here add default value
      const obj33 = content3 ? JSON.parse(content3) : {};// here add default value
    
       // optional escape
     if(!document.getElementById(`input1${dataObj.uniqueHTMLcode}`).dataset.content) {
        const errorMessage = "Failed because of missing input1"
        document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = errorMessage;
    //    return;
      }

      const objm1 = this.getValOrDefault(dataObj, "input1");
      const objm2 = this.getValOrDefault(dataObj, "input2");
      const obj1 = this.getValOrDefault(dataObj, "param1");
      const obj2 = this.getValOrDefault(dataObj, "param2");
      const obj3 = this.getValOrDefault(dataObj, "param3");
      const groupObj = {
        $schema:
          `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
        "members": [this.obj, objm1, objm2],
        "param1" : obj1,
        "param2" : obj2,
        "param3" : obj3,
      };

      const content = { content: groupObj };
      const encodedContent = JSON.stringify(content);
      const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

      document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = JSON.stringify(
        groupObj,
        null,
        2,
      );
      window.open(linkUrl, '_blank');
    }
    
  }

  showViewer() {
    const container = document.getElementById('dynamicContent');
    const frame = document.createElement('div');
    frame.className = 'frame green-frame';
    frame.innerHTML = `<svg width="200" height="200"></svg>`;
    container.appendChild(frame);

    const svg = d3.select(frame).select('svg');
    svg
      .append('circle')
      .attr('cx', 100)
      .attr('cy', 100)
      .attr('r', this.obj.age)
      .style('fill', 'green');
  }
  showViewer2() {
    const container = document.getElementById('dynamicContent');
    const frame = document.createElement('div');
    frame.className = 'frame green-frame';
    frame.innerHTML = `<svg width="200" height="200"></svg>`;
    container.appendChild(frame);

    const svg = d3.select(frame).select('svg');
    svg
      .append('circle')
      .attr('cx', 100)
      .attr('cy', 100)
      .attr('r', this.obj.age)
      .style('fill', 'blue');
  }

  myElevator1_Elevator(targetObjType, dataObj = {}) {
    const nyName = "myElevator1_Elevator"; // dont automatize in case use strict
    if (targetObjType =="info") {
      return { 
        "targetObjType" :"groupObject1" ,
        "uniqueHTMLcode" : nyName, // avoid name conflicts
        "elevatorMethod": nyName,
        "arrayOfItems": [
            { type: "file", htmlID: "input1", comment: "Upload JSON File 1 - mandatory", show: true },
            { type: "file", htmlID: "input2rr", comment: "Upload JSON File 2", show: true },
            { type: "baseType", htmlID: "param1", baseType: "int", comment: "Enter an Integer - this dummy test, not required by schema", defaultValue: 10, show: true },
            { type: "baseType", htmlID: "param2", baseType: "float", comment: "Enter a Float - this dummy test, not required by schema", defaultValue: 5.5, show: true },
            { type: "baseType", htmlID: "param3", baseType: "string", comment: "Enter a String - this dummy test, not required by schema",defaultValue: "toto", show: true }
        ]
      };
    }

     // optional escape
    if(!document.getElementById(`input1${dataObj.uniqueHTMLcode}`).dataset.content) {
      const errorMessage = "Failed because of missing input1"
      document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = errorMessage;
      return;
    }

    const objm1 = this.getValOrDefault(dataObj, "input1");
    const objm2 = this.getValOrDefault(dataObj, "input2rr");
    const obj1 = this.getValOrDefault(dataObj, "param1");
    const obj2 = this.getValOrDefault(dataObj, "param2");
    const obj3 = this.getValOrDefault(dataObj, "param3");
    const groupObj = {
      $schema:
        `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
      "members": [this.obj, objm1, objm2],
      "param1" : obj1,
      "param2" : obj2,
      "param3" : obj3,
    };

    const content = { content: groupObj };
    const encodedContent = JSON.stringify(content);
    const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

    document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = JSON.stringify(
      groupObj,
      null,
      2,
    );
    window.open(linkUrl, '_blank');
    
  }

  myElevator2_Elevator(targetObjType, dataObj = {}) {
    const nyName = "myElevator2_Elevator"; // dont automatize in case use strict
    if (targetObjType =="info") {
      return { "targetObjType" :"pairObj1" ,
        "uniqueHTMLcode" : nyName,// avoid name conflicts use different names
        "elevatorMethod": nyName, // this is the name of the methods
        "arrayOfItems": [
            { type: "file", htmlID: "input1", comment: "Upload second object of type obj1", show: true },
            { type: "baseType", htmlID: "param1", baseType: "int", comment: "Enter an Integer", defaultValue: 10, show: true },
        ]
      };
    }
  
    const objm = this.getValOrDefault(dataObj, "input1");
    const obj1 = this.getValOrDefault(dataObj, "param1");

    // optional escape
    if(!document.getElementById(`input1${dataObj.uniqueHTMLcode}`).dataset.content) {
      const errorMessage = "Failed because of missing input1"
      document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = errorMessage;
      return;
    }

    const pairObj = {
      $schema:
        `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
      object1: this.obj,
      object2: objm,
      "param1" : obj1,
    };

    const content = { content: pairObj };
    const encodedContent = JSON.stringify(content);
    const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

    document.getElementById(`mergeOutput${dataObj.uniqueHTMLcode}`).textContent = JSON.stringify(
      pairObj,
      null,
      2,
    );
    window.open(linkUrl, '_blank');
  }
}
