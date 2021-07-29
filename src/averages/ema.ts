import { Big } from 'big.js';
import { apply as AP, either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { arrayToBig, numberToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { dmaC } from './dma';

const getFactor = (period: number): E.Either<Error, Big> =>
  pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(2).div(periodB.add(1))),
  );

export const emaC = (values: readonly Big[], period: number): E.Either<Error, readonly Big[]> =>
  pipe(
    period,
    getFactor,
    E.map((factorB) => dmaC(values, period, factorB)),
  );

export const ema = (values: readonly number[], period = 20): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => emaC(valuesB, periodV)),
  );
