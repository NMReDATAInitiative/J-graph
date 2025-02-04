const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const sourceDir = path.join(__dirname, 'instances');
const targetDir = path.join(__dirname, 'instancesLD');
const schemaSource = "schemaNoLinkData";
const schemaTarget = "schemaLinkData";

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function extractTypeFromSchema(schemaPath) {
    let schemaName = path.basename(schemaPath, '.json');
    return capitalizeFirstLetter(schemaName);
}

function convertToLD(instance) {
    if (!instance || typeof instance !== 'object') return instance;
    
    const ldInstance = { ...instance };
    
    if (ldInstance['$schema'] && ldInstance['$schema'].includes(schemaSource)) {
        // Modify $schema to use schemaTarget
        ldInstance['$schema'] = ldInstance['$schema'].replace(schemaSource, schemaTarget);
        
        // Set @context to the base schema directory
        ldInstance['@context'] = `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/${schemaTarget}/`;
        
        // Add @id if not present
        if (!ldInstance['@id']) {
            ldInstance['@id'] = `urn:uuid:${uuidv4()}`;
            console.warn(`Added missing @id field.`);
        }
        
        // Infer @type from schema path
        if (!ldInstance['@type']) {
            let inferredType = extractTypeFromSchema(ldInstance['$schema']);
            ldInstance['@type'] = inferredType;
            console.warn(`Inferred @type as ${inferredType}.`);
        }
        
        // Add timestamp if not present
        if (!ldInstance['timestamp']) {
            ldInstance['timestamp'] = new Date().toISOString();
            console.warn(`Added missing timestamp field.`);
        }
        
        // Add source if not present
        if (!ldInstance['source']) {
            ldInstance['source'] = "Generated from schema conversion";
            console.warn(`Added missing source field.`);
        }
    }
    
    // Recursively process all nested objects
    Object.keys(ldInstance).forEach(prop => {
        if (typeof ldInstance[prop] === 'object' && ldInstance[prop] !== null) {
            ldInstance[prop] = convertToLD(ldInstance[prop]);
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
        console.log(`Converted ${file} to Linked Data JSON.`);
    }
});
