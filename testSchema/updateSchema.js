const fs = require("fs");
const path = require("path");

// Directories
const schemaDir = "./schemaNoLinkData";
const instancesDir = "./instances";

// File paths
const obj1Path = path.join(schemaDir, "obj1.json");
const obj1SizePath = path.join(schemaDir, "obj1size.json");
const pairObj1Path = path.join(instancesDir, "examplePair_EmbeddedSchema.json");

// Instance files
const alicePath = path.join(instancesDir, "alice.json");
const test1Path = path.join(instancesDir, "test1.json");

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

console.log("🛠️ Deriving obj1 into obj1size...");
console.log("   add 'size' as 'number' and require it");

// Load obj1 schema
const obj1Schema = JSON.parse(fs.readFileSync(obj1Path, "utf8"));

// Create obj1size schema based on obj1
const obj1SizeSchema = {
    "$schema": obj1Schema["$schema"],
    "type": obj1Schema["type"],
    "$id": "https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/obj1size.json",
    "allOf": [{ "$ref": obj1Schema["$id"] }],
    "properties": {
        "size": { "type": "number" }
    },
    "required": ["size"]
};

// Save obj1size schema
fs.writeFileSync(obj1SizePath, JSON.stringify(obj1SizeSchema, null, 4));
console.log("✅ obj1size schema created at:", obj1SizePath);
