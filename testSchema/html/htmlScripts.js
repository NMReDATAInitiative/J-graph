document.addEventListener("DOMContentLoaded", function () {
    const editor = document.getElementById("jsonEditor");
    const selector = document.getElementById("instanceSelector");
    const validationMessage = document.getElementById("validationMessage");

    function restoreSpecialCharacters(encodedString) {
        try {
            // First, decode URI component
            let decoded = decodeURIComponent(encodedString);

            // Second, replace incorrectly escaped double quotes
            decoded = decoded.replace(/%22/g, '"');
            console.log("Restored special characters:", decoded);
            return decoded;
        } catch (error) {
            console.error("Error restoring special characters:", error);
            return null;
        }
    }

    function getDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
		// for fragment identifier ?data=...
        let dataParam = urlParams.get("data");

        if (!dataParam) {
					            console.log("try get fragment identifier (#data=...) ");

            // try fragment identifier (#data=...)
            const hash = window.location.hash.substring(1); // Remove the "#" symbol
            if (hash.startsWith("data=")) {
                dataParam = hash.substring(5); // Remove "data=" from the beginning
						            console.log("got fragment identifier (#data=...) ");

            }
        }

        if (dataParam) {
            return restoreSpecialCharacters(dataParam);
        }
        return null;
    }

    async function loadFromURL() {
        const dataParam = getDataFromURL();
        if (dataParam) {
            try {
                const parsedData = JSON.parse(dataParam);
                if (parsedData.content) {
                    editor.value = JSON.stringify(parsedData.content, null, 4);

                    const schemas = await fetchSchemas(parsedData.content);
                    validateJSON(parsedData.content, schemas, validationMessage);
                    editor.dataset.schema = JSON.stringify(schemas);
                } else {
                    validationMessage.textContent = "⚠ No 'content' field found in URL data";
                }
            } catch (error) {
                validationMessage.textContent = "❌ Invalid JSON in URL";
                console.error("Error parsing URL data:", error);
            }
        }
    }

    selector.addEventListener("change", function () {
        loadInstance(selector.value);
    });

    async function loadInstance(fileName) {
        if (!fileName) return;

        try {
            const response = await fetch("../instances/" + fileName);
            if (!response.ok) throw new Error("Failed to fetch instance: " + response.status);

            const data = await response.json();
            editor.value = JSON.stringify(data, null, 4);

            const schemas = await fetchSchemas(data);
            validateJSON(data, schemas, validationMessage);

            // Store schemas in dataset for live validation
            editor.dataset.schema = JSON.stringify(schemas);
        } catch (err) {
            editor.value = "";
            validationMessage.textContent = "❌ Failed to load instance: " + err.message;
            console.error("Error loading instance:", err);
        }
    }

    // Live validation on user input
    editor.addEventListener("input", function () {
        try {
            const jsonData = JSON.parse(editor.value);
            const schemas = JSON.parse(editor.dataset.schema || "{}");
            validateJSON(jsonData, schemas, validationMessage);
        } catch (error) {
            validationMessage.textContent = "❌ Invalid JSON format";
            validationMessage.style.color = "red";
        }
    });

    loadFromURL();
});
