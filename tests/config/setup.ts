import { either as E, function as F, readonlyArray as RA, readonlyRecord as RR } from 'fp-ts/lib';
import { expect } from 'vitest';

import {
	FormattedArray,
	FormattedRecord,
	TestResult,
	TestResultArray,
	TestResultRecord,
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

const compareArrays = <A>(exp: readonly A[], rec: readonly A[]) =>
	exp.length === rec.length && exp.every((entry, index) => entry === rec[index]);

const compareResultArrays = (
	exp: TestResultArray,
	rec: TestResultArray,
	decimals: number,
): boolean =>
	exp.length === rec.length &&
	exp.every((entry, index) => entry?.toFixed(decimals) === rec[index]?.toFixed(decimals));

const compareResultRecords = (
	exp: TestResultRecord,
	rec: TestResultRecord,
	decimals: number,
): boolean =>
	compareArrays(Object.keys(exp), Object.keys(rec)) &&
	Object.keys(exp).every((k) => compareResultArrays(exp[k], rec[k], decimals));

expect.extend({
	eitherRightToEqualFixedPrecision(
		received: E.Either<Error, TestResult>,
		expected: TestResult,
		decimals: number,
	) {
		const { expand, isNot, promise } = this;

		const options = {
			isNot,
			promise,
		};

		const pass: boolean = F.pipe(
			received,
			E.fold(
				() => false,
				(right) =>
					Array.isArray(expected) && Array.isArray(right)
						? compareResultArrays(expected, right, decimals)
						: compareResultRecords(
								expected as TestResultRecord,
								right as TestResultRecord,
								decimals,
							),
			),
		);

		const message = pass
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
								const diffString = this.utils.diff(formattedE, formattedR, {
									expand,
								});
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

		return { message, pass };
	},
});
