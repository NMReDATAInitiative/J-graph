const fs = require("fs");
const path = require("path");

// Directories
const instancesDir = "./instances";

// File paths
const pairObj1Path = path.join(instancesDir, "examplePair_EmbeddedSchema.json");

// Instance files
const alicePath = path.join(instancesDir, "alice.json");
const test1Path = path.join(instancesDir, "test1.json");

console.log("\n🛠️ Creating instance pairObj1...");

// Load JSON instances
const aliceData = JSON.parse(fs.readFileSync(alicePath, "utf8"));
const test1Data = JSON.parse(fs.readFileSync(test1Path, "utf8"));

// Create pairObj1 instance
const pairObj1Instance = {
    "$schema": "https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/pairObj1.json",
    "object1": aliceData,
    "object2": test1Data
};

// Save pairObj1 instance
fs.writeFileSync(pairObj1Path, JSON.stringify(pairObj1Instance, null, 4));
console.log("✅ Instance pairObj1 created at:", pairObj1Path);
