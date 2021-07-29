import { either as E } from 'fp-ts/lib';
import { NotPositiveIntegerError } from '../errors';

export const validatePeriod = (period: number, name: string): E.Either<Error, number> =>
  period > 0 && Number.isInteger(period)
    ? E.right(period)
    : E.left(new NotPositiveIntegerError(name));
