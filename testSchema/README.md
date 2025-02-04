 to test run:


echo "generate linked data schema in folder schemaLinkData from folder schemaNoLinkData"
node generateLinkedDataSchema.js
echo "generate linked data instances in folder instancesLD from folder instances"
node makeLindedDataInstances.js
echo "test the schema of all json in instances ..."
node test.js instances > results_validation.txt
echo "test the schema of all json in instancesLD ..."
node test.js instancesLD > results_validationLD.txt
