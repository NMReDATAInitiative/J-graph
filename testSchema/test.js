const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const SCHEMA_DIR = ""; // Directory where schemas are stored
const INSTANCE_DIR = "instances"; // Directory where JSON instances are stored
const INDEX_FILE = "index.json"; // File that lists all available schemas

async function loadSchemas() {
    const ajv = new Ajv({ allErrors: true });

    try {
        console.log("📥 Loading schemas...");

        // Read index.json to get a list of schemas
        const schemaList = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));

        // Load each schema from schemaLinkData/
        let schemas = {};
        for (let schemaName of schemaList) {
            let schemaPath = path.join(SCHEMA_DIR, schemaName);
            if (!fs.existsSync(schemaPath)) {
                console.error(`❌ Schema not found: ${schemaPath}`);
                continue;
            }
            const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
            schemas[schemaName] = schema;

            // Add schema to Ajv
            ajv.addSchema(schema, schemaName);
            console.log(`✅ Loaded schema: ${schemaName}`);
        }

        return { ajv, schemas };
    } catch (error) {
        console.error("❌ Error loading schemas:", error);
        process.exit(1);
    }
}

async function validateInstances(ajv, schemas) {
    console.log("\n📂 Scanning JSON instances in:", INSTANCE_DIR);

    let instanceFiles = fs.readdirSync(INSTANCE_DIR).filter(file => file.endsWith(".json"));
    if (instanceFiles.length === 0) {
        console.error("❌ No JSON instances found.");
        process.exit(1);
    }

    for (let file of instanceFiles) {
        let filePath = path.join(INSTANCE_DIR, file);
        console.log(`\n📑 Validating: ${file}`);

        try {
            let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

            // Determine which schema to use
            let schemaName = data["$schema"];
            if (!schemaName) {
                console.error(`❌ ${file}: Missing "$schema" field.`);
                continue;
            }

            if (!(schemaName in schemas)) {
                console.error(`❌ ${file}: Schema "${schemaName}" not found in loaded schemas.`);
                continue;
            }

            // Validate using the correct schema
            const validate = ajv.getSchema(schemaName);
            if (!validate) {
                console.error(`❌ ${file}: Schema "${schemaName}" is not compiled.`);
                continue;
            }

            const valid = validate(data);
            if (valid) {
                console.log(`✅ ${file}: Valid according to ${schemaName}`);
            } else {
                console.error(`❌ ${file}: Invalid - ${ajv.errorsText(validate.errors)}`);
            }
        } catch (error) {
            console.error(`❌ ${file}: JSON parsing error -`, error.message);
        }
    }
}

async function main() {
    const { ajv, schemas } = await loadSchemas();
    await validateInstances(ajv, schemas);
}

main();
