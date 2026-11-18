/**
 * Error for any `Number` being `NaN`, `Infinity` or `-Infinity`.
 * @category errors
 * @since 0.9.0
 * @public
 */
export class NotFiniteNumberError extends Error {
	constructor() {
		super(`Given values contain a not finite Number.`);
		this.name = 'NotFiniteNumberError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
