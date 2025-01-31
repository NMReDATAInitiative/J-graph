const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Ajv = require("ajv");

const instancesDir = path.join(__dirname, "instances"); // Folder containing JSON files
let schemas = {}; // Cache for fetched schemas
const ajv = new Ajv(); // Schema validator
let failedFiles = []; // Store names of failed JSON files

async function fetchSchema(url) {
    if (schemas[url]) return schemas[url]; // Avoid re-fetching

    try {
        console.log(`⏳ Fetching schema: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);
        
        const schema = await response.json();
        schemas[url] = schema;
        console.log(`✅ Loaded schema: ${url}`);

        return schema;
    } catch (error) {
        console.error(`❌ Error loading schema from ${url}:`, error.message);
        return null;
    }
}

async function validateObject(obj, fileName, path = "Root") {
    if (!obj || typeof obj !== "object") return;

    if (obj["$schema"]) {
        let schemaUrl = obj["$schema"];

        if (!schemas[schemaUrl]) {
            schemas[schemaUrl] = await fetchSchema(schemaUrl);
        }

        if (!schemas[schemaUrl]) {
            console.error(`❌ ${path} - Schema "${schemaUrl}" not found.`);
            failedFiles.push(fileName);
            return;
        }

        const validate = ajv.compile(schemas[schemaUrl]);
        if (validate(obj)) {
            console.log(`✅ ${path} - ${schemaUrl} Valid`);
        } else {
            console.error(`❌ ${path} - ${schemaUrl} Invalid:`, ajv.errorsText(validate.errors));
            failedFiles.push(fileName);
        }
    }

    for (let key in obj) {
        if (typeof obj[key] === "object") {
            await validateObject(obj[key], fileName, `${path}.${key}`);
        }
    }
}

async function validateJSONFiles() {
    const files = fs.readdirSync(instancesDir).filter(file => file.endsWith(".json"));

    for (let file of files) {
        const filePath = path.join(instancesDir, file);
        try {
            const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
            console.log(`\n🔍 Validating ${file}...`);
            await validateObject(jsonData, file);
        } catch (error) {
            console.error(`❌ Error reading ${file}:`, error.message);
            failedFiles.push(file);
        }
    }

    console.log("\n🔴 Summary: Failed Files");
    if (failedFiles.length > 0) {
        console.log(failedFiles.join("\n"));
    } else {
        console.log("✅ All files passed validation.");
    }
}

validateJSONFiles();
