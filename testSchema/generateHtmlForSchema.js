const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fetch = require("node-fetch"); // Needed for fetching external schemas

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

    const expectedFileName = path.basename(schema["$id"]);
    const isFileNameCorrect = expectedFileName === fileName ? "✅ Yes" : `❌ No (Expected: ${expectedFileName})`;

    let propertiesTable = `
        <table border="1">
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

    // Check if schema extends another schema
    let extendsSchemas = "";
    if (schema["allOf"]) {
        extendsSchemas = schema["allOf"]
            .map((ref) => ref["$ref"] ? getHtmlLink(ref["$ref"]) : "-")
            .join("<br>");
    } else if (schema["$ref"]) {
        extendsSchemas = getHtmlLink(schema["$ref"]);
    }

    if (extendsSchemas) {
        propertiesTable += `
            <tr>
                <td colspan="4"><strong>Extends:</strong> ${extendsSchemas}</td>
            </tr>
        `;
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
        <h2>Load JSON Instance ...</h2>
        <select id="instanceSelector" onchange="loadInstance()">
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
            <p><strong>Schema ID:</strong> <a href="${schema["$id"]}" target="_blank">${schema["$id"]}</a></p>
            <p><strong>Does filename match the schema ID?</strong> ${isFileNameCorrect}</p>
            <h2>Properties</h2>
            ${propertiesTable}
            ${instanceSelector}
            <h2>Edit JSON Instance</h2>
            <textarea id="jsonEditor" oninput="validateJson()"></textarea>
            <p id="validationMessage"></p>
            <p><a href="index.html">Back to Index</a></p>
            
            <script>
                function loadInstance() {
                    const fileName = document.getElementById("instanceSelector").value;
                    if (!fileName) return;

                    fetch("../instances/" + fileName)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("jsonEditor").value = JSON.stringify(data, null, 4);
                            validateJson();
                        })
                        .catch(err => console.error("Error loading instance:", err));
                }

                function validateJson() {
    const text = document.getElementById("jsonEditor").value;
    let validationMessage = document.getElementById("validationMessage");

    try {
        const jsonData = JSON.parse(text);
        
        fetch(jsonData["$schema"])
            .then(response => response.json())
            .then(schema => {
                const ajv = new Ajv({ allErrors: true });
                addFormats(ajv);
                const validate = ajv.compile(schema);

                if (validate(jsonData)) {
                    validationMessage.style.color = "green";
                    validationMessage.textContent = "✅ Valid JSON";
                } else {
                    validationMessage.style.color = "red";
                    validationMessage.innerHTML = "❌ Invalid JSON:<br>" + JSON.stringify(validate.errors, null, 4);
                }
            })
            .catch(error => {
                validationMessage.style.color = "red";
                validationMessage.textContent = "⚠️ Could not fetch schema. Check network & schema URL.";
                console.error("Schema Fetch Error:", error);
            });
    } catch (error) {
        validationMessage.style.color = "red";
        validationMessage.textContent = "❌ JSON Parsing Error";
        console.error("JSON Parse Error:", error);
    }
}


    } catch (error) {
        validationMessage.style.color = "red";
        validationMessage.textContent = "❌ Invalid JSON (Parsing Error)";
    }
}

            </script>
        </body>
        </html>
    `;

    // Save HTML file
    const outputFilePath = path.join(htmlDir, `${path.basename(fileName, ".json")}.html`);
    fs.writeFileSync(outputFilePath, htmlContent, "utf8");
    console.log(`✅ Generated: ${outputFilePath}`);

    // Add to schema list for index
    schemaList.push({ name: fileName, link: path.basename(fileName, ".json") + ".html" });
}

/**
 * Generates an index.html page that links to all schema pages
 */
function generateIndexPage() {
    let indexContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Schema Documentation</title>
        </head>
        <body>
            <h1>Schema Documentation</h1>
            <ul>
    `;

    schemaList.forEach((schema) => {
        indexContent += `<li><a href="${schema.link}">${schema.name}</a></li>`;
    });

    indexContent += `
            </ul>
        </body>
        </html>
    `;

    fs.writeFileSync(path.join(htmlDir, "index.html"), indexContent, "utf8");
    console.log("✅ Generated index.html");
}

// Process all JSON Schema files
fs.readdirSync(schemaDir).forEach((file) => {
    if (file.endsWith(".json")) {
        generateHtmlForSchema(file);
    }
});

// Generate the index page
generateIndexPage();
