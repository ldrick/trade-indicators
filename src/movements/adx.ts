import { Big } from 'big.js';
import { apply as AP, either as E, readonlyRecord as RR } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { smmaC } from '../averages/smma';
import { HighLowClose, HighLowCloseB, Movement } from '../types';
import { objectToBig, trimLeft } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { atrC } from './atr';

const getUpMovement = (up: Big, down: Big): Big => (up.gt(down) && up.gt(0) ? up : new Big(0));

const getDownMovement = (up: Big, down: Big): Big =>
  down.gt(up) && down.gt(0) ? down : new Big(0);

const getMovement = (up: Big, down: Big, move: Movement): Big =>
  move === 'up' ? getUpMovement(up, down) : getDownMovement(up, down);

const directionalMovement = (values: HighLowCloseB, move: Movement): ReadonlyArray<Big> =>
  values.low.reduce((reduced, low, index) => {
    if (index === 0) {
      return reduced;
    }
    const prev = index - 1;
    const up = values.high[index].sub(values.high[prev]);
    const down = values.low[prev].sub(low);
    return [...reduced, getMovement(up, down, move)];
  }, <ReadonlyArray<Big>>[]);

const directionalIndex = (
  values: HighLowCloseB,
  period: number,
  move: Movement,
): E.Either<Error, ReadonlyArray<Big>> =>
  pipe(
    E.bindTo('dm')(E.right(directionalMovement(values, move))),
    E.bind('dividends', ({ dm }) => smmaC(dm, period)),
    E.bind('divisors', () => atrC(values, period)),
    E.map(({ dividends, divisors }) =>
      dividends.map((dividend, index) => {
        const divisor = divisors[index];
        return divisor.eq(0) ? new Big(0) : dividend.mul(100).div(divisor);
      }),
    ),
  );

const calculation = (pdi: ReadonlyArray<Big>, mdi: ReadonlyArray<Big>): ReadonlyArray<Big> =>
  pdi.map((plus, index) => {
    const sum = plus.add(mdi[index]);
    if (sum.eq(0)) {
      return new Big(0);
    }
    const dividend = plus.sub(mdi[index]).abs();
    return dividend.div(sum);
  }, <ReadonlyArray<Big>>[]);

/**
 * The Average Directional Index (ADX) determines trend strength.
 * It also delivers Plus Directional Movement Indicator (PDI)
 * and Minus Directional Movement Indicator (MDI).
 * Crossings of these three values can be used to determine trend changes.
 *
 * @public
 */
export const adx = (
  values: HighLowClose,
  period = 14,
): E.Either<Error, RR.ReadonlyRecord<'adx' | 'mdi' | 'pdi', ReadonlyArray<Big>>> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, 2 * period + 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => objectToBig(valuesV)),
    E.bind('pdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'up')),
    E.bind('mdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'down')),
    E.bind('smoothed', ({ pdi, mdi, periodV }) => {
      const calculated = calculation(pdi, mdi);
      return smmaC(calculated, periodV);
    }),
    E.map(({ smoothed, pdi, mdi }) => ({
      adx: smoothed.map((value) => value.mul(100)),
      mdi: trimLeft(mdi, smoothed),
      pdi: trimLeft(pdi, smoothed),
    })),
  );
