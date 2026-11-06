/**
 * Error for comparable periods, where one must exceed the other.
 * @category errors
 * @since 0.9.0
 * @public
 */
export class PeriodSizeMismatchError extends Error {
	constructor(periodLong: string, periodShort: string) {
		super(`Period ${periodLong} must be greater than ${periodShort}`);
		this.name = 'PeriodSizeMismatchError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
