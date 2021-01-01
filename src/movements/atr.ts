import { smma } from '../averages/smma';
import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError';
import { clear } from '../utils/array';
import { HighLowClose } from './interfaces';

const trueRange = (values: HighLowClose): number[] =>
  values.high
    .map((high, index) => {
      if (index === 0) {
        return Infinity;
      }

      const prevClose = values.close[index - 1];
      return Math.max(
        high - values.low[index],
        Math.abs(high - prevClose),
        Math.abs(values.low[index] - prevClose),
      );
    })
    .filter(clear);

export const atr = (values: HighLowClose, period: number): number[] => {
  if (values.close.length !== values.high.length && values.close.length !== values.low.length) {
    throw new UnequalArraySizesError();
  }
  const minLength = period + 1;
  if (values.close.length < minLength) {
    throw new NotEnoughDataError('atr', period, minLength);
  }

  return smma(trueRange(values), period);
};
