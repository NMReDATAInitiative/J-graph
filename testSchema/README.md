## Current Version

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/CHEMeDATA/dispProxToVal@latest/src/dispProxToVal.js"></script>

<svg id="drawing"></svg>
<div id="tooltip" style="position: absolute; visibility: hidden; padding: 8px; background-color: white; border: 1px solid #ccc; border-radius: 5px; pointer-events: none; z-index: 10;"></div>
 
<script>
    const dispQuality = new DispProxToVal("#drawing");
    dispQuality.initJson({ "array": [{ "label": "Initial value: 1.0. Change it with the slider", "value": 0.8830 }] }, { types: ["toCen"] });
       
</script>



[schema validator for user-selected file](./html/checkSchemaFromFile.html) 

[schema validator from object page](./html/index.html) 
[ >>      example of call with valid  embedded obj1.html?data](http://127.0.0.1:5501/testSchema/html/obj1.html?data={"content":{"$schema":"https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/obj1.json","name":"Alice2","age":30}})



[ >>      example of call with valid  embedded obj1.html?data](https://nmredatainitiative.github.io/J-graph/testSchema/html/obj1.html?data={"content":{"$schema":"https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/obj1.json","name":"Alice233","age":30}})


[ >>      example of call with valid  embedded obj1.html#data](https://nmredatainitiative.github.io/J-graph/testSchema/html/obj1.html#data={"content":{"$schema":"https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/obj1.json","name":"Alice233","age":30}})


Schemas are built in the `./schemaNoLinkedData/` (and a script validates)

Some are created directly in `./schemaNoLinkedData/` with `./updateSchema.js`
`./generateLinkedDataSchema.js` makes linked data versions (and another script validates)
`./resolveSchemas.js` makes the resolved version (no validation)

For instances....

A timestamp and random ID is added if not present in the original data in ./instances for the linked data version in ./instancesLD




 to test run:

```zsh

echo "SCHEMA: derive obj1 into obj1size by adding a mandatory size property"
node updateSchema.js
echo "SCHEMA: generate linked data schema in folder schemaLinkData from folder schemaNoLinkData"
node generateLinkedDataSchema.js
echo "SCHEMA: make a resolved version (longer, but self-consistant)"
node resolveSchemas.js

echo "SCHEMA: generate html page"
node ./generateHtmlForSchema.js

echo "INSTANCES: Creating instance pairObj1 from alice.json and obj1.json"
node updateInstances.js
echo "INSTANCES: generate linked data instances in folder instancesLD from folder instances"
node makeLindedDataInstances.js

echo "INSTANCES: Validate the schema of all json in ./instances in file results_validation.txt"
node test.js instances > results_validation.txt
echo "INSTANCES: Validate the schema of all json in ./instancesLD in file results_validationLD.txt"
node test.js instancesLD > results_validationLD.txt


```



The validation of mnova files fails:
node testMn.js instances
for the spectrum an error
for the molecule the schema are not on-line

```zsh
code --diff /Users/djeanner/git/J-graph/testSchema/instances/test1.json /Users/djeanner/git/J-graph/testSchema/instancesLD/test1.json
code --diff /Users/djeanner/git/J-graph/testSchema/instances/examplePair_EmbededSchema.json /Users/djeanner/git/J-graph/testSchema/instancesLD/examplePair_EmbededSchema.json
```
