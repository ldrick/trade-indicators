import { smma } from '../averages/smma';
import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError';
import { HighLowClose } from './interfaces';
import { mdi } from './mdi';
import { pdi } from './pdi';

export const adx = (values: HighLowClose, period = 14): number[] => {
  if (values.close.length !== values.high.length && values.close.length !== values.low.length) {
    throw new UnequalArraySizesError();
  }
  const minLength = 2 * period + 1;
  if (values.close.length < minLength) {
    throw new NotEnoughDataError('adx', period, minLength);
  }

  const pluses = pdi(values, period);
  const minuses = mdi(values, period);
  const calculated = pluses.map((plus, index) => {
    const dividend = Math.abs(plus - minuses[index]);
    const sum = plus + minuses[index];
    return dividend / (sum === 0 ? 1 : sum);
  });

  return smma(calculated, period).map((v) => v * 100);
};
