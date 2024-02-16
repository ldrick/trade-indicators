import { TestResult } from '../types.ts';

interface CustomMatchers<R = unknown> {
	eitherRightToEqualFixedPrecision(expected: TestResult, decimals = 12): R;
}

declare module 'vitest' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Assertion<T = unknown> extends CustomMatchers<T> {}
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
