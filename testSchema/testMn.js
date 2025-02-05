const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { validator } = require("@exodus/schemasafe");

const instancesDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "defaultFolder");

let failedFiles = []; // Store names of failed JSON files
let schemas = {}; // Cache for fetched schemas
function removeUnprocessedKeywords(schema) {
    if (!schema || typeof schema !== "object") return;

    for (const key in schema) {
        if (typeof schema[key] === "object") {
            removeUnprocessedKeywords(schema[key]); // Recursively clean nested properties
        }
    }

    // Remove "$schema" since schemasafe does not process it
    if ("$schema" in schema) {
        console.log(`⚠️ Removing unprocessed keyword: "$schema" from ${schema["$id"] || "unknown schema"}`);
        delete schema["$schema"];
    }
}

function fixInvalidRegex(schema) {
    if (!schema || typeof schema !== "object") return;

    for (const key in schema) {
        if (typeof schema[key] === "object") {
            fixInvalidRegex(schema[key]); // Recursively fix nested properties
        }

        if (key === "pattern" && typeof schema[key] === "string") {
            if (schema[key].includes("(?i)") || schema[key].includes("(?-i)")) {
                console.log(`⚠️ Fixing invalid regex: ${schema[key]}`);
                schema[key] = schema[key]
                    .replace(/\(\?i\)/g, "")  // Remove (?i)
                    .replace(/\(\?-i\)/g, ""); // Remove (?-i)
            }
        }
    }
}


/** Fetches and caches schemas, ensuring it is fully resolved before use */
async function fetchSchema(url, schemaCache, baseUrl = null) {
    if (!url.startsWith("http")) {
        if (!baseUrl) {
            console.log(`❌ Cannot resolve relative $ref: ${url} without a base URL`);
            return null;
        }
        url = new URL(url, baseUrl).href;
    }

    if (schemaCache[url]) {
        return schemaCache[url];
    }

    schemaCache[url] = "loading";

    try {
        console.log(`⏳ Fetching schema: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch schema: ${url}`);

        const schema = await response.json();

        // ✅ Remove "$schema" before validation
        removeUnprocessedKeywords(schema);        
		fixInvalidRegex(schema);


        schemaCache[url] = schema;
		if (schema["$id"]) {
    let schemaId = schema["$id"].startsWith("http") ? schema["$id"] : new URL(schema["$id"], baseUrl).href;

    console.log(`📌 Storing schema with ID: ${schemaId}`);
    schemaCache[schemaId] = schema; // Store schema with resolved $id

    if (!schemaCache[url]) {
        schemaCache[url] = schema; // Ensure original URL is also stored
    }
}


        const newBaseUrl = schema["$id"] || url;

        // 🛠️ Store $defs separately to ensure correct resolution
   // Ensure all $defs schemas have a proper ID and are stored correctly
// Ensure all $defs schemas have a proper ID and are stored correctly

if (schema["$defs"]) {
    for (const key in schema["$defs"]) {
        let subSchema = schema["$defs"][key];
        let subSchemaId = `${url}#/$defs/${key}`;

        if (!subSchema["$id"]) {
            console.log(`⚠️ Assigning missing $id to $defs schema: ${subSchemaId}`);
            subSchema["$id"] = subSchemaId;
        }

        schemaCache[subSchemaId] = subSchema; // Store by constructed $id
        schemaCache[subSchema["$id"]] = subSchema; // Store by schema's internal $id
        console.log(`📌 Stored $defs schema: ${subSchema["$id"]}`);
    }
}


		

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
		console.log(`🔎 Looking for schema in cache: ${schemaUrl}`);

		console.log(`  >>>>>>>> validateObject path : ${path} `);

		const schema = await fetchSchema(schemaUrl, schemaCache);
if (!schema) {
    console.log(`❌ ${path} - Schema "${schemaUrl}" not found.`);
    failedFiles.push(fileName);
    return;
}

// ✅ Ensure all referenced schemas are resolved before proceeding
console.log(`⏳ Waiting for all referenced schemas in ${schemaUrl} to load...`);
await resolveRefs(schema, schemaCache, schemaUrl);
console.log(`✅ All referenced schemas in ${schemaUrl} are loaded.`);

		if (!schemaCache[schemaUrl]) {
    console.log(`❌ Schema ${schemaUrl} NOT found in cache.`);
} else {
    console.log(`✅ Schema ${schemaUrl} found in cache.`);
}

for (const key in schemaCache) {
    if (key.includes("#") && !schemaCache[key]) {
        let baseKey = key.split("#")[0]; // Extract base URL before #
        if (schemaCache[baseKey]) {
            schemaCache[key] = schemaCache[baseKey]; // Assign the base schema
            console.log(`🔄 Resolving schema with # in $id: ${key} -> ${baseKey}`);
        } else {
            console.log(`❌ Schema with # in $id is unresolved: ${key}`);
        }
    }
}

for (const key in schemaCache) {
    const schema = schemaCache[key];
    if (schema?.$id && key !== schema.$id) {
        console.log(`⚠️ Keeping schema ${key} and ensuring correct $id resolution.`);
    }
}

for (const key in schemaCache) {
    if (key.includes("#") && !schemaCache[key]) {
        let baseKey = key.split("#")[0]; // Extract base URL before #
        schemaCache[key] = schemaCache[baseKey] || null;
        console.log(`🔄 Resolving schema with # in $id: ${key} -> ${baseKey}`);
    }
}

const uniqueSchemas = {};
for (const key in schemaCache) {
    const schema = schemaCache[key];

    if (schema?.$id) {
        if (!uniqueSchemas[schema.$id]) {
            uniqueSchemas[schema.$id] = schema;
        } else {
            console.log(`⚠️ Removing duplicate schema: ${key} (same $id as ${schema.$id})`);
        }
    } else {
        console.log(`❌ Schema missing $id: ${key}`);
    }
}


// test missing $id...
for (const key in uniqueSchemas) {
    if (!uniqueSchemas[key]?.$id) {
        console.log(`❌ Schema in cache missing $id: ${key}`);
    } else {
		        console.log(`✅ Schema in cache NOT missing $id: ${key} the id is :${uniqueSchemas[key].$id}  `);
	}
}



for (const key in uniqueSchemas) {
    if (!uniqueSchemas[key]?.$id) {
        console.log(`❌ Schema in cache missing $id: ${key}`);

    } else {
        console.log(`✅ Schema available: ${key}, ID: ${uniqueSchemas[key].$id}`);
    }
}
console.log("\n🔍 Checking for missing or invalid $id in schemas...");
for (const key in uniqueSchemas) {
    const schema = uniqueSchemas[key];
    if (!schema?.$id) {
        console.log(`❌ Schema in cache is missing $id: ${key}`);
    }
}
console.log("✅ Schema check completed.\n");


for (let key in uniqueSchemas) {
    if (key.startsWith("/json-schemas/")) {
        let absoluteKey = "https://mestrelab.com" + key;
        uniqueSchemas[absoluteKey] = uniqueSchemas[key];
delete uniqueSchemas[key];
        console.log(`🔄 Converted relative schema path: ${key} -> ${absoluteKey}`);
    }
}

console.log("\n🔎 Final schema cache before validation:");
for (const key in uniqueSchemas) {
    console.log(`✅ Schema ID: ${key}`);
}
console.log("✅ Schema cache ready.\n");

		//const validate = validator(schema, { mode: "default" }); // Uses Draft 2020-12 support
		//const validate = validator(schema, {
		//	mode: "default",
		//	schemas: Object.values(uniqueSchemas), // Pass all schemas for reference resolution
		//});


		console.log(`🔍 Checking schema for validation: ${obj[refSchema]}`);
if (!schemaCache[obj[refSchema]]) {
    console.error(`❌ Schema ${obj[refSchema]} NOT found in cache!`);
} else {
    console.log(`✅ Schema ${obj[refSchema]} found in cache.`);
}
const schemarr = uniqueSchemas[obj[refSchema]];
console.log(`🔎 Schema ID found in cache: ${schemarr["$id"] || "❌ Missing $id"}`);
if ("$schema" in schema) {
    console.log(`⚠️ Removing unprocessed keyword: "$schema" from ${schema["$id"] || "unknown schema"}`);
    delete schema["$schema"];
}
console.log(`🔍 Schema being used for validation:\n`, JSON.stringify(schema, null, 2));



console.log(`🔎 Checking referenced schema: https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec`);
if (!uniqueSchemas["https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec"]) {
    console.error(`❌ Schema https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec NOT found in cache!`);
} else {
    console.log(`✅ Schema https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec is in cache.`);
}

console.log(`🔍 Available schemas in cache:`);
console.log(Object.keys(uniqueSchemas));

if (schema["properties"] && schema["properties"]["spectra"] && schema["properties"]["spectra"]["items"]["$ref"]) {
    let refUrl = schema["properties"]["spectra"]["items"]["$ref"];
    if (schemaCache[refUrl]) {
        console.log(`🔄 Replacing $ref "${refUrl}" with actual schema`);
        schema["properties"]["spectra"]["items"] = uniqueSchemas[refUrl];  // Replace $ref with actual schema object
    } else {
        console.error(`❌ Reference ${refUrl} not found in cache!`);
    }
}
	

const validate = validator(schema, {
    mode: "default",
    schemas: Object.values(uniqueSchemas), // Pass all schemas for reference resolution
   contentValidation: true // ✅ Enables "content*" keywords
});


		if (validate(obj)) {
			console.log(`✅ ${path} - ${schemaUrl} Valid`);
		} else {
			console.log(`❌ ${path} - ${schemaUrl} Invalid`);
			console.log(`🔎 Validation errors:`, validate.errors);
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
