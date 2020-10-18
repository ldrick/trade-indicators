import { dma } from './dma';

export const smma = (values: number[], period = 20): number[] => dma(values, period, 1 / period);
