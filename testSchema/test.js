const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Ajv = require("ajv");

const instancesDir = path.join(__dirname, "instances"); // Folder containing JSON files
let schemas = {}; // Cache for fetched schemas
const ajv = new Ajv({ schemas: true }); // Enable support for multiple schemas
let failedFiles = []; // Store names of failed JSON files

async function fetchSchema(url) {
    if (schemas[url]) return schemas[url]; // Avoid re-fetching

    try {
        console.log(`⏳ Fetching schema: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);

        const schema = await response.json();
        schemas[url] = schema;

        // Recursively resolve any `$ref` references inside this schema
        await resolveRefs(schema);

        // Register the schema with AJV
        ajv.addSchema(schema, url);

        console.log(`✅ Loaded schema: ${url}`);
        return schema;
    } catch (error) {
        console.error(`❌ Error loading schema from ${url}:`, error.message);
        return null;
    }
}

async function resolveRefs(schema) {
    if (!schema || typeof schema !== "object") return;

    for (let key in schema) {
        if (key === "$ref" && typeof schema[key] === "string") {
            await fetchSchema(schema[key]); // Fetch referenced schemas
        } else if (typeof schema[key] === "object") {
            await resolveRefs(schema[key]); // Check deeper levels
        }
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

        const validate = ajv.getSchema(schemaUrl);
        if (!validate) {
            console.error(`❌ ${path} - No validator compiled for ${schemaUrl}`);
            failedFiles.push(fileName);
            return;
        }

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

    if (failedFiles.length > 0) {
		console.log("\n🔴 Summary: Failed Files");
        console.log(failedFiles.join("\n"));
    } else {
        console.log("✅ All files passed validation.");
    }
}

validateJSONFiles();
