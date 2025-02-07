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
			  			  // SVG for "Valid File Detected"

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

// Reset the dropzone to default
function resetDropzone() {
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");

    dropzone.style.background = "#fff";
    dropzoneIcon.innerHTML = icons.default;
    dropzoneText.innerText = "Paste / Drop File Here";
}


// Handle clipboard paste
function handlePaste(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneText = document.getElementById("dropzoneText");

    const clipboardData = event.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    if (!items) {
        console.warn("📋 No clipboard data available.");
        return;
    }

    console.log(`📋 Pasted ${items.length} item(s).`);

    let fileCount = 0;
    let pastedText = clipboardData.getData("text/plain");

    if (pastedText) {
        console.log(`📝 Pasted Text: ${pastedText.substring(0, 100)}`);

        try {
            const jsonData = JSON.parse(pastedText);
            console.log("✅ Valid JSON pasted:", jsonData);
            dropzoneText.innerText = "✅ Valid JSON pasted!";
            dropzone.style.background = "#d0ffd0"; // Green background for valid JSON
            document.getElementById("jsonOutput").innerText = JSON.stringify(jsonData, null, 4);
        } catch (error) {
            console.warn("❌ Invalid JSON or regular text pasted.");
            dropzoneText.innerText = "❌ Invalid JSON or plain text pasted.";
            dropzone.style.background = "#ffd0d0"; // Red background for invalid JSON
            document.getElementById("jsonOutput").innerText = pastedText;
        }
        return; // Stop processing further since this was plain text
    }

    [...items].forEach(item => {
        if (item.kind === "file") {
            fileCount++;
            const file = item.getAsFile();
            console.log(`📄 Pasted File: ${file.name}, Size: ${file.size} bytes`);
            processFile(file);
        }
    });

    if (fileCount === 0) {
        console.log("❌ No files detected in paste operation.");
        dropzoneText.innerText = "No files detected in paste!";
    } else {
        dropzoneText.innerText = `📄 ${fileCount} file(s) pasted`;
    }
}


function handleFileDrop(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");
    dropzone.style.background = "#d0ffd0"; // Light green for file detected

    const items = event.dataTransfer.items;
    if (!items) return;

    console.log(`📂 Dropped ${items.length} item(s).`);

    [...items].forEach(item => {
        const entry = item.webkitGetAsEntry();
        if (!entry) return;

        if (entry.isDirectory) {
            console.log(`📁 Folder Detected: ${entry.name}`);
            dropzoneText.innerText = `📁 Folder: ${entry.name} (Cannot read directly)`;
            readDirectoryContents(entry);
        } else if (entry.isFile) {
            processFile(item.getAsFile());
        }
    });
}

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

// Process individual files
function processFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        console.log(`📄 File: ${file.name}, Size: ${file.size} bytes`);
        console.log(`📝 First 100 chars:\n${e.target.result.substring(0, 100)}`);

        if (file.name.endsWith(".json")) {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log(`✅ ${file.name} is a valid JSON`);
                document.getElementById("jsonOutput").innerText = JSON.stringify(jsonData, null, 4);
            } catch (err) {
                console.error(`❌ ${file.name} is an invalid JSON`, err);
                document.getElementById("jsonOutput").innerText = "❌ Invalid JSON file!";
            }
        }
    };
    reader.readAsText(file);
}

