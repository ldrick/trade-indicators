/**
 * Error for any `Number` lower 1 or not an Integer
 */
export class NotPositiveIntegerError extends Error {
  constructor(parameter: string) {
    super(`Parameter ${parameter} must be positive Integer.`);
    this.name = 'NotPositiveIntegerError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
