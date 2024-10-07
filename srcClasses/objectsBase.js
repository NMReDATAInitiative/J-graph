export class ObjectCeDBase {
  constructor(version = 'last', content = {}, ObjectBase = {}) {

	// this is or builing.classHierarchy 
    if (this.constructor.name != 'ObjectCeDBase') {
      this.classHierarchy.push(this.constructor.name);
    } else {
      this.classHierarchy = [];
    }
  }

  getHierarchy() {
    return this.classHierarchy;
  }
}
