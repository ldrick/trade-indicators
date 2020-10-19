import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { ema } from './ema';

export const dema = (values: number[], period = 20): number[] => {
  const minLength = 2 * period - 1;

  if (values.length < minLength) {
    throw new NotEnoughDataError('dema', period, minLength);
  }

  // calculate ema
  const ema1 = ema(values, period);
  // calculate ema(ema)
  const ema2 = ema(ema1, period);

  return ema2.map((value, index) => {
    return 2 * ema1[index + period - 1] - value;
  });
};
