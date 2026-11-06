/**
 * Error for any `Number` lower 1 or not an Integer
 * @category errors
 * @since 0.9.0
 * @public
 */
export class NotPositiveIntegerError extends Error {
	constructor() {
		super(`Given value is not a positive Integer.`);
		this.name = 'NotPositiveIntegerError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
