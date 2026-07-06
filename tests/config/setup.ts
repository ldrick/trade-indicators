import {
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyRecord as RR,
} from 'fp-ts';
import { expect } from 'vitest';

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
		F.pipe(
			array,
			RA.map((element) => (element === null ? String(element) : element.toFixed(dec))),
		);

const formatRecord =
	(dec: number) =>
	(rec: TestResultRecord): FormattedRecord =>
		F.pipe(rec, RR.map(formatArray(dec)));

const format =
	(dec: number) =>
	(value: TestResult): FormattedArray | FormattedRecord =>
		Array.isArray(value) ? formatArray(dec)(value) : formatRecord(dec)(value);

const areArraysEqual = <A>(exp: readonly A[], rec: readonly A[]) =>
	exp.length === rec.length && exp.every((entry, index) => entry === rec[index]);

const areResultArraysEqual = (
	exp: TestResultArray,
	rec: TestResultArray,
	decimals: number,
): boolean =>
	exp.length === rec.length &&
	exp.every((entry, index) => entry?.toFixed(decimals) === rec[index]?.toFixed(decimals));

const areResultRecordsEqual = (
	exp: TestResultRecord,
	rec: TestResultRecord,
	decimals: number,
): boolean =>
	areArraysEqual(Object.keys(exp), Object.keys(rec)) &&
	Object.keys(exp).every((k) =>
		F.pipe(
			O.bindTo('expValue')(RR.lookup(k)(exp)),
			O.bind('recValue', () => RR.lookup(k)(rec)),
			O.exists(({ expValue, recValue }) =>
				areResultArraysEqual(expValue, recValue, decimals),
			),
		),
	);

expect.extend({
	// vitest's `expect.extend` matcher API binds `this` to the matcher context
	/* eslint-disable unicorn/no-this-outside-of-class */
	eitherRightToEqualFixedPrecision(
		received: E.Either<Error, TestResult>,
		expected: TestResult,
		decimals: number,
	) {
		const { isNot, promise } = this;

		const options = { isNot, promise };

		const isPass: boolean = F.pipe(
			received,
			E.fold(
				() => false,
				(right) =>
					Array.isArray(expected) && Array.isArray(right)
						? areResultArraysEqual(expected, right, decimals)
						: areResultRecordsEqual(
								expected as TestResultRecord,
								right as TestResultRecord,
								decimals,
							),
			),
		);

		const message = isPass
			? (): string =>
					F.pipe(
						received,
						E.fold(
							() => `Either expected to be right, but was left.`,
							(rec) => {
								const formattedR = format(decimals)(rec);
								const formattedE = format(decimals)(expected);
								return (
									`${this.utils.matcherHint(
										'eitherRightToEqualFixedPrecision',
										undefined,
										undefined,
										options,
									)}\n\n` +
									`Expected: not ${this.utils.printExpected(formattedE)}\n` +
									`Received: ${this.utils.printReceived(formattedR)}`
								);
							},
						),
					)
			: (): string =>
					F.pipe(
						received,
						E.fold(
							() => `Either expected to be right, but was left.`,
							(rec) => {
								const formattedR = format(decimals)(rec);
								const formattedE = format(decimals)(expected);
								const diffString = this.utils.diff(formattedE, formattedR);
								return `${this.utils.matcherHint(
									'eitherRightToEqualFixedPrecision',
									undefined,
									undefined,
									options,
								)}\n\n${
									diffString?.includes('- Expect')
										? `Difference:\n\n${diffString}`
										: `Expected: ${this.utils.printExpected(formattedE)}\n` +
											`Received: ${this.utils.printReceived(formattedR)}`
								}`;
							},
						),
					);

		return { message, pass: isPass };
	},
	/* eslint-enable unicorn/no-this-outside-of-class */
});
