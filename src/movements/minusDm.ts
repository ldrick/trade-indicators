import { HighLow } from './interfaces';

// TODO: smooth
export const minusDm = (values: HighLow) => {
  return values.low.map((low, index) => {
    if (index === 0) {
      return 0;
    }
    const prev = index - 1;
    const up = values.high[index] - values.high[prev];
    const down = values.low[prev] - low;
    return down > up && down > 0 ? down : 0;
  });
};
