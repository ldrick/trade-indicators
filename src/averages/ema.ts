import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { dma } from './dma';

export const ema = (values: number[], period = 20): number[] => {
  if (values.length < period) {
    throw new NotEnoughDataError('ema', period, period);
  }
  return dma(values, period, 2 / (period + 1));
};
