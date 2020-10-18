import { dma } from './dma';

export const ema = (values: number[], period = 20): number[] =>
  dma(values, period, 2 / (period + 1));
