export class NotEnoughDataError extends Error {
  constructor(message = 'Not enough data to calculate indicator.') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'NotEnoughDataError';
  }
}
