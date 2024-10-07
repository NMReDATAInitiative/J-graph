import { ObjectCeDBase } from './objectsBase.mjs';

export class SpectrumCeD extends ObjectCeDBase {
  constructor(content = {}, version = 'v1', options = {}) {
    super(content, version, options);
    this.classHierarchy.push('SpectrumCeD'); // cannot use this.constructor.name
  }

  // Upgrade methods for each version
  upgradeV1toNext() {
    if (this.dumpChangeVersion) {
      console.log("upgradeV1toNext ...")
    }
    this.data.description = "Default description";
    
    // update version number
    this.data.version = 'v2';
    
    // Validate schema only if the flag is true
    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }

 downgradeV2toPrevious() {
   if (this.dumpChangeVersion) {
      console.log("downgradeV2toPrevious ...")
    }
    delete this.data.description;

    // update version number
    this.data.version = 'v1';

    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }

  upgradeV2toNext() {
     if (this.dumpChangeVersion) {
      console.log("upgradeV2toNext ...")
    }
    // Add z coordinate in each data point in v3
    this.data.dataPoints = this.data.dataPoints.map((point) => ({
      ...point,
      x2: point.x // Default value for the new field in v3
    }));

    // update version number
    this.data.version = 'v3';

    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }

  // Downgrade methods for each version
  downgradeV3toPrevious() {
     if (this.dumpChangeVersion) {
      console.log("downgradeV3toPrevious ...")
    }
    // Remove z coordinate from each data point in v2
    this.data.dataPoints = this.data.dataPoints.map(({ z, ...rest }) => rest);

    // update version number
    this.data.version = 'v2';

    if (this.validateSchemaFlag) {
      this.validateSchema();
    }
  }


}

export class SpectrumCeDNextLevel extends SpectrumCeD {
  constructor(content = {}, version = 'v1', options = {}) {
    super(content, version, options);
    this.classHierarchy.push('SpectrumCeDNextLevel'); // cannot use this.constructor.name
  }
}
