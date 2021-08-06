import Big from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { smmaC } from '../averages/smma';
import { ReadonlyHighLowCloseNumber, ReadonlyNonEmptyHighLowCloseBig } from '../types';
import { max, objectToBig } from '../utils';
import { validatePeriod } from '../validations';
import { validateValues } from '../validations/validateValues';

const trueRange = (values: ReadonlyNonEmptyHighLowCloseBig): RNEA.ReadonlyNonEmptyArray<Big> =>
  values.high.reduce((reduced, high, index) => {
    const previousClose = values.close[index - 1];
    return index === 0
      ? reduced
      : [
          ...reduced,
          max([
            high.sub(values.low[index]),
            high.sub(previousClose).abs(),
            values.low[index].sub(previousClose).abs(),
          ]),
        ];
  }, <RNEA.ReadonlyNonEmptyArray<Big>>[]);

/**
 * ATR without checks and conversion.
 *
 * @internal
 */
export const atrC = (
  values: ReadonlyNonEmptyHighLowCloseBig,
  period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> => {
  const tr = trueRange(values);
  return smmaC(tr, period);
};

/**
 * The Average True Range (ATR) a period of the True Range Indicator,
 * being the greatest out of current high minus the current low,
 * the absolute value of current high minus previous close
 * and the absolute value of the current low minus the prevous close.
 *
 * @public
 */
export const atr = (
  values: ReadonlyHighLowCloseNumber,
  period = 14,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period + 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => objectToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => atrC(valuesB, periodV)),
  );
