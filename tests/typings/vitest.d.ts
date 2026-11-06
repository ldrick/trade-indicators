import { TestResult } from '../types.ts';

interface CustomMatchers<R = unknown> {
	okToEqualFixedPrecision(expected: TestResult, decimals?: number): R;
}

declare module 'vitest' {
	interface Assertion<T> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
