import { Big } from 'big.js';
import {
  apply as AP,
  either as E,
  function as F,
  readonlyNonEmptyArray as RNEA,
  readonlyRecord as RR,
} from 'fp-ts/lib';
import { smmaC } from '../averages/smma';
import { Movement, ReadonlyHighLowCloseNumber, ReadonlyNonEmptyHighLowCloseBig } from '../types';
import { objectToBig, trimLeft } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { atrC } from './atr';

const getUpMovement = (up: Big, down: Big): Big => (up.gt(down) && up.gt(0) ? up : new Big(0));

const getDownMovement = (up: Big, down: Big): Big =>
  down.gt(up) && down.gt(0) ? down : new Big(0);

const getMovement = (up: Big, down: Big, move: Movement): Big =>
  move === 'up' ? getUpMovement(up, down) : getDownMovement(up, down);

const directionalMovement = (
  values: ReadonlyNonEmptyHighLowCloseBig,
  move: Movement,
): RNEA.ReadonlyNonEmptyArray<Big> =>
  values.low.reduce((reduced, low, index) => {
    if (index === 0) {
      return reduced;
    }
    const prev = index - 1;
    const up = values.high[index].sub(values.high[prev]);
    const down = values.low[prev].sub(low);
    return [...reduced, getMovement(up, down, move)];
  }, <RNEA.ReadonlyNonEmptyArray<Big>>[]);

const directionalIndex = (
  values: ReadonlyNonEmptyHighLowCloseBig,
  period: number,
  move: Movement,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    E.bindTo('dm')(E.right(directionalMovement(values, move))),
    E.bind('dividends', ({ dm }) => smmaC(dm, period)),
    E.bind('divisors', () => atrC(values, period)),
    E.map(({ dividends, divisors }) =>
      F.pipe(
        dividends,
        RNEA.mapWithIndex((index, dividend) => {
          const divisor = divisors[index];
          return divisor.eq(0) ? new Big(0) : dividend.mul(100).div(divisor);
        }),
      ),
    ),
  );

const calculation = (
  pdi: RNEA.ReadonlyNonEmptyArray<Big>,
  mdi: RNEA.ReadonlyNonEmptyArray<Big>,
): RNEA.ReadonlyNonEmptyArray<Big> =>
  F.pipe(
    pdi,
    RNEA.mapWithIndex((index, plus) => {
      const sum = plus.add(mdi[index]);
      if (sum.eq(0)) {
        return new Big(0);
      }
      const dividend = plus.sub(mdi[index]).abs();
      return dividend.div(sum);
    }),
  );

/**
 * The Average Directional Index (ADX) determines trend strength.
 * It also delivers Plus Directional Movement Indicator (PDI)
 * and Minus Directional Movement Indicator (MDI).
 * Crossings of these three values can be used to determine trend changes.
 *
 * @public
 */
export const adx = (
  values: ReadonlyHighLowCloseNumber,
  period = 14,
): E.Either<Error, RR.ReadonlyRecord<'adx' | 'mdi' | 'pdi', RNEA.ReadonlyNonEmptyArray<Big>>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, 2 * period + 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => objectToBig(valuesV)),
    E.bind('pdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'up')),
    E.bind('mdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'down')),
    E.bind('smoothed', ({ pdi, mdi, periodV }) => {
      const calculated = calculation(pdi, mdi);
      return smmaC(calculated, periodV);
    }),
    E.map(({ smoothed, pdi, mdi }) => ({
      adx: F.pipe(
        smoothed,
        RNEA.map((value) => value.mul(100)),
      ),
      mdi: trimLeft(mdi, smoothed),
      pdi: trimLeft(pdi, smoothed),
    })),
  );
