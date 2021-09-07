import { Big } from 'big.js';
import {
  apply as AP,
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { NotEnoughDataError } from '../errors';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues2 } from '../validations';

const calculation = (
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
  cb: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    RNEA.range(0, values.length - period),
    RNEA.traverse(E.Applicative)((r) => {
      const part = values.slice(r, period + r);
      return RA.isNonEmpty(part) && part.length === period
        ? E.right(cb(part))
        : E.left(new NotEnoughDataError(period, period));
    }),
  );

/**
 * Moving Average
 *
 * @internal
 */
export const ma = (
  values: ReadonlyArray<number>,
  period: number,
  cb: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues2(values),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => calculation(valuesB, periodV, cb)),
  );
