import * as Arr from 'effect/Array';
import * as R from 'effect/Result';

import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type Candle, type HighLowClose, type NonEmptyHighLowClose } from '../types.js';
import * as array from './array.js';
import * as number_ from './number.js';

/**
 * Validates if every value of every Array in Record is a finite Number.
 * @internal
 */
export const validateFinite = (
	record: NonEmptyHighLowClose<number>,
): R.Result<NonEmptyHighLowClose<number>, Error> =>
	R.all({
		close: array.validateFinite(record.close),
		high: array.validateFinite(record.high),
		low: array.validateFinite(record.low),
	});

/**
 * Validates if all Arrays in Record have the same length.
 * @internal
 */
export const validateEqualSizes = <A>(record: HighLowClose<A>): R.Result<HighLowClose<A>, Error> =>
	record.high.length === record.low.length && record.low.length === record.close.length
		? R.succeed(record)
		: R.fail(new UnequalArraySizesError());

/**
 * Validates if every Array in Record has the required size.
 * @internal
 */
export const validateRequiredSize =
	(required: number) =>
	<A>(record: HighLowClose<A>): R.Result<NonEmptyHighLowClose<A>, Error> =>
		R.all({
			close: array.validateRequiredSize(required)(record.close),
			high: array.validateRequiredSize(required)(record.high),
			low: array.validateRequiredSize(required)(record.low),
		});

/**
 * Validates that all values of a candle are finite Numbers.
 * @internal
 */
export const validateCandle = (candle: Candle): R.Result<Candle, Error> =>
	R.all({
		close: number_.validateFinite(candle.close),
		high: number_.validateFinite(candle.high),
		low: number_.validateFinite(candle.low),
	});

/**
 * Candles from validated series of equal length.
 * @internal
 */
export const toCandles = (
	record: NonEmptyHighLowClose<number>,
): Arr.NonEmptyReadonlyArray<Candle> =>
	Arr.zipWith(Arr.zip(record.high, record.low), record.close, ([high, low], close) => ({
		close,
		high,
		low,
	}));
