import {
	apply as AP,
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { smmaC } from '../averages/smma.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type HighLowClose, type NonEmptyHighLowClose } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import * as rec from '../utils/record.js';

const trueRange = (
	values: NonEmptyHighLowClose<number>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		values.high,
		array.tail,
		E.chain(
			E.traverseReadonlyNonEmptyArrayWithIndex((index, high) =>
				F.pipe(
					O.bindTo('previousClose')(RA.lookup(index)(values.close)),
					O.bind('currentLow', () => RA.lookup(index + 1)(values.low)),
					O.map(({ currentLow, previousClose }) =>
						Math.max(
							high - currentLow,
							Math.abs(high - previousClose),
							Math.abs(currentLow - previousClose),
						),
					),
					// v8 ignore next -- all series are validated to have equal length, so every lookup succeeds
					E.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

/**
 * ATR without checks.
 * @internal
 */
export const atrC = (
	values: NonEmptyHighLowClose<number>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		values,
		trueRange,
		E.map((tr) => smmaC(tr, period)),
	);

/**
 * The Average True Range (ATR) a period of the True Range Indicator,
 * being the greatest out of current high minus the current low,
 * the absolute value of current high minus previous close
 * and the absolute value of the current low minus the previous close.
 * @public
 */
export const atr = (
	values: HighLowClose<number>,
	period = 14,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			sizesV: rec.validateEqualSizes(values),
			valuesV: rec.validateRequiredSize(period + 1)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => rec.validateFinite(valuesV)),
		E.chain(({ periodV, valuesF }) => atrC(valuesF, periodV)),
	);
