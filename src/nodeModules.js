/*jshint esversion: 6 */

//import * as d3 from "d3"; // 

//import { jmolSelectPair } from './src/jmolInterface.js';
//import { , , } from 'nmredata3';
//var jGraph = require('./src/index.js');
//var d3 = require('d3');
var nmredata = require('nmredata');

/*
var readNmrRecord = require('nmredata/readNmrRecord');
var NmrRecord = require('nmredata/NmrRecord');
var parseSDF = require('nmredata/parseSDF');
*/
   

/*
var myForm = { 
  setup: function() { button.onclick(_this.getData(); },
  getData: function() { // on ajax complete, callChart },
  callChart: function() { myChart.setup(data); }
};
myForm.setup();
module.exports = myForm;
*/

//import { nmredata } from 'nmredata-data-test';

/*
import { nmredata } from 'nmredata-data-test';
import { readNmrRecord, NmrRecord } from 'nmredata';
*/

//import { nmredata } from './node_modules/nmredata-data-test/index.js';
//import { readNmrRecord, NmrRecord } from './node_modules/nmredata/src/index.js';
//import { readNmrRecord } from './node_modules/nmredata/src/reader/readNmrRecord.js';
//import { nmredata } from 'nmredata-data-test';

//declare module 'nmredata';
//import { readNmrRecord, NmrRecord } from 'nmredata';

/*
npm install nmredata-data-test --save
npm install nmredata --save
*/


/*
// NOT USED ....
https://medium.com/weekly-webtips/import-use-npm-modules-in-the-browser-easily-e70d6c84fc31
npm install browserify --save
npm install nmredata-data-test --save
npm install nmredata --save
node_modules/.bin/browserify client.js > client.bundle.js 
*/
/*
//readNmrRecord(nmredata['menthol_1D_1H_assigned_J.zip'], {
readNmrRecord(nmredata['../node_modules/nmredata-data-test/data/menthol_1D_1H_assigned_J.zip'], {
  zipOptions: { base64: true },
}).then(async (nmrRecord) => {
  
  let nbSDFFiles = nmrRecord.nbSamples;
  let sdfList = nmrRecord.getSDFList(); // it's return ["wild_JCH_coupling","only_one_HH_coupling_in_Jtag","compound1.nmredata","compound1_with_jcamp.nmredata","with_char_10","compound1_special_labels.nmredata copy"]
 
  let activeElement = nmrRecord.getActiveElement(); //should return 'wild_JCH_coupling'
  nmrRecord.setActiveElement('only_one_HH_coupling_in_Jtag');

  
  let allTags = nmrRecord.getNMReDataTags(); //return the tags of 'only_one_HH_coupling_in_Jtag'
  // you can get a specific tag
  let solvent = allTags['SOLVENT'];
  // To get one list with the current's tags
  let tagsList = Object.keys(allTags);
 
  let nmredata = nmrRecord.getNMReData();

  
  var json = await nmrRecord.toJSON();
  //console.log(nmredata);

});
*/