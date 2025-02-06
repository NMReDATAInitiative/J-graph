const fs = require("fs");
const path = require("path");

// Directories
const schemaDir = "./schemaNoLinkData";
const instanceDir = "./instances";
const htmlDir = "./html";

// Ensure the HTML output directory exists
if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
}

// List to track generated HTML pages for index.html
let schemaList = [];

/**
 * Converts a schema reference (`$ref`) to a corresponding HTML file link
 * @param {string} ref - The `$ref` value (e.g., "https://example.com/schema.json")
 * @returns {string} - The HTML file name (e.g., "schema.html") or original ref
 */
function getHtmlLink(ref) {
    if (!ref) return "-";
    const fileName = path.basename(ref, ".json") + ".html";
    return `<a href="${fileName}">${fileName}</a>`;
}

/**
 * Generates an HTML page for a given schema
 * @param {string} fileName - Schema file name (e.g., "groupObject1.json")
 */
function generateHtmlForSchema(fileName) {
    const filePath = path.join(schemaDir, fileName);
    const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));

    let propertiesTable = `
        <table>
            <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Schema Reference</th>
                <th>Required</th>
            </tr>
    `;

    if (schema.properties) {
        Object.keys(schema.properties).forEach((key) => {
            const property = schema.properties[key];
            const type = property.type ? property.type : "Unknown";
            const schemaRef = property["$ref"] ? getHtmlLink(property["$ref"]) : "-";
            const isRequired = schema.required && schema.required.includes(key) ? "✅ Yes" : "❌ No";

            propertiesTable += `
                <tr>
                    <td>${key}</td>
                    <td>${type}</td>
                    <td>${schemaRef}</td>
                    <td>${isRequired}</td>
                </tr>
            `;
        });
    } else {
        propertiesTable += `<tr><td colspan="4">No properties defined.</td></tr>`;
    }

    propertiesTable += `</table>`;

    // Scan instances folder for matching instances
    const instanceFiles = fs.existsSync(instanceDir) ? fs.readdirSync(instanceDir) : [];
    const matchingInstances = instanceFiles.filter(instanceFile => {
        const instancePath = path.join(instanceDir, instanceFile);
        const instanceData = JSON.parse(fs.readFileSync(instancePath, "utf8"));
        return instanceData["$schema"] === schema["$id"];
    });

    let instanceOptions = matchingInstances.map(file =>
        `<option value="${file}">${file}</option>`).join("\n");

    let instanceSelector = matchingInstances.length > 0 ? `
        <h2>Load JSON Instance</h2>
        <select id="instanceSelector">
            <option value="">Select an instance...</option>
            ${instanceOptions}
        </select>
    ` : `<p>No instances found for this schema.</p>`;

    // Generate HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Schema: ${fileName}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/6.12.6/ajv.min.js"></script>
            <script src="./validateSchema.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { padding: 10px; border: 1px solid black; text-align: left; }
                th { background-color: #f2f2f2; }
                textarea { width: 100%; height: 200px; font-family: monospace; }
                #validationMessage { font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Schema: ${fileName}</h1>
            <p><strong>Schema ID:</strong> 
                <a href="${schema["$id"]}" target="_blank">${schema["$id"]}</a>
            </p>

            <h2>Properties</h2>
            ${propertiesTable}
            ${instanceSelector}
            <h2>Edit JSON Instance</h2>
            <textarea id="jsonEditor"></textarea>
            <p id="validationMessage"></p>

            <script>
                document.addEventListener("DOMContentLoaded", function () {
                    const editor = document.getElementById("jsonEditor");
                    const selector = document.getElementById("instanceSelector");
                    const validationMessage = document.getElementById("validationMessage");

                    selector.addEventListener("change", function () {
                        loadInstance(selector.value);
                    });

                    async function loadInstance(fileName) {
                        if (!fileName) return;

                        try {
                            const response = await fetch("../instances/" + fileName);
                            if (!response.ok) throw new Error("Failed to fetch instance: " + response.status);

                            const data = await response.json();
                            editor.value = JSON.stringify(data, null, 4);

                            const schemas = await fetchSchemas(data);
                            validateJSON(data, schemas, validationMessage);
                            
                            // Store schemas in dataset for live validation
                            editor.dataset.schema = JSON.stringify(schemas);
                        } catch (err) {
                            editor.value = "";
                            validationMessage.textContent = "❌ Failed to load instance: " + err.message;
                            console.error("Error loading instance:", err);
                        }
                    }

                    // Live validation on user input
                    editor.addEventListener("input", function () {
                        try {
                            const jsonData = JSON.parse(editor.value);
                            const schemas = JSON.parse(editor.dataset.schema || "{}");
                            validateJSON(jsonData, schemas, validationMessage);
                        } catch (error) {
                            validationMessage.textContent = "❌ Invalid JSON format";
                            validationMessage.style.color = "red";
                        }
                    });
                });
            </script>
        </body>
        </html>
    `;

    fs.writeFileSync(path.join(htmlDir, `${path.basename(fileName, ".json")}.html`), htmlContent, "utf8");
    schemaList.push({ name: fileName, link: path.basename(fileName, ".json") + ".html" });
}

// Generate HTML for all schemas
fs.readdirSync(schemaDir).forEach((file) => {
    if (file.endsWith(".json")) {
        console.log("Generating HTML for", file);
        generateHtmlForSchema(file);
    }
});
