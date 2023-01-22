/**
 * Error for an empty Array.
 *
 * @internal
 */
export class EmptyArrayError extends Error {
	constructor() {
		super(`An empty Array was given.`);
		this.name = 'EmptyArrayError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
