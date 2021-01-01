import { smma } from '../averages/smma';
import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError';
import { clear } from '../utils/array';
import { atr } from './atr';
import { HighLowClose } from './interfaces';

const mdm = (values: HighLowClose) =>
  values.low
    .map((low, index) => {
      if (index === 0) {
        return Infinity;
      }

      const prev = index - 1;
      const up = values.high[index] - values.high[prev];
      const down = values.low[prev] - low;
      return down > up && down > 0 ? down : 0;
    })
    .filter(clear);

export const mdi = (values: HighLowClose, period: number): number[] => {
  if (values.close.length !== values.high.length && values.close.length !== values.low.length) {
    throw new UnequalArraySizesError();
  }
  const minLength = period + 1;
  if (values.close.length < minLength) {
    throw new NotEnoughDataError('mdi', period, minLength);
  }

  const dividends = smma(mdm(values), period);
  const divisors = atr(values, period);
  return dividends.map((dividend, index) => (dividend * 100) / divisors[index]);
};
