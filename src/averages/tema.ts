import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { ema } from './ema';

export const tema = (values: number[], period = 20): number[] => {
  const minLength = 3 * period - 2;

  if (values.length < minLength) {
    throw new NotEnoughDataError('tema', period, minLength);
  }

  // calculate ema
  const ema1 = ema(values, period);
  // calculate ema(ema)
  const ema2 = ema(ema1, period);
  // calculate ema(ema(ema))
  const ema3 = ema(ema2, period);

  return ema3.map(
    (value, index) => 3 * ema1[index + 2 * (period - 1)] - 3 * ema2[index + period - 1] + value,
  );
};
