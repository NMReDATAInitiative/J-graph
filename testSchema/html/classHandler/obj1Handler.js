class Obj1Handler {
  constructor(obj = {}) {
    this.obj = obj;
  }

  showAllOptionsInHTML(container) {
    console.log("starts showAllOptionsInHTML");
    container.innerHTML = ''; // Clear existing content before adding new elements
    this.showViewer();
    this.showUpdate();
    this.showConvertTo('groupObject1');
    this.showConvertTo('pairObj1');
    this.showViewer2();
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

  showConvertTo(targetObjType) {
    const container = document.getElementById('dynamicContent');
    
    if (targetObjType == 'groupObject1') {
      // Create the container for the file input and button
      const frame = document.createElement('div');
      frame.className = 'frame red-frame';

      // Set the inner HTML without using an inline onclick
      frame.innerHTML = `<p>Drop two JSON files to merge the current object into a ${targetObjType} object:</p>
          <input type="file" id="input1" accept="application/json">
          <input type="file" id="input2" accept="application/json">
          <button id="mergeButton2">Create ${targetObjType}</button>
          <pre id="mergeOutput2"></pre>`;

      container.appendChild(frame);

      // Add event listeners properly
      document
        .getElementById('input1')
        .addEventListener('change', this.loadFile);
      document
        .getElementById('input2')
        .addEventListener('change', this.loadFile);

      // Correctly bind "this" for combineFiles
      document
        .getElementById('mergeButton2')
        .addEventListener('click', () => this.combineFiles(targetObjType));
    }
    if (targetObjType == 'pairObj1') {
      // Create the container for the file input and button
      const frame = document.createElement('div');
      frame.className = 'frame red-frame';

      // Set the inner HTML without using an inline onclick
      frame.innerHTML = `<p>Drop one JSON files to merge the current object into a ${targetObjType} object:</p>
          <input type="file" id="input1s" accept="application/json">
          <button id="mergeButton1">Create ${targetObjType}</button>
          <pre id="mergeOutput1"></pre>`;

      container.appendChild(frame);

      // Add event listeners properly
      document
        .getElementById('input1s')
        .addEventListener('change', this.loadFile);

      // Correctly bind "this" for combineFiles
      document
        .getElementById('mergeButton1')
        .addEventListener('click', () => this.combineFiles(targetObjType));
    }
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

  combineFiles(targetObjType) {
    if (targetObjType == 'pairObj1') {
      const content1 = document.getElementById('input1s').dataset.content;
      if (!content1) return;
      const obj1 = JSON.parse(content1);
      const pairObj = {
        $schema:
          `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
        object1: obj1,
        object2: this.obj,
      };

      const content = { content: pairObj };
      const encodedContent = JSON.stringify(content);
      const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

      document.getElementById('mergeOutput1').textContent = JSON.stringify(
        pairObj,
        null,
        2,
      );
      window.open(linkUrl, '_blank');
    }
    if (targetObjType == 'groupObject1') {
      const content1 = document.getElementById('input1').dataset.content;
      const content2 = document.getElementById('input2').dataset.content;
      if (!content1 || !content2) return;
      const obj1 = JSON.parse(content1);
      const obj2 = JSON.parse(content2);
      const groupObj = {
        $schema:
          `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${targetObjType}.json`,
        "members": [this.obj, obj1, obj2]
      };

      const content = { content: groupObj };
      const encodedContent = JSON.stringify(content);
      const linkUrl = `https://nmredatainitiative.github.io/J-graph/testSchema/html/${targetObjType}.html#data=${encodedContent}`;

      document.getElementById('mergeOutput2').textContent = JSON.stringify(
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
}
