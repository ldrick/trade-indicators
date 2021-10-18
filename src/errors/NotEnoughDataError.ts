/**
 * Error for `Array.length` not at least as required.
 *
 * @internal
 */
export class NotEnoughDataError extends Error {
  constructor(given: number, required: number) {
    super(`Need at least ${required} values, but got ${given}`);
    this.name = 'NotEnoughDataError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
