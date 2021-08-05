import { Big } from 'big.js';
import { readonlyRecord as RR } from 'fp-ts';

export type Movement = 'up' | 'down';

export type ValuesInput = ReadonlyArray<number> | NumberObject;

export type NumberObject = RR.ReadonlyRecord<string, ReadonlyArray<number>>;

export type BigObject = RR.ReadonlyRecord<string, ReadonlyArray<Big>>;

export type HighLowClose = NumberObject & {
  high: ReadonlyArray<number>;
  low: ReadonlyArray<number>;
  close: ReadonlyArray<number>;
};

export type HighLowCloseB = BigObject & {
  high: ReadonlyArray<Big>;
  low: ReadonlyArray<Big>;
  close: ReadonlyArray<Big>;
};
