/**
 * Error if two `Array` do not have the same length.
 * @category errors
 * @since 0.9.0
 * @public
 */
export class UnequalArraySizesError extends Error {
	constructor(message = 'Amounts of given values are not equal.') {
		super(message);
		this.name = 'UnequalArraySizesError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
