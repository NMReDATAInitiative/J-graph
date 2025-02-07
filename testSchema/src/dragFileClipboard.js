// SVG Icons
const icons = {
    default: `<svg id="dropzoneSVG" width="50" height="50" viewBox="0 0 24 24" fill="none"
                    stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    onmouseover="this.querySelector('polyline').setAttribute('stroke', 'blue')"
                    onmouseout="this.querySelector('polyline').setAttribute('stroke', 'black')">
                    <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 1-2-2z">
                    <animateTransform attributeType="XML" attributeName="transform" type="translate" 
                    values="0 0; 0 -2; 0 0" dur="0.6s" repeatCount="indefinite"/>
                    </path>
                    <polyline stroke="black" points="9 22 9 12 15 12 15 22"></polyline>
              </svg>`,
    fileDetected: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none"
                           stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                           <path d="M7 8h10"></path>
                           <path d="M7 12h10"></path>
                           <path d="M7 16h10"></path>
                   </svg>`,
    validJson: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none"
                         stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <polyline points="20 6 9 17 4 12"></polyline>
               </svg>`,
    invalidJson: `<svg width="50" height="50" viewBox="0 0 24 24" fill="none"
                           stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <line x1="5" y1="5" x2="19" y2="19"></line>
                           <line x1="19" y1="5" x2="5" y2="19"></line>
                 </svg>`
};

// Recursively read folder contents
function readDirectoryContents(directoryEntry) {
    const reader = directoryEntry.createReader();
    reader.readEntries(entries => {
        if (entries.length === 0) {
            console.log(`📁 Folder "${directoryEntry.name}" is empty.`);
            return;
        }
        console.log(`📁 Folder "${directoryEntry.name}" contains:`);
        entries.forEach(entry => {
            if (entry.isDirectory) {
                console.log(`📂 [Folder] ${entry.name}`);
                readDirectoryContents(entry); // Recursive call for nested folders
            } else {
                console.log(`📄 [File] ${entry.name}`);
            }
        });
    }, error => console.error("Error reading directory:", error));
}

// Reset the dropzone to default
function resetDropzone() {
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");
    const jsonOutput = document.getElementById("jsonOutput");

    dropzone.style.background = "#fff";
    dropzoneIcon.innerHTML = icons.default;
    dropzoneText.innerText = "Paste / Drop File Here";
    jsonOutput.innerText = "No JSON loaded yet.";
}

// Handle clipboard paste
function handlePaste(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneText = document.getElementById("dropzoneText");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const jsonOutput = document.getElementById("jsonOutput");

    const clipboardData = event.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    if (!items) {
        console.warn("📋 No clipboard data available.");
        return;
    }

    console.log(`📋 Pasted ${items.length} item(s).`);
    let pastedText = clipboardData.getData("text/plain");

    if (pastedText) {
        console.log(`📝 Pasted Text: ${pastedText.substring(0, 100)}`);

        try {
            const jsonData = JSON.parse(pastedText);
            console.log("✅ Valid JSON pasted:", jsonData);
            dropzoneText.innerText = "✅ Valid JSON pasted!";
            dropzoneIcon.innerHTML = icons.validJson;
            dropzone.style.background = "#d0ffd0"; // Green background for valid JSON
            jsonOutput.innerText = JSON.stringify(jsonData, null, 4);
        } catch (error) {
            console.warn("❌ Invalid JSON or regular text pasted.");
            dropzoneText.innerText = "❌ Invalid JSON or plain text pasted.";
            dropzoneIcon.innerHTML = icons.invalidJson;
            dropzone.style.background = "#ffd0d0"; // Red background for invalid JSON
            jsonOutput.innerText = pastedText;
        }
        return; // Stop processing further since this was plain text
    }
}

// Handle dropped files
function handleFileDrop(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");
    const jsonOutput = document.getElementById("jsonOutput");
    dropzone.style.background = "#d0ffd0"; // Light green for file detected

    const items = event.dataTransfer.items;
    if (!items) return;

    console.log(`📂 Dropped ${items.length} item(s).`);

    let fileListObj = { list: "" }; // Store file list as an object
    let validJsonFound = false;

    [...items].forEach(item => {
        const entry = item.webkitGetAsEntry();
        if (!entry) return;

        if (entry.isDirectory) {
			fileListObj.list += `📁 Folder Detected: ${entry.name}\n`;
            console.log(`📁 Folder Detected: ${entry.name}`);
            dropzoneText.innerText = `📁 Folder: ${entry.name} (Cannot read directly)`;
			// has list of files, not the files themselfs
            readDirectoryContents(entry);
        } else if (entry.isFile) {
            processFile(item.getAsFile(), fileListObj, dropzoneIcon, dropzoneText, jsonOutput, () => {
                validJsonFound = true;
            });
        }
    });

    setTimeout(() => {
        if (!validJsonFound) {
            jsonOutput.innerText = fileListObj.list;
            dropzoneIcon.innerHTML = icons.fileDetected;
        }
    }, 200); // Small delay to ensure files are processed
}


// Process individual files
function processFile(file, fileListObj, dropzoneIcon, dropzoneText, jsonOutput, jsonCallback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        console.log(`📄 File: ${file.name}, Size: ${file.size} bytes`);
        console.log(`📝 First 100 chars:\n${e.target.result.substring(0, 100)}`);
        if (file.name.endsWith(".json")) {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log(`✅ ${file.name} is a valid JSON`);
                dropzoneIcon.innerHTML = icons.validJson;
                dropzoneText.innerText = "✅ Valid JSON File!";
                jsonOutput.innerText = JSON.stringify(jsonData, null, 4);
                jsonCallback();
            } catch (err) {
                console.error(`❌ ${file.name} is an invalid JSON`, err);
                dropzoneIcon.innerHTML = icons.invalidJson;
                dropzoneText.innerText = "❌ Invalid JSON File!";
            }
        } else {
            fileListObj.list += `📄 File: ${file.name} (Type: ${file.type || "unknown"}, Size: ${file.size} bytes)\n`;
        }
    };
    reader.readAsText(file);
}

