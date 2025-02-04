const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Ajv = require("ajv");
const addFormats = require("ajv-formats"); // Import ajv-formats

const instancesDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "instancesLD");

let failedFiles = []; // Store names of failed JSON files
let schemas = {}; // Cache for fetched schemas

/** Fetches and caches schemas, ensuring it is fully resolved before use */
async function fetchSchema(url, ajvInstance, schemaCache, baseUrl = null) {
	if (!url.startsWith("http")) {
		if (!baseUrl) {
			console.log(`❌ Cannot resolve relative $ref: ${url} without a base URL`);
			return null;
		}
		url = new URL(url, baseUrl).href; // Resolve relative URL
		console.log(`updated url because ref was relative: ${url}`);
	}

	if (schemaCache[url]) {
		while (schemaCache[url] === "loading") {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		return schemaCache[url];
	}

	schemaCache[url] = "loading"; // Mark as loading

	try {
		console.log(`⏳ Fetching schema: ${url}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);

		const schema = await response.json();
		schemaCache[url] = schema;

		// Extract $id as the base for resolving relative refs
		const newBaseUrl = schema["$id"] ? schema["$id"] : url;

		// Recursively resolve any `$ref` references inside this schema
		await resolveRefs(schema, ajvInstance, schemaCache, newBaseUrl);

		if (!ajvInstance.getSchema(url)) {
			ajvInstance.addSchema(schema, url);
			console.log(`✅ Loaded schema: ${url}`);
		}

		return schema;
	} catch (error) {
		console.log(`❌ Error loading schema from ${url}:`, error.message);
		schemaCache[url] = null;
		return null;
	}
}

/** Resolves references ($ref) recursively */
async function resolveRefs(schema, ajvInstance, schemaCache, baseUrl) {
	if (!schema || typeof schema !== "object") return;

	for (let key in schema) {
		if (key === "$ref" && typeof schema[key] === "string") {
			let refUrl = schema[key];

			if (!refUrl.startsWith("http")) {
				if (!baseUrl) {
					console.log(`❌ Cannot resolve relative $ref: ${refUrl} without a base URL`);
					continue;
				}
				refUrl = new URL(refUrl, baseUrl).href; // Resolve relative reference
				schema[key] = refUrl; // Replace with resolved absolute URL
			}

			await fetchSchema(refUrl, ajvInstance, schemaCache, baseUrl);
		} else if (typeof schema[key] === "object") {
			await resolveRefs(schema[key], ajvInstance, schemaCache, baseUrl);
		}
	}
}

/** Validates a JSON object against its schema */
async function validateObject(obj, fileName, ajvInstance, schemaCache, path = "Root") {
	if (!obj || typeof obj !== "object") return;

	if (obj["$schema"]) {
		let schemaUrl = obj["$schema"];
		// Ensure schema is fully loaded before proceeding
		const schema = await fetchSchema(schemaUrl, ajvInstance, schemaCache);

		if (!schema) {
			console.log(`❌ ${path} - Schema "${schemaUrl}" not found.`);
			failedFiles.push(fileName);
			return;
		}

		const validate = ajvInstance.getSchema(schemaUrl);
		if (!validate) {
			console.log(`❌ ${path} - No validator compiled for ${schemaUrl}`);
			failedFiles.push(fileName);
			return;
		}

		if (validate(obj)) {
			console.log(`✅ ${path} - ${schemaUrl} Valid`);
		} else {
			console.log(`❌ ${path} - ${schemaUrl} Invalid:`, ajvInstance.errorsText(validate.errors));
			failedFiles.push(fileName);
		}
	}

	for (let key in obj) {
		if (typeof obj[key] === "object") {
			await validateObject(obj[key], fileName, ajvInstance, schemaCache, `${path}.${key}`);
		}
	}
}

/** Validates all JSON files (creates new Ajv instance per file) */
async function validateJSONFiles() {
	const files = fs.readdirSync(instancesDir).filter((file) => file.endsWith(".json"));

	for (let file of files) {
		console.log(`\n********* Validating ${file}...`);

		// Create an independent Ajv instance for each file
		const ajvInstance = new Ajv({ strict: "log", schemas: true });
		addFormats(ajvInstance);
		let schemaCache = {}; // Local schema cache for this file

		const filePath = path.join(instancesDir, file);
		try {
			const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
			await validateObject(jsonData, file, ajvInstance, schemaCache);
		} catch (error) {
			console.log(`❌ Error reading ${file}:`, error.message);
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

// Start validation
validateJSONFiles();
