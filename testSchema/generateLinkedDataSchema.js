const fs = require('fs');
const path = require('path');

const source = "schemaNoLinkData";
const target = "schemaLinkData";
const inputDir = path.join(__dirname, source);
const outputDir = path.join(__dirname, target);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // Ensure output directory exists
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith('.json')) {
            const inputFilePath = path.join(inputDir, file);

            fs.readFile(inputFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                try {
                    console.log(`Processing ${file}...`);
                    let schema = JSON.parse(data);

                    // Determine schema title and ID
                    let typeName = capitalizeFirstLetter(path.basename(file, '.json'));
                    schema["$schema"] = "https://json-schema.org/draft/2020-12/schema";
                    schema["title"] = typeName;

                    // Set proper $id and replace occurrences of source with target
                    schema["$id"] = `https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/${target}/${file}`;

                    // Ensure "properties" exists
                    if (!schema["properties"]) schema["properties"] = {};

                    // Add Linked Data fields
                    schema["properties"] = {
                        "@context": {
                            "type": "string",
                            "format": "uri",
                            "description": "Linked Data context URL"
                        },
                        "@id": {
                            "type": "string",
                            "format": "uri",
                            "description": "Unique identifier for this resource"
                        },
                        "@type": {
                            "type": "string",
                            "enum": [typeName]
                        },
                        ...schema["properties"]
                    };

                    // Modify referenced schemas to use proper ID
                    Object.keys(schema["properties"]).forEach(prop => {
                        let propSchema = schema["properties"][prop];
                        if (propSchema && propSchema["$ref"]) {
                            let ref = propSchema["$ref"].replace(source, target);
                            schema["properties"][prop]["$ref"] = ref;
                        }
                    });

                    // Ensure required fields are an array
                    if (!Array.isArray(schema["required"])) {
                        schema["required"] = [];
                    }

                    // Define required fields
                    schema["required"] = Array.from(new Set(["@id", "@type", ...schema["required"]]));

                    // Write modified schema to output
                    const outputFilePath = path.join(outputDir, file);
                    fs.writeFile(outputFilePath, JSON.stringify(schema, null, 4), 'utf8', (err) => {
                        if (err) {
                            console.error(`Error writing file ${file}:`, err);
                        } else {
                            console.log(`✅ Created Linked Data schema: ${file}`);
                        }
                    });
                } catch (parseError) {
                    console.error(`❌ Error parsing JSON in file ${file}:`, parseError);
                }
            });
        }
    });
});
