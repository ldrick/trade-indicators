import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { dma } from './dma';

export const smma = (values: number[], period = 20): number[] => {
  if (values.length < period) {
    throw new NotEnoughDataError('smma', period, period);
  }
  return dma(values, period, 1 / period);
};
