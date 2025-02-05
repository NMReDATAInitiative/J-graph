
A timestamp and random ID is added if not present in the original data in ./instances for the linked data version in ./instancesLD

 to test run:

```zsh

echo "SCHEMA: derive obj1 into obj1size by adding a mandatory size property"
node updateSchema.js
echo "SCHEMA: generate linked data schema in folder schemaLinkData from folder schemaNoLinkData"
node generateLinkedDataSchema.js



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
