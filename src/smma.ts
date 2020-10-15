import { ema } from './ema';

export const smma = (values: number[], period = 20): number[] => ema(values, period * 2 - 1);
