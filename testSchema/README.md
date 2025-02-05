 to test run:

```zsh
jq -n '{ 
    "$schema": "https://raw.githubusercontent.com/NMReDATAInitiative/J-graph/main/testSchema/schemaNoLinkData/pairObj1.json",
    object1: (input),
    object2: (input)
}' ./instances/alice.json ./instances/test1.json > ./instances/examplePair_EmbededSchema.json

echo "generate linked data schema in folder schemaLinkData from folder schemaNoLinkData"
node generateLinkedDataSchema.js
echo "generate linked data instances in folder instancesLD from folder instances"
node makeLindedDataInstances.js
echo "test the schema of all json in instances ..."
node test.js instances > results_validation.txt
echo "test the schema of all json in instancesLD ..."
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
