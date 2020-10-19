import { smma } from '../averages/smma';
import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError';
import { clear } from '../utils/array';
import { atr } from './atr';
import { HighLowClose } from './interfaces';

const pdm = (values: HighLowClose) => {
  return values.high
    .map((high, index) => {
      if (index === 0) {
        return Infinity;
      }

      const prev = index - 1;
      const up = high - values.high[prev];
      const down = values.low[prev] - values.low[index];
      return up > down && up > 0 ? up : 0;
    })
    .filter(clear);
};

export const pdi = (values: HighLowClose, period: number): number[] => {
  if (values.close.length !== values.high.length && values.close.length !== values.low.length) {
    throw new UnequalArraySizesError();
  }
  const minLength = period + 1;
  if (values.close.length < minLength) {
    throw new NotEnoughDataError('pdi', period, minLength);
  }

  const dividends = smma(pdm(values), period);
  const divisors = atr(values, period);
  return dividends.map((dividend, index) => (dividend * 100) / divisors[index]);
};
