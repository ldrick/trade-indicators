import { ema } from './ema';
import { NotEnoughDataError } from './NotEnoughDataError';

export const dema = (values: number[], period = 20): number[] => {
  const minLength = 2 * period - 1;

  if (values.length < minLength) {
    throw new NotEnoughDataError();
  }

  const start = period - 1;
  // calculate ema on all values
  const ema1 = ema(values, period);
  // calculate ema(ema) on leaving out ema zeros
  const ema2 = ema(ema1.slice(start), period);

  return values.map((_value, index) => {
    const pointer = index + 1;

    if (pointer < minLength) {
      return 0;
    }

    return 2 * ema1[index] - ema2[index - start];
  });
};
