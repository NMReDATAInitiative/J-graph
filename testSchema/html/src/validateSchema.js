const linkToSchemaBase = "https://nmredatainitiative.github.io/J-graph/testSchema/html/";


async function fetchSchemas(jsonData) {
    let schemaObjects = {};

    async function fetchSchema(url) {
        if (schemaObjects[url]) return;
        console.log(`⏳ Fetching schema: ${url}`);
        let response = await fetch(url);
        if (response.ok) {
            schemaObjects[url] = await response.json();
            console.log(`✅ Loaded schema: ${url}`);
            await resolveRefs(schemaObjects[url]);
        } else {
            console.error(`❌ Failed to fetch schema: ${url}`);
        }
    }

    async function resolveRefs(schema) {
        if (!schema || typeof schema !== "object") return;
        for (let key in schema) {
            if (key === "$ref" && typeof schema[key] === "string") {
                await fetchSchema(schema[key]);
            } else if (typeof schema[key] === "object") {
                await resolveRefs(schema[key]);
            }
        }
    }

    async function extractAndFetchSchemas(data) {
        if (!data || typeof data !== "object") return;
        if (data["$schema"] && typeof data["$schema"] === "string") {
            await fetchSchema(data["$schema"]);
        }
        for (let key in data) {
            if (typeof data[key] === "object") {
                await extractAndFetchSchemas(data[key]);
            }
        }
    }

    await extractAndFetchSchemas(jsonData);
    return schemaObjects;
}

function validateJSON(data, schemas, resultList) {
    const ajv = new Ajv({ schemas });
    resultList.innerHTML = "";

    console.log("Validating JSON:", data);
    console.log("Available schemas:", Object.keys(schemas));

    async function validateObject(obj, path = "Root") {
        if (!obj || typeof obj !== "object") return;

        if (obj["$schema"]) {
            let schemaName = obj["$schema"];
            if (!(schemaName in schemas)) {
                console.error(`❌ Schema "${schemaName}" is missing.`);
                resultList.innerHTML += `<li class="invalid-schema" style="color: black;">❌ ${path} - Schema "${schemaName}" not found. Validation failed.</li>`;
                return;
            }

            const validate = ajv.compile(schemas[schemaName]);
            if (validate(obj)) {
                const objName = schemaName.match(/([^/]+)\.json$/)[1];
                const urlSafeData = encodeURIComponent(JSON.stringify(obj));
                const linkToSchemaPages = linkToSchemaBase + objName + ".html";
                if (path == "Root") {
                    resultList.innerHTML += `<li class="valid-schema" style="color: black;">✅ ${path} - ${objName} Valid</li>`;
                } else {
                    resultList.innerHTML += `<li class="valid-schema" style="color: black;">✅  <a href='${linkToSchemaPages}#data={"content":${urlSafeData}}' target="_blank">${path}</a>- ${objName}  Valid </li>`;
                }
            } else {
                resultList.innerHTML += `<li class="invalid-schema" style="color: black;">❌ ${path} - ${schemaName} Invalid: ${ajv.errorsText(validate.errors)}</li>`;
            }
        }

        for (let key in obj) {
            if (typeof obj[key] === "object") {
                await validateObject(obj[key], `${path}.${key}`);
            }
        }
    }

    validateObject(data);
}
