const fs = require("fs");
const path = require("path");

// Directories
const schemaDir = "./schemaNoLinkData";

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
        "$id": `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/${derivedClass}.json`,
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
