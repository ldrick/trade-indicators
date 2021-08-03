/**
 * Error for `Array.length` to small.
 */
export class NotEnoughDataError extends Error {
  constructor(period: number, required: number) {
    super(`Need at least ${required} values for period size ${period}`);
    this.name = 'NotEnoughDataError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
