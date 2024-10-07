import { ObjectCeDBase } from './objectsBase.mjs';

export class SpectrumCeD extends ObjectCeDBase {
  constructor(version = 'last', content = {}) {
    super(version, content);
    this.classHierarchy.push('SpectrumCeD'); // cannot use this.constructor.name
  }
}

export class SpectrumCeDNextLevel extends SpectrumCeD {
  constructor(version = 'last', content = {}) {
    super(version, content);
    this.classHierarchy.push('SpectrumCeDNextLevel'); // cannot use this.constructor.name
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
