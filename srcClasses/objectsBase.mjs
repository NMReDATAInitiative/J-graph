export class ObjectCeDBase {
  constructor(version = 'last', content = {}) {
    this.classHierarchy = ["ObjectCeDBase"]; // next levels will push their names in this array
}
  

  getHierarchy() {
    return this.classHierarchy;
  }
}
