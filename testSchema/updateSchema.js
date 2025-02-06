const fs = require("fs");
const path = require("path");

// Directories
const schemaDir = "./schemaNoLinkData";
const schemaRoot = "https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/";

/**
 * Function to derive a new schema from an existing one
 * @param {string} sourceClass - The base schema filename (without `.json`)
 * @param {string} derivedClass - The new schema filename (without `.json`)
 * @param {Array} fieldsToAdd - Fields to add with properties { name, mandatory, type }
 */
function deriveSchema(sourceClass, derivedClass, fieldsToAdd) {
    const sourcePath = path.join(schemaDir, `${sourceClass}.json`);
    const derivedPath = path.join(schemaDir, `${derivedClass}.json`);

    console.log(`🛠️ Deriving ${sourceClass} into ${derivedClass}...`);
    console.log(`   Adding fields:`, fieldsToAdd.map(f => `${f.name} (${f.type})${f.mandatory ? " [mandatory]" : ""}`).join(", "));

    // Load the source schema
    const sourceSchema = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

    // Create the new schema based on the source schema
    const derivedSchema = {
        "$schema": sourceSchema["$schema"],
        "type": sourceSchema["type"],
        "$id": `${schemaRoot}${derivedClass}.json`,
        "allOf": [{ "$ref": sourceSchema["$id"] }],
        "properties": {}
    };

    // Add new fields
    const requiredFields = [];
    fieldsToAdd.forEach(field => {
        derivedSchema["properties"][field.name] = { "type": field.type };
        if (field.mandatory) {
            requiredFields.push(field.name);
        }
    });

    // Add required fields if any
    if (requiredFields.length > 0) {
        derivedSchema["required"] = requiredFields;
    }

    // Save the new schema
    fs.writeFileSync(derivedPath, JSON.stringify(derivedSchema, null, 4));

    console.log(`✅ ${derivedClass} schema created at:`, derivedPath);
}

// Example usage
deriveSchema("obj1", "obj1size", [
    { name: "size", mandatory: true, type: "number" }
]);


/**
 * Create a JSON Schema based on provided properties
 * @param {string} newSchemaName - The name of the new schema (without .json)
 * @param {Array} propertiesList - An array defining properties with attributes
 */
function createGroupSchema(newSchemaName, propertiesList) {
    const schemaPath = path.join(schemaDir, `${newSchemaName}.json`);

    console.log(`🛠️ Creating schema: ${newSchemaName}...`);

    // Construct properties & required fields
    let properties = {};
    let requiredFields = [];

    propertiesList.forEach(prop => {
        let propSchema;

        if (prop.array) {
            // Handle arrays
            if (prop.type === "object" && prop.ref) {
                // If it's an array of objects, use a reference
                propSchema = {
                    "type": "array",
                    "items": { "$ref": `${schemaRoot}${prop.ref}.json` }
                };
            } else {
                // Regular array of basic types
                propSchema = { "type": "array", "items": { "type": prop.type } };
            }
        } else {
            // Single objects or primitives
            if (prop.type === "object" && prop.ref) {
                propSchema = { "$ref": `${schemaRoot}${prop.ref}.json` };
            } else {
                propSchema = { "type": prop.type };
            }
        }

        properties[prop.name] = propSchema;

        if (prop.required) {
            requiredFields.push(prop.name);
        }
    });

    // Define the new schema
    const newSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "$id": `${schemaRoot}${newSchemaName}.json`,
        "properties": properties,
        "required": requiredFields.length > 0 ? requiredFields : undefined
    };

    // Save the new schema
    fs.writeFileSync(schemaPath, JSON.stringify(newSchema, null, 4));
    console.log(`✅ ${newSchemaName} schema created at:`, schemaPath);
}

// Example usage
//createGroupSchema("groupObject1", [
//    { name: "members", required: true, array: true, type: "object", ref: "obj1" }, // Correctly reference obj1.json
//    { name: "groupSize", required: true, array: false, type: "number" },  // A required number field
//    { name: "active", required: false, array: false, type: "boolean" }   // An optional boolean field
//]);


// Example usage
createGroupSchema("groupObject1", [
    { name: "members", required: true, array: true, type: "object", ref: "obj1" } 
]);

