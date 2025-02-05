const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const sourceDir = path.join(__dirname, 'instances');
const targetDir = path.join(__dirname, 'instancesLD');
const schemaSource = "schemaNoLinkData";
const schemaTarget = "schemaLinkData";

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractTypeFromSchema(schemaUrl) {
    let schemaName = path.basename(schemaUrl, '.json');
    return capitalizeFirstLetter(schemaName);
}

// Function to compute SHA-256 hash of a JSON object
function computeHash(obj) {
    const jsonString = JSON.stringify(obj, Object.keys(obj).sort()); // Canonicalize by sorting keys
    return crypto.createHash('sha256').update(jsonString).digest('hex');
}

function processSchemaObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    let processedObj = { ...obj };

    // Compute initial hash before transformation
    processedObj["initialHash"] = computeHash(processedObj);

    // Process transformations
    if (processedObj['$schema'] && processedObj['$schema'].includes(schemaSource)) {
        processedObj['$schema'] = processedObj['$schema'].replace(schemaSource, schemaTarget);

        if (!processedObj['@id']) {
            processedObj['@id'] = `urn:uuid:${uuidv4()}`;
            console.warn(`Added missing @id.`);
        }

        if (!processedObj['@type']) {
            processedObj['@type'] = extractTypeFromSchema(processedObj['$schema']);
            console.warn(`Inferred @type as ${processedObj['@type']}.`);
        }

        if (!processedObj['timestamp']) {
            processedObj['timestamp'] = new Date().toISOString();
            console.warn(`Added missing timestamp.`);
        }

        if (!processedObj['source']) {
            processedObj['source'] = "Generated from schema conversion";
            console.warn(`Added missing source.`);
        }
    }

    // Recursively process nested objects
    Object.keys(processedObj).forEach(prop => {
        if (typeof processedObj[prop] === 'object' && processedObj[prop] !== null) {
            let subObject = processedObj[prop];

            // If the nested object has a `$schema`, apply processing
            if (subObject['$schema'] && subObject['$schema'].includes(schemaSource)) {
                processedObj[prop] = processSchemaObject(subObject);
            }
        }
    });

    // Compute final hash after transformation
    processedObj["finalHash"] = computeHash(processedObj);

    return processedObj;
}

fs.readdirSync(sourceDir).forEach(file => {
    if (file.endsWith('.json')) {
        const instancePath = path.join(sourceDir, file);
        const instance = JSON.parse(fs.readFileSync(instancePath, 'utf8'));

        // Convert instance and add hashes
        const ldInstance = processSchemaObject(instance);

        fs.writeFileSync(
            path.join(targetDir, file),
            JSON.stringify(ldInstance, null, 4),
            'utf8'
        );

        console.log(`✅ Converted ${file} to Linked Data JSON with hashes for all schema objects.`);
    }
});
