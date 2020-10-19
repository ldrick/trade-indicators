export class UnequalArraySizesError extends Error {
  constructor(message = 'Amounts of given values are not equal.') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'UnequalArraySizes';
  }
}
