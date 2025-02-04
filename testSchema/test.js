const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

// Get folder from command line arguments
const instancesDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "instancesLD");

if (!fs.existsSync(instancesDir)) {
    console.log(`❌ Error: Directory "${instancesDir}" does not exist.`);
    process.exit(1);
}

console.log(`Validating JSON files in: ${instancesDir}`);

let failedFiles = []; // Store names of failed JSON files

/** Fetches and caches schemas */
async function fetchSchema(url, ajvInstance, schemaCache) {
    if (schemaCache[url]) return schemaCache[url]; // Avoid re-fetching

    try {
        console.log(`⏳ Fetching schema: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);

        const schema = await response.json();
        schemaCache[url] = schema;

        // Resolve any nested `$ref`
        await resolveRefs(schema, ajvInstance, schemaCache);

        // Check if AJV has this schema before adding
        if (!ajvInstance.getSchema(url)) {
            ajvInstance.addSchema(schema, url);
            console.log(`✅ Loaded schema: ${url}`);
        }

        return schema;
    } catch (error) {
        console.log(`❌ Error loading schema from ${url}: ${error.message}`);
        return null;
    }
}

/** Resolves references ($ref) recursively */
async function resolveRefs(schema, ajvInstance, schemaCache) {
    if (!schema || typeof schema !== "object") return;

    for (let key in schema) {
        if (key === "$ref" && typeof schema[key] === "string") {
            await fetchSchema(schema[key], ajvInstance, schemaCache); // Fetch referenced schemas
        } else if (typeof schema[key] === "object") {
            await resolveRefs(schema[key], ajvInstance, schemaCache); // Check deeper levels
        }
    }
}

/** Validates a JSON object against its schema using a separate AJV instance */
async function validateObject(obj, fileName) {
    if (!obj || typeof obj !== "object") return;

    // Create an independent Ajv instance for this file
    const ajvInstance = new Ajv({ strict: false });
    addFormats(ajvInstance);
    let schemaCache = {}; // Local schema cache for this file

    if (obj["$schema"]) {
        const schemaUrl = obj["$schema"];

        if (!schemaCache[schemaUrl]) {
            schemaCache[schemaUrl] = await fetchSchema(schemaUrl, ajvInstance, schemaCache);
        }

        if (!schemaCache[schemaUrl]) {
            console.log(`❌ ${fileName} - Schema "${schemaUrl}" not found.`);
            failedFiles.push(fileName);
            return;
        }

        const validate = ajvInstance.getSchema(schemaUrl);
        if (!validate) {
            console.log(`❌ ${fileName} - No validator compiled for ${schemaUrl}`);
            failedFiles.push(fileName);
            return;
        }

        if (validate(obj)) {
            console.log(`✅ ${fileName} - ${schemaUrl} Valid`);
        } else {
            console.log(`❌ ${fileName} - ${schemaUrl} Invalid:`, ajvInstance.errorsText(validate.errors));
            failedFiles.push(fileName);
        }
    }
}

/** Validates each JSON file independently */
async function validateJSONFiles() {
    const files = fs.readdirSync(instancesDir).filter(file => file.endsWith(".json"));

    if (files.length === 0) {
        console.warn(`⚠️ No JSON files found in "${instancesDir}".`);
        return;
    }

    for (let file of files) {
        const filePath = path.join(instancesDir, file);
        try {
            const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
            console.log(`\n🔍 Validating ${file}...`);
            await validateObject(jsonData, file);
        } catch (error) {
            console.log(`❌ Error reading ${file}:`, error.message);
            failedFiles.push(file);
        }
    }

    if (failedFiles.length > 0) {
        console.log("\n🔴 Summary: Failed Files");
        console.log(failedFiles.join("\n"));
        process.exit(1);
    } else {
        console.log("✅ All files passed validation.");
    }
}

validateJSONFiles();
