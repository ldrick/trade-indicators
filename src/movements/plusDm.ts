import { HighLow } from './interfaces';

// TODO: smooth
export const plusDm = (values: HighLow) => {
  return values.high.map((high, index) => {
    if (index === 0) {
      return 0;
    }
    const prev = index - 1;
    const up = high - values.high[prev];
    const down = values.low[prev] - values.low[index];
    return up > down && up > 0 ? up : 0;
  });
};
