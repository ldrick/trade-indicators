import { TestResult } from '../types.ts';

interface CustomMatchers<R = unknown> {
	eitherRightToEqualFixedPrecision(expected: TestResult, decimals = 12): R;
}

declare module 'vitest' {
	interface Assertion<T = unknown> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
