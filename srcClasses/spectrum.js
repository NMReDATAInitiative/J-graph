import { ObjectCeDBase } from './objectsBase.js';

export class SpectrumCeD extends ObjectCeDBase {
typeHierarchy = "Spectrum";
constructor(version = "last", content = {},  ObjectBase = {}) {

super(version, content,  ObjectBase)

}

}

/*
export class NmrSpectrum extends GraphBase {
  constructor(
    chemShifts,
    svg,
    settingsInput,
    smallScreen = false,
    regionsData = {},
    name = 'nameIsWiredInConstructor_NmrSpectrum1',
  ) {
    // data for GraphBase which takes care of communication between classes
    super(name, {
      dataTypesSend: ['xAxisSpectrum'],
      dataTypesReceive: [
        'dataHighlighted',
        'dataUNHighlighted',
        'dataSelected',
      ],
      logAllDataExchange: false, // Enable logging for this instance if true
    });

    if (this.isArrayOfArr
    
    */