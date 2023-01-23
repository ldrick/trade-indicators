import { either as E, function as F, readonlyArray as RA, readonlyRecord as RR } from 'fp-ts/lib';
import { diff } from 'jest-diff';
import {
	FormattedArray,
	FormattedRecord,
	JestResult,
	JestResultArray,
	JestResultRecord,
} from '../types.js';

const formatArray =
	(dec: number) =>
	(arr: JestResultArray): FormattedArray =>
		F.pipe(
			arr,
			RA.map((el) => (el === null ? String(el) : el.toFixed(dec))),
		);

const formatRecord =
	(dec: number) =>
	(rec: JestResultRecord): FormattedRecord =>
		F.pipe(rec, RR.map(formatArray(dec)));

const format =
	(dec: number) =>
	(val: JestResult): FormattedArray | FormattedRecord =>
		val instanceof Array ? formatArray(dec)(val) : formatRecord(dec)(val);

const compareArrays = <A>(exp: ReadonlyArray<A>, rec: ReadonlyArray<A>) =>
	exp.length === rec.length && exp.every((e, index) => e === rec[index]);

const compareResultArrays = (
	exp: JestResultArray,
	rec: JestResultArray,
	decimals: number,
): boolean =>
	exp.length === rec.length &&
	exp.every((e, index) => e?.toFixed(decimals) === rec[index]?.toFixed(decimals));

const compareResultRecords = (
	exp: JestResultRecord,
	rec: JestResultRecord,
	decimals: number,
): boolean =>
	compareArrays(Object.keys(exp), Object.keys(rec)) &&
	Object.keys(exp).every((k) => compareResultArrays(exp[k], rec[k], decimals));

expect.extend({
	eitherRightToEqualFixedPrecision<E>(
		received: E.Either<E, JestResult>,
		expected: JestResult,
		decimals = 12,
	) {
		const that = this as jest.MatcherContext;

		const options = {
			comment: 'Object.is equality',
			isNot: that.isNot,
			promise: that.promise,
		};

		const pass = F.pipe(
			received,
			E.fold(
				() => false,
				(right) =>
					expected instanceof Array && right instanceof Array
						? compareResultArrays(expected, right, decimals)
						: compareResultRecords(
								expected as JestResultRecord,
								right as JestResultRecord,
								decimals,
						  ),
			),
		);

		const message = pass
			? () =>
					F.pipe(
						received,
						E.fold(
							() => `Either expected to be right, but was left.`,
							(rec) => {
								const formattedR = format(decimals)(rec);
								const formattedE = format(decimals)(expected);
								return (
									`${that.utils.matcherHint(
										'eitherRightToEqualFixedPrecision',
										undefined,
										undefined,
										options,
									)}\n\n` +
									`Expected: not ${that.utils.printExpected(formattedE)}\n` +
									`Received: ${that.utils.printReceived(formattedR)}`
								);
							},
						),
					)
			: () =>
					F.pipe(
						received,
						E.fold(
							() => `Either expected to be right, but was left.`,
							(rec) => {
								const formattedR = format(decimals)(rec);
								const formattedE = format(decimals)(expected);
								const diffString = diff(formattedE, formattedR, {
									expand: that.expand,
								});
								return `${that.utils.matcherHint(
									'eitherRightToEqualFixedPrecision',
									undefined,
									undefined,
									options,
								)}\n\n${
									diffString && diffString.includes('- Expect')
										? `Difference:\n\n${diffString}`
										: `Expected: ${that.utils.printExpected(formattedE)}\n` +
										  `Received: ${that.utils.printReceived(formattedR)}`
								}`;
							},
						),
					);

		return { actual: received, message, pass };
	},
});
