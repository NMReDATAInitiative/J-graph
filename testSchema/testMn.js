const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { validator } = require("@exodus/schemasafe");

const instancesDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "defaultFolder");

let failedFiles = []; // Store names of failed JSON files
let schemas = {}; // Cache for fetched schemas

/** Fetches and caches schemas, ensuring it is fully resolved before use */
async function fetchSchema(url, schemaCache, baseUrl = null) {
    if (!url.startsWith("http")) {
        if (!baseUrl) {
            console.log(`❌ Cannot resolve relative $ref: ${url} without a base URL`);
            return null;
        }
        url = new URL(url, baseUrl).href;
    }

    // Prevent duplicate loads
    if (schemaCache[url] || Object.values(schemaCache).some(s => s?.$id === url)) {
        while (schemaCache[url] === "loading") {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return schemaCache[url];
    }

    schemaCache[url] = "loading";

    try {
        console.log(`⏳ Fetching schema: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);

        const schema = await response.json();
        schemaCache[url] = schema;

        // Store by $id if available, ensuring no duplicates
        if (schema["$id"] && !schemaCache[schema["$id"]]) {
            schemaCache[schema["$id"]] = schema;
        }

        const newBaseUrl = schema["$id"] || url;

        // Recursively resolve references
        await resolveRefs(schema, schemaCache, newBaseUrl);

        console.log(`✅ Loaded schema: ${url}`);
        return schema;
    } catch (error) {
        console.log(`❌ Error loading schema from ${url}:`, error.message);
        schemaCache[url] = null;
        return null;
    }
}


/** Resolves references ($ref) recursively */
async function resolveRefs(schema, schemaCache, baseUrl) {
    if (!schema || typeof schema !== "object") return;

    let fetchPromises = [];

    for (let key in schema) {
        if (key === "$ref" && typeof schema[key] === "string") {
            let refUrl = schema[key];

            if (!refUrl.startsWith("http")) {
                if (!baseUrl) {
                    console.log(`❌ Cannot resolve relative $ref: ${refUrl} without a base URL`);
                    continue;
                }
                refUrl = new URL(refUrl, baseUrl).href; // Convert to absolute
                schema[key] = refUrl; // Update schema to avoid conflicts
            }

            fetchPromises.push(fetchSchema(refUrl, schemaCache, baseUrl));
        } else if (typeof schema[key] === "object") {
            fetchPromises.push(resolveRefs(schema[key], schemaCache, baseUrl));
        }
    }

    await Promise.all(fetchPromises);
}


/** Validates a JSON object against its schema */
async function validateObject(obj, fileName, schemaCache, path = "Root") {
	if (!obj || typeof obj !== "object") return;
	const refSchema = "$mnova_schema";
	//const refSchema = "$schema";
	if (obj[refSchema]) {
		let schemaUrl = obj[refSchema];
		console.log(`  >>>>>>>> validateObject path : ${path} `);

		const schema = await fetchSchema(schemaUrl, schemaCache);
		if (!schema) {
			console.log(`❌ ${path} - Schema "${schemaUrl}" not found.`);
			failedFiles.push(fileName);
			return;
		}
		
for (const key in schemaCache) {
    if (schemaCache[key]?.$id && key !== schemaCache[key].$id) {
        console.log(`⚠️ Removing duplicate $id: ${schemaCache[key].$id} from schema ${key}`);
        delete schemaCache[key].$id;
    }
}

// test missing $id...
for (const key in schemaCache) {
    if (!schemaCache[key]?.$id) {
        console.log(`❌ Schema in cache missing $id: ${key}`);
    } else {
		        console.log(`✅ Schema in cache NOT missing $id: ${key}`);
	}
}

		//const validate = validator(schema, { mode: "default" }); // Uses Draft 2020-12 support
		const validate = validator(schema, {
			mode: "default",
			schemas: Object.values(schemaCache), // Pass all schemas for reference resolution
		});

		if (validate(obj)) {
			console.log(`✅ ${path} - ${schemaUrl} Valid`);
		} else {
			console.log(`❌ ${path} - ${schemaUrl} Invalid`);
			failedFiles.push(fileName);
		}
	}
}

/** Validates all JSON files */
async function validateJSONFiles() {
	const files = fs.readdirSync(instancesDir).filter((file) => file.endsWith(".json"));

	for (let file of files) {
		console.log(`\n********* Validating ${file}...`);

		let schemaCache = {}; // Local schema cache for this file
		const filePath = path.join(instancesDir, file);

		try {
			const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
			await validateObject(jsonData, file, schemaCache);
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
