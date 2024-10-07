import Ajv from 'ajv';  // Import Ajv library for validateSchema // npm install ajv
import fs from 'fs';
export class ObjectCeDBase {

  constructor(data, desiredVersion = "v1", options = {}) {

    if (!data.version) {
      throw new Error('CHEMeDATA objects must contain a version field');
    }

    this.data = this.deepCopyObject(data);

    this.classHierarchy = ["ObjectCeDBase"]; // next levels will push their names in this array
    this.validateSchemaFlag = options.validateSchema !== undefined ? options.validateSchema : false;
    this.dumpChangeVersion = options.dumpChangeVersion !== undefined ? options.dumpChangeVersion : false;

    this.adjustVersion(desiredVersion);

    // Validate schema only if the flag is true
    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }
  
// Deep copy function defined as a method of the class
  deepCopyObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepCopyObject(item));
    }

    const copy = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this.deepCopyObject(obj[key]);
      }
    }

    return copy;
  }

  getHierarchy() {
    return this.classHierarchy;
  }

  getSchema() {
    const schemaPath = `./srcClasses/schemas/spectrumCeD_${this.data.version}.json`;
    return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  }

  validateSchema() {
          console.log('Schema validation...');

    const ajv = new Ajv();
    const schema = this.getSchema();
    const validate = ajv.compile(schema);
    const valid = validate(this.data);

    if (!valid) {
      console.log('Schema validation errors:', validate.errors);
      throw new Error('Invalid schema');
    } else {
            console.log('Schema validation OK');

    }
  }

  getData() {
    return this.data;
  }

  addFields(newData) {
    this.data = { ...this.data, ...newData };
    
    // Validate schema only if the flag is true
    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }

  // Adjust the version based on the desired version
  adjustVersion(desiredVersion) {

    // Adjust the current version to match the desired version
    while (this.data.version !== desiredVersion) {
      if (this.dumpChangeVersion) {
      console.log("Convert version ", this.data.version , " -> ", desiredVersion);
    }
      if (this.compareVersions(this.data.version, desiredVersion) < 0) {
        this.incrementVersion();
      } else {
        this.decrementVersion();
      }
    }
  }

  // Helper function to compare version numbers
  compareVersions(v1, v2) {
    const versionToNumber = (version) => parseInt(version.replace('v', ''), 10);
    return versionToNumber(v1) - versionToNumber(v2);
  }

  // Increment version (upgrade data to a newer schema version dynamically)
  incrementVersion() {
    const currentVersion = this.data.version;

    // Dynamically check for upgrade method
    const nextVersionMethod = `upgrade${this.capitalizeVersion(currentVersion)}toNext`;
    if (typeof this[nextVersionMethod] === 'function') {
      this[nextVersionMethod]();
    } else {
      throw new Error(`No upgrade method available for version ${currentVersion}`);
    }
  }

  // Decrement version (downgrade data to an older schema version dynamically)
  decrementVersion() {
    const currentVersion = this.data.version;

    // Dynamically check for downgrade method
    const prevVersionMethod = `downgrade${this.capitalizeVersion(currentVersion)}toPrevious`;
    if (typeof this[prevVersionMethod] === 'function') {
      this[prevVersionMethod]();
    } else {
      throw new Error(`No downgrade method available for version ${currentVersion}`);
    }
  }

  // Utility to capitalize version string (e.g., 'v1' to 'V1')
  capitalizeVersion(version) {
    return version.charAt(0).toUpperCase() + version.slice(1);
  }

 
}
