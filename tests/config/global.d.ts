import { TestResult } from '../types.js';

interface CustomMatchers<R = unknown> {
	eitherRightToEqualFixedPrecision(expected: TestResult, decimals = 12): R;
}

declare global {
	namespace Vi {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface Assertion extends CustomMatchers {}
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface AsymmetricMatchersContaining extends CustomMatchers {}
	}
}
