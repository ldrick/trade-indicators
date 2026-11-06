import { expect } from 'vitest';

import { type Result } from '../../src/types.js';
import {
	type FormattedArray,
	type FormattedRecord,
	type TestResult,
	type TestResultArray,
	type TestResultRecord,
} from '../types.js';

const formatArray =
	(dec: number) =>
	(array: TestResultArray): FormattedArray =>
		array.map((element) => (element === null ? String(element) : element.toFixed(dec)));

const formatRecord =
	(dec: number) =>
	(rec: TestResultRecord): FormattedRecord =>
		Object.fromEntries(
			Object.entries(rec).map(([key, value]) => [key, formatArray(dec)(value)]),
		);

const format =
	(dec: number) =>
	(value: TestResult): FormattedArray | FormattedRecord =>
		Array.isArray(value) ? formatArray(dec)(value) : formatRecord(dec)(value);

const areArraysEqual = <A>(exp: readonly A[], rec: readonly A[]) =>
	exp.length === rec.length && exp.every((entry, index) => entry === rec[index]);

// Plain `number` math reproduces the fixtures up to 12 decimals; 10 leaves headroom
// for refactorings that change the order of floating point operations.
const DEFAULT_DECIMALS = 10;

const isWithinTolerance = (
	exp: null | number,
	rec: null | number | undefined,
	decimals: number,
): boolean =>
	exp === null || rec === null || rec === undefined
		? exp === rec
		: Math.abs(exp - rec) < 10 ** -decimals;

const areResultArraysEqual = (
	exp: TestResultArray,
	rec: TestResultArray,
	decimals: number,
): boolean =>
	exp.length === rec.length &&
	exp.every((entry, index) => isWithinTolerance(entry, rec[index], decimals));

const areResultRecordsEqual = (
	exp: TestResultRecord,
	rec: TestResultRecord,
	decimals: number,
): boolean =>
	areArraysEqual(Object.keys(exp), Object.keys(rec)) &&
	Object.entries(exp).every(([key, expValue]) => {
		const recValue = rec[key];
		return recValue !== undefined && areResultArraysEqual(expValue, recValue, decimals);
	});

expect.extend({
	// vitest's `expect.extend` matcher API binds `this` to the matcher context
	/* eslint-disable unicorn/no-this-outside-of-class */
	okToEqualFixedPrecision(
		received: Result<TestResult, Error>,
		expected: TestResult,
		decimalsOption?: number,
	) {
		if (!received.ok) {
			return {
				message: () => `Result expected to be ok, but failed with ${received.error.name}.`,
				pass: false,
			};
		}

		const { isNot, promise } = this;
		const options = { isNot, promise };
		const hint = this.utils.matcherHint(
			'okToEqualFixedPrecision',
			undefined,
			undefined,
			options,
		);
		const decimals = decimalsOption ?? DEFAULT_DECIMALS;
		const actual = received.value;
		const isPass =
			Array.isArray(expected) && Array.isArray(actual)
				? areResultArraysEqual(expected, actual, decimals)
				: areResultRecordsEqual(
						expected as TestResultRecord,
						actual as TestResultRecord,
						decimals,
					);
		const formattedR = format(decimals)(actual);
		const formattedE = format(decimals)(expected);

		const message = isPass
			? (): string =>
					`${hint}\n\n` +
					`Expected: not ${this.utils.printExpected(formattedE)}\n` +
					`Received: ${this.utils.printReceived(formattedR)}`
			: (): string => {
					const diffString = this.utils.diff(formattedE, formattedR);
					return `${hint}\n\n${
						diffString?.includes('- Expect')
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(formattedE)}\n` +
								`Received: ${this.utils.printReceived(formattedR)}`
					}`;
				};

		return { message, pass: isPass };
	},
	/* eslint-enable unicorn/no-this-outside-of-class */
});
