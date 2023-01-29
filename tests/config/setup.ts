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
	(arr: TestResultArray): FormattedArray =>
		F.pipe(
			arr,
			RA.map((el) => (el === null ? String(el) : el.toFixed(dec))),
		);

const formatRecord =
	(dec: number) =>
	(rec: TestResultRecord): FormattedRecord =>
		F.pipe(rec, RR.map(formatArray(dec)));

const format =
	(dec: number) =>
	(val: TestResult): FormattedArray | FormattedRecord =>
		val instanceof Array ? formatArray(dec)(val) : formatRecord(dec)(val);

const compareArrays = <A>(exp: ReadonlyArray<A>, rec: ReadonlyArray<A>) =>
	exp.length === rec.length && exp.every((e, index) => e === rec[index]);

const compareResultArrays = (
	exp: TestResultArray,
	rec: TestResultArray,
	decimals: number,
): boolean =>
	exp.length === rec.length &&
	exp.every((e, index) => e?.toFixed(decimals) === rec[index]?.toFixed(decimals));

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
		const { isNot, promise, expand } = this;

		const options = {
			isNot,
			promise,
		};

		const pass: boolean = F.pipe(
			received,
			E.fold(
				() => false,
				(right) =>
					expected instanceof Array && right instanceof Array
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
									diffString && diffString.includes('- Expect')
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
