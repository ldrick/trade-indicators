import { ema } from './ema';
import { NotEnoughDataError } from './NotEnoughDataError';

export const tema = (values: number[], period = 20): number[] => {
  const minLength = 3 * period - 2;

  if (values.length < minLength) {
    throw new NotEnoughDataError();
  }

  const start = period - 1;
  // calculate ema on all values
  const ema1 = ema(values, period);
  // calculate ema(ema) on leaving out ema zeros
  const ema2 = ema(ema1.slice(start), period);
  // calculate ema(ema(ema)) on leaving out ema(ema) zeros
  const ema3 = ema(ema2.slice(start), period);

  return values.map((_value, index) => {
    const pointer = index + 1;

    if (pointer < minLength) {
      return 0;
    }

    return 3 * ema1[index] - 3 * ema2[index - start] + ema3[index - 2 * start];
  });
};
