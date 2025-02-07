// SVG Icons
const icons = {
    default: `<svg id="dropzoneSVG" width="50" height="50" viewBox="0 0 24 24" fill="none"
                    stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    onmouseover="this.querySelector('polyline').setAttribute('stroke', 'blue')"
                    onmouseout="this.querySelector('polyline').setAttribute('stroke', 'black')">
                    <polyline stroke="black" points="9 22 9 12 15 12 15 22">
					 <animateTransform attributeType="XML" attributeName="transform" type="translate" 
                    values="0 0; 0 -1; 0 -2; 0 0" dur="5.6s" repeatCount="indefinite"/>
					</polyline>
					<path d="M3 9L12 2L21 9V22H3Z"/>
                    </path>
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

function detectFileType(header) {
    if (header.startsWith("FF D8 FF")) return "JPEG Image";
    if (header.startsWith("89 50 4E 47")) return "PNG Image";
    if (header.startsWith("25 50 44 46")) return "PDF Document";
    if (header.startsWith("49 44 33")) return "MP3 Audio";
    if (header.startsWith("50 4B 03 04")) return "ZIP Archive";
    if (header.startsWith("7F 45 4C 46")) return "ELF Executable";
    if (header.startsWith("42 4D")) return "BMP Image"; // Bitmap files start with "BM"
    if (header.startsWith("47 49 46 38")) return "GIF Image"; // GIF files start with "GIF8"
    if (header.startsWith("0 65 73 74 72 65 0 61 62 20 52 65 73 65 61 72")) return "Mnova document";
    return "Unknown";
}

// Process individual files
function processFile(file, fileListObj, dropzoneIcon, dropzoneText, jsonOutput, jsonCallback) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const arr = new Uint8Array(e.target.result).subarray(0, 16); // Read first 16 bytes
        const header = arr.map(byte => byte.toString(16).padStart(2, "0")).join(" ").toUpperCase();

        console.log(`📄 File: ${file.name}, Size: ${file.size} bytes`);
        console.log(`🔍 Magic Bytes: ${header}`);

        let detectedType = detectFileType(header);
        fileListObj.list += `📄 File: ${file.name} (Type: ${file.type || "unknown"}, Type(file magic number): ${detectedType}, Size: ${file.size} bytes)\n`;

        // Now read the file as text to extract first 100 characters
        const textReader = new FileReader();
        textReader.onload = function (event) {
            const textContent = event.target.result;
			const numberChar = 210;
            fileListObj.list += `First ${numberChar} chars ${file.name}:\n
			*********************\n
			${textContent.substring(0, numberChar)}
			\n*********************\n`;

            if (file.name.endsWith(".json")) {
                try {
                    const jsonData = JSON.parse(textContent);
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
            }
        };

        textReader.readAsText(file); // Read full text to extract first 100 characters
    };

    reader.readAsArrayBuffer(file.slice(0, 16)); // Read first 16 bytes for better detection
}



function handlePaste(event) {
    event.preventDefault();
    const dropzoneText = document.getElementById("dropzoneText");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const jsonOutput = document.getElementById("jsonOutput");

    // Get clipboard data
    const clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) {
        console.warn("📋 No clipboard data available.");
        return;
    }

    let pastedText = clipboardData.getData("text/plain");

    if (pastedText) {
        console.log(`📝 Pasted Text: ${pastedText.substring(0, 100)}`);

        try {
            const jsonData = JSON.parse(pastedText);
            console.log("✅ Valid JSON pasted:", jsonData);
            dropzoneText.innerText = "✅ Valid JSON pasted!";
            dropzoneIcon.innerHTML = icons.validJson;
            jsonOutput.innerHTML = `<code>${syntaxHighlight(jsonData)}</code>`;
        } catch (error) {
            console.warn("❌ Invalid JSON or regular text pasted.");
            dropzoneText.innerText = "❌ Invalid JSON or plain text pasted.";
            dropzoneIcon.innerHTML = icons.invalidJson;
            jsonOutput.innerText = pastedText;
        }
        return;
    }
}

// iOS workaround: Use a button to trigger paste
document.getElementById("pasteButton").addEventListener("click", function () {
    const pasteInput = document.getElementById("pasteInput");
    pasteInput.value = ""; // Clear previous value
    pasteInput.focus(); // Focus input (required for iOS paste)
    document.execCommand("paste"); // Attempt to paste (may require user action)
});

// Detect paste in input field
document.getElementById("pasteInput").addEventListener("input", function () {
    handlePaste({ clipboardData: { getData: () => this.value }, preventDefault: () => {} });
});
