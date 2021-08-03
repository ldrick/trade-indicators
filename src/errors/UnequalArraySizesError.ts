/**
 * Error if two `Array` do not have the same length.
 */
export class UnequalArraySizesError extends Error {
  constructor(message = 'Amounts of given values are not equal.') {
    super(message);
    this.name = 'UnequalArraySizesError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
