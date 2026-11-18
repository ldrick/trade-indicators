/**
 * Error for `Array.length` not at least as required.
 * @category errors
 * @since 0.9.0
 * @public
 */
export class NotEnoughDataError extends Error {
	constructor(given: number, required: number) {
		super(
			`Need at least ${required.toLocaleString()} values, but got ${given.toLocaleString()}`,
		);
		this.name = 'NotEnoughDataError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
