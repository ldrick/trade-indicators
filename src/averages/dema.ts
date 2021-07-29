import { Big } from 'big.js';
import { apply as AP, either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { arrayToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { emaC } from './ema';

const calculate = (one: readonly Big[], two: readonly Big[], period: number): readonly Big[] =>
  two.map((value, index) => one[index + period - 1].mul(2).sub(value));

export const dema = (values: readonly number[], period = 20): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, 2 * period - 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
    E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
    E.map(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
  );
