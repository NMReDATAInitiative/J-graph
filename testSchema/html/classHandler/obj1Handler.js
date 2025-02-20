class Obj1Handler {
  constructor(obj = {}) {
    this.obj = obj;
  }

  showAllOptionsInHTML(container) {
    container.innerHTML = ''; // Clear existing content before adding new elements
    this.showViewer();
    this.showUpdate();
    this.showConvert();
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

  showConvert() {
    const container = document.getElementById('dynamicContent');

    // Create the container for the file input and button
    const frame = document.createElement('div');
    frame.className = 'frame red-frame';

    // Set the inner HTML without using an inline onclick
    frame.innerHTML = `<p>Drop two JSON files to merge:</p>
        <input type="file" id="input1" accept="application/json">
        <input type="file" id="input2" accept="application/json">
        <button id="mergeButton">Merge</button>
        <pre id="mergeOutput"></pre>`;

    container.appendChild(frame);

    // Add event listeners properly
    document.getElementById('input1').addEventListener('change', this.loadFile);
    document.getElementById('input2').addEventListener('change', this.loadFile);

    // Correctly bind "this" for combineFiles
    document
      .getElementById('mergeButton')
      .addEventListener('click', () => this.combineFiles());
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

  combineFiles() {
    const content1 = document.getElementById('input1').dataset.content;
    const content2 = document.getElementById('input2').dataset.content;
    if (!content1 || !content2) return;

    const obj1 = JSON.parse(content1);
    const obj2 = JSON.parse(content2);
    const array = [obj1, obj2];
    document.getElementById('mergeOutput').textContent = JSON.stringify(
      array,
      null,
      2,
    );
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
