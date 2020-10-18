import { clear } from '../utils/array';
import { HighLowClose } from './interfaces';

export const trueRange = (values: HighLowClose): number[] => {
  return values.high
    .map((high, index) => {
      if (index === 0) {
        return null;
      }

      const prevClose = values.close[index - 1];
      return Math.max(
        high - values.low[index],
        Math.abs(high - prevClose),
        Math.abs(values.low[index] - prevClose),
      );
    })
    .filter(clear);
};
