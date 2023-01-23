import { JestResult } from '../types.js';

declare global {
	namespace jest {
		interface Matchers<R> {
			eitherRightToEqualFixedPrecision(expected: JestResult, decimals?: number): R;
		}
	}
}
