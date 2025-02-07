// Default SVG for "Paste / Drop File"
const defaultIcon = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" 
                         stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                         <polyline points="9 22 9 12 15 12 15 22"></polyline>
                     </svg>`;

// SVG for "Valid File Detected"
const validFileIcon = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" 
                             stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                             <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                             <path d="M7 8h10"></path><path d="M7 12h10"></path><path d="M7 16h10"></path>
                         </svg>`;

// SVG for "Valid JSON"
const validJsonIcon = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" 
                             stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                             <polyline points="20 6 9 17 4 12"></polyline>
                         </svg>`;

// Reset the dropzone to default
function resetDropzone() {
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");

    dropzone.style.background = "#fff";
    dropzoneIcon.innerHTML = defaultIcon;
    dropzoneText.innerText = "Paste / Drop File Here";
}

// Handle dropped files
function handleFileDrop(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneIcon = document.getElementById("dropzoneIcon");
    const dropzoneText = document.getElementById("dropzoneText");
    dropzone.style.background = "#d0ffd0"; // Light green for file detected

    const files = event.dataTransfer.files;
    console.log(`Dropped ${files.length} file(s).`);

    [...files].forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log(`📂 File: ${file.name}, Size: ${file.size} bytes`);
            console.log(`📝 First 100 chars:\n${e.target.result.substring(0, 100)}`);

            dropzoneIcon.innerHTML = validFileIcon;
            dropzoneText.innerText = `File Detected: ${file.name}`;

            if (file.name.endsWith(".json")) {
                try {
                    JSON.parse(e.target.result);
                    console.log("✅ JSON is valid");
                    dropzoneIcon.innerHTML = validJsonIcon;
                    dropzoneText.innerText = "Valid JSON File!";
                } catch (err) {
                    console.error("❌ Invalid JSON format:", err);
                    dropzoneText.innerText = "Invalid JSON!";
                }
            }
        };
        reader.readAsText(file);
    });
}

// Handle clipboard paste
function handlePaste(event) {
    event.preventDefault();
    const dropzone = document.getElementById("dropzone");
    const dropzoneText = document.getElementById("dropzoneText");

    const clipboardData = event.clipboardData || window.clipboardData;
    const text = clipboardData.getData("text/plain");
    const mimeType = clipboardData.types.length ? clipboardData.types[0] : "unknown";

    console.log(`📋 Clipboard MIME Type: ${mimeType}`);
    console.log(`📝 First 100 chars:\n${text.substring(0, 100)}`);

    dropzone.style.background = "#ffd0d0"; // Light red for pasted content
    dropzoneText.innerText = `Pasted Content Detected!`;

    if (mimeType.includes("json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
            JSON.parse(text);
            console.log("✅ Pasted JSON is valid");
            dropzoneText.innerText = "Valid JSON Pasted!";
        } catch {
            console.log("❌ Pasted content is not valid JSON");
            dropzoneText.innerText = "Invalid JSON!";
        }
    }
}
