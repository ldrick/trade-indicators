/**
 * Error for comparable periods, where one must exceed the other.
 * @internal
 */
export class PeriodSizeMissmatchError extends Error {
	constructor(periodBig: string, periodShort: string) {
		super(`Period ${periodBig} must be greater than ${periodShort}`);
		this.name = 'PeriodSizeMissmatchError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
