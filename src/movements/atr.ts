import { smma } from '../averages/smma';
import { HighLowClose } from './interfaces';
import { trueRange } from './trueRange';

export const atr = (values: HighLowClose, period: number): number[] =>
  smma(trueRange(values), period);
