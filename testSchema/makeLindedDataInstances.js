const fs = require('fs');
const path = require('path');
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

function convertToLD(instance, isRoot = true) {
    if (!instance || typeof instance !== 'object') return instance;

    const ldInstance = { ...instance };

    // Process root object: Convert schema reference to Linked Data format
    if (isRoot && ldInstance['$schema'] && ldInstance['$schema'].includes(schemaSource)) {
        ldInstance['$schema'] = ldInstance['$schema'].replace(schemaSource, schemaTarget);
        ldInstance['@context'] = `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/${schemaTarget}/`;

        if (!ldInstance['@id']) {
            ldInstance['@id'] = `urn:uuid:${uuidv4()}`;
            console.warn(`Added missing @id field for root.`);
        }

        if (!ldInstance['@type']) {
            let inferredType = extractTypeFromSchema(ldInstance['$schema']);
            ldInstance['@type'] = inferredType;
            console.warn(`Inferred @type as ${inferredType} for root.`);
        }

        if (!ldInstance['timestamp']) {
            ldInstance['timestamp'] = new Date().toISOString();
            console.warn(`Added missing timestamp field for root.`);
        }

        if (!ldInstance['source']) {
            ldInstance['source'] = "Generated from schema conversion";
            console.warn(`Added missing source field for root.`);
        }
    }

    // Process nested objects
    Object.keys(ldInstance).forEach(prop => {
        if (typeof ldInstance[prop] === 'object' && ldInstance[prop] !== null) {
            let subObject = ldInstance[prop];

            // If a nested object has a `$schema`, treat it as a Linked Data entity
            if (subObject['$schema'] && subObject['$schema'].includes(schemaSource)) {
                subObject['$schema'] = subObject['$schema'].replace(schemaSource, schemaTarget);

                if (!subObject['@id']) {
                    subObject['@id'] = `urn:uuid:${uuidv4()}`;
                    console.warn(`Added missing @id for nested object: ${prop}`);
                }

                if (!subObject['@type']) {
                    subObject['@type'] = extractTypeFromSchema(subObject['$schema']);
                    console.warn(`Inferred @type as ${subObject['@type']} for nested object: ${prop}`);
                }

                // Remove @context from nested objects (only keep at root)
                delete subObject['@context'];
            }

            // Remove $schema from nested objects (it should only be in the root)
            delete subObject['$schema'];

            // Recursively process nested objects
            ldInstance[prop] = convertToLD(subObject, false);
        }
    });

    return ldInstance;
}

fs.readdirSync(sourceDir).forEach(file => {
    if (file.endsWith('.json')) {
        const instancePath = path.join(sourceDir, file);
        const instance = JSON.parse(fs.readFileSync(instancePath, 'utf8'));

        const ldInstance = convertToLD(instance);

        fs.writeFileSync(
            path.join(targetDir, file),
            JSON.stringify(ldInstance, null, 4),
            'utf8'
        );
        console.log(`✅ Converted ${file} to Linked Data JSON.`);
    }
});
