import { BaseObjectCeD } from './objectsBase.mjs';

export class SpectrumCeD extends BaseObjectCeD {
  constructor(content = {}, options = {}) {

    const NameOfThisClass = "SpectrumCeD";// cannot use this.constructor.name Copy from class name above

    // if Add new version : update version number this should be set to the last version managed by the present code
    const lastVersionManagedByThisCode = 'v3';

    super(content, options);
    this.classHierarchy.push(NameOfThisClass); 
    this.classHierVersion.push(lastVersionManagedByThisCode);

  }

  // Upgrade methods for each version
  SpectrumCeD_V1toNext() {
    if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_V1toNext ...")
    }
    this.data.description = "Default description";
    
   // if Add new version : update version number this should be set to the last version managed by the present code
    this.data.SpectrumCeD_version = 'v2';
  }

 SpectrumCeD_V2toPrevious() {
   if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_V2toPrevious ...")
    }
    delete this.data.description;

    // update version number
    this.data.SpectrumCeD_version = 'v1';
  }

  SpectrumCeD_V2toNext() {
     if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_V2toNext ...")
    }
    // Add z coordinate in each data point in v3
    this.data.dataPoints = this.data.dataPoints.map((point) => ({
      ...point,
      x2: point.x // Default value for the new field in v3
    }));

    // update version number
    this.data.SpectrumCeD_version = 'v3';
  }

  // Downgrade methods for each version
  SpectrumCeD_V3toPrevious() {
     if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_V3toPrevious ...")
    }
    // Remove z coordinate from each data point in v2
    this.data.dataPoints = this.data.dataPoints.map(({ z, ...rest }) => rest);

    // update version number
    this.data.SpectrumCeD_version = 'v2';
  }

}

export class SpectrumCeDNextLevel extends SpectrumCeD {
  constructor(content = {}, options = {}) {

    const NameOfThisClass = "SpectrumCeDNextLevel";// cannot use this.constructor.name Copy from class name above

    // if Add new version : update version number this should be set to the last version managed by the present code
    const lastVersionManagedByThisCode = 'v2';

    super(content, options);
    this.classHierarchy.push(NameOfThisClass); 
    this.classHierVersion.push(lastVersionManagedByThisCode);
    //this.data[NameOfThisClass + "_version"] = lastVersionManagedByThisCode;

  }

// Upgrade methods for each version
  SpectrumCeDNextLevel_V1toNext() {
    if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_NextLevel_V1toNext ...")
    }
this.data.descriptionNL2 = this.data.descriptionNL1;

    delete this.data.descriptionNL1;    
    // update version number 
    this.data.SpectrumCeDNextLevel_version = 'v2';
  }

 SpectrumCeDNextLevel_V2toPrevious() {
   if (this.dumpChangeVersion) {
      console.log("SpectrumCeD_NextLevel_V2toPrevious ...")
    }
   this.data.descriptionNL1 = this.data.descriptionNL2;

    delete this.data.descriptionNL2;

    // update version number
    this.data.SpectrumCeDNextLevel_version = 'v1';
  }


}
