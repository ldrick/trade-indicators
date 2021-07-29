export class InfinitNumberError extends Error {
  constructor() {
    super(`Given value(s) must be finit.`);
    this.name = 'InfinitNumberError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
