import { Big } from 'big.js';
import {
	apply as AP,
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { smmaC } from '../averages/smma.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { HighLowClose, NonEmptyHighLowClose } from '../types.js';
import * as arr from '../utils/array.js';
import * as big from '../utils/big.js';
import * as num from '../utils/number.js';
import * as rec from '../utils/record.js';

const trueRange = (
	values: NonEmptyHighLowClose<Big>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		values.high,
		arr.tail,
		E.chain(
			RNEA.traverseWithIndex(E.Applicative)((index, high) =>
				F.pipe(
					O.bindTo('previousClose')(RA.lookup(index)(values.close)),
					O.bind('currentLow', () => RA.lookup(index + 1)(values.low)),
					O.map(({ previousClose, currentLow }) =>
						big.max([
							high.sub(currentLow),
							high.sub(previousClose).abs(),
							currentLow.sub(previousClose).abs(),
						]),
					),
					E.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

/**
 * ATR without checks and conversion.
 * @internal
 */
export const atrC = (
	values: NonEmptyHighLowClose<Big>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		values,
		trueRange,
		E.chain((tr) => smmaC(tr, period)),
	);

/**
 * The Average True Range (ATR) a period of the True Range Indicator,
 * being the greatest out of current high minus the current low,
 * the absolute value of current high minus previous close
 * and the absolute value of the current low minus the prevous close.
 * @public
 */
export const atr = (
	values: HighLowClose<number>,
	period = 14,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: num.validatePositiveInteger(period),
			valuesV: rec.validateRequiredSize(period + 1)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => rec.toBig(valuesV)),
		E.chain(({ valuesB, periodV }) => atrC(valuesB, periodV)),
		E.map(arr.toNumber),
	);
