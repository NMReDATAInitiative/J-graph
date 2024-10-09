import Ajv from 'ajv';  // Import Ajv library for validateSchema // npm install ajv
import fs from 'fs';
export class BaseObjectCeD {

  constructor(data, options = {}) {

    this.data = this.deepCopyObject(data);

    const NameOfThisClass = "BaseObjectCeD";// cannot use this.constructor.name Copy from class name above

    // if Add new version : update version number this should be set to the last version managed by the present code
    const lastVersionManagedByThisCode = 'v1';

    this.classHierarchy = [NameOfThisClass]; 
    this.classHierVersion = [lastVersionManagedByThisCode];
    this.data[NameOfThisClass + "_version"] = lastVersionManagedByThisCode;

    this.validateSchemaFlag = options.validateSchema !== undefined ? options.validateSchema : false;
    this.dumpChangeVersion = options.dumpChangeVersion !== undefined ? options.dumpChangeVersion : false;


    // Validate schema only if the flag is true
   
  }

getCurrentVersion() {
  var str = "[";
  for (var i = 0; i < this.classHierVersion.length; i++) {
    if (i != 0) str += ",";
    str += `'${this.classHierVersion[i]}'` ; //'' "'" +  + "'");
  }
  str += "]";
  return str;
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
    const className = this.classHierarchy[this.classHierarchy.length - 1];

    const versionField = className + '_version';
    const schemaPath = `./srcClasses/schemas/${className}_${this.data[versionField]}.json`;
    if (!fs.existsSync(schemaPath)) {
      console.log('Look for schema  for ', className);
      console.log('Look for schema in schemaPath ', schemaPath);
      console.log('Couldnot find ', schemaPath);
      //throw new Error(`Schema file not found!`);
      return "";
    } 
    return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  }

  validateSchema() {
    console.log('Schema validation...');
    const ajv = new Ajv();
    const schema = this.getSchema();
    if (schema === "") {
      return false;
    }
    const validate = ajv.compile(schema);
    const valid = validate(this.data);

    if (!valid) {
      console.log('Schema validation errors:', validate.errors);
      throw new Error('Invalid schema');
      return false;
    } else {
      console.log('Schema validation OK');
    }
    return true;
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
  adjustVersion(desiredVersions) {
    if (desiredVersions.length != this.classHierVersion.length) {
        console.error("Requires a set of version number to insure foward and backward compatibility. Use method getCurrentVersion() to get it");
        return false;
    } 
    for(var i = 0; i < this.classHierVersion.length; i++) {
      const curClassHierarchy = this.classHierarchy[i];
      const desiredVersion = desiredVersions[i];
      const fieldName = curClassHierarchy + "_version";

      // Adjust the current version to match the desired version
      while (this.data[fieldName] !== desiredVersion) {
        if (this.dumpChangeVersion) {
        console.log("Convert version ", curClassHierarchy, " ", this.data[fieldName] , " -> ", desiredVersion);
        }
        var statusOK = true;
        if (this.compareVersions(this.data[fieldName], desiredVersion) < 0) {
          statusOK = this.incrementVersion(curClassHierarchy);
        } else {
          statusOK =this.decrementVersion(curClassHierarchy);
        }
        if (! statusOK) return false;
        if (this.validateSchemaFlag) {
           this.validateSchema();
         }
      }
    }
    if (this.validateSchemaFlag) {
           this.validateSchema();
    }
    return true;
  }


  // Helper function to compare version numbers
  compareVersions(v1, v2) {
    const versionToNumber = (version) => parseInt(version.replace('v', ''), 10);
    return versionToNumber(v1) - versionToNumber(v2);
  }

  // Increment version (upgrade data to a newer schema version dynamically)
  incrementVersion(curClassHierarchy) {
    const fieldName = curClassHierarchy + "_version";
    const currentVersion = this.data[fieldName];

    const nextVersionMethod = `${curClassHierarchy}_${this.capitalizeVersion(currentVersion)}toNext`;
    if (typeof this[nextVersionMethod] === 'function') {
      this[nextVersionMethod]();
    } else {
      console.log("Data version ERROR: A change of version was requested involving the data for the", this.classHierarchy[this.classHierarchy.length - 1], "class.");
      console.log("Data version ERROR: A function called : ", nextVersionMethod, "() could not be found.");
      console.log("Data version ERROR: It could be an error with the version", currentVersion ,"that has not been implemented ");
      console.log("Data version ERROR: or that the function is missing and should be implemented in ", curClassHierarchy);
      console.log("Data version ERROR: prevVersionMethod ", nextVersionMethod);
      throw new Error(`Data version ERROR:No upgrade method available - See console.log`);
      return false;
    }
    return true;
  }

  // Decrement version (downgrade data to an older schema version dynamically)
  decrementVersion(curClassHierarchy) {
    const fieldName = curClassHierarchy + "_version";
    const currentVersion = this.data[fieldName];

    const prevVersionMethod = `${curClassHierarchy}_${this.capitalizeVersion(currentVersion)}toPrevious`;
    if (typeof this[prevVersionMethod] === 'function') {
      this[prevVersionMethod]();
    } else {
      console.log("Data version ERROR: A change of version was requested involving the data for the", this.classHierarchy[this.classHierarchy.length - 1], "class.");
      console.log("Data version ERROR: A function called : ", prevVersionMethod, "() could not be found.");
      console.log("Data version ERROR: It could be an error with the version", currentVersion ,"that has not been implemented ");
      console.log("Data version ERROR: or that the function is missing and should be implemented in ", curClassHierarchy);
      console.log("Data version ERROR: prevVersionMethod ", prevVersionMethod);
      throw new Error(`Data version ERROR:No upgrade method available - See console.log`);
      return false;
    }
    return true;
  }

  // Utility to capitalize version string (e.g., 'v1' to 'V1')
  capitalizeVersion(version) {
    return version.charAt(0).toUpperCase() + version.slice(1);
  }

 
}
