const fs = require("fs");
const path = require("path");

// Directories
const source = "schemaNoLinkData";
const target = "schemaResolved";
const inputDir = path.join(__dirname, source);
const outputDir = path.join(__dirname, target);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Load all schemas into memory for resolving $refs
const schemaCache = {};

// Load schemas from inputDir
function loadSchemas() {
    const files = fs.readdirSync(inputDir);
    files.forEach(file => {
        if (file.endsWith(".json")) {
            const filePath = path.join(inputDir, file);
            try {
                schemaCache[file] = JSON.parse(fs.readFileSync(filePath, "utf8"));
            } catch (err) {
                console.error(`❌ Error loading schema ${file}:`, err);
            }
        }
    });
}

// Resolve $ref references
function resolveRefs(schema) {
    if (!schema || typeof schema !== "object") return schema;

    if (Array.isArray(schema)) {
        return schema.map(resolveRefs);
    }

    let resolvedSchema = { ...schema };

    if (schema["$ref"]) {
        const refFile = path.basename(schema["$ref"]);
        if (schemaCache[refFile]) {
            resolvedSchema = {
                ...resolveRefs(schemaCache[refFile]), // Expand the reference
                ...resolvedSchema // Ensure additional properties stay
            };
            delete resolvedSchema["$ref"];
        } else {
            console.warn(`⚠️ Unresolved reference: ${schema["$ref"]}`);
        }
    }

    // Handle "allOf" merging
    if (schema["allOf"]) {
        schema["allOf"].forEach(ref => {
            const resolvedRef = resolveRefs(ref);
            if (resolvedRef) {
                resolvedSchema = {
                    ...resolvedSchema,
                    ...resolvedRef,
                    properties: {
                        ...(resolvedRef.properties || {}),
                        ...(resolvedSchema.properties || {})
                    },
                    required: [...new Set([...(resolvedRef.required || []), ...(resolvedSchema.required || [])])]
                };
            }
        });
        delete resolvedSchema["allOf"];
    }

    // Recursively resolve nested properties
    if (resolvedSchema.properties) {
        Object.keys(resolvedSchema.properties).forEach(key => {
            resolvedSchema.properties[key] = resolveRefs(resolvedSchema.properties[key]);
        });
    }

    return resolvedSchema;
}

// Process all schemas and generate effective versions
function processSchemas() {
    loadSchemas();

    Object.keys(schemaCache).forEach(file => {
        console.log(`🛠️ Processing ${file}...`);

        const resolvedSchema = resolveRefs(schemaCache[file]);

        // Write the resolved schema
        const outputFilePath = path.join(outputDir, file);
        fs.writeFileSync(outputFilePath, JSON.stringify(resolvedSchema, null, 4), "utf8");
        console.log(`✅ Resolved schema written to ${outputFilePath}`);
    });
}

// Run script
processSchemas();
