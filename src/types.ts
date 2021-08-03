import { Big } from 'big.js';

export type Movement = 'up' | 'down';
export type ValuesInput = Readonly<number[]> | NumberObject;
export type NumberObject = Readonly<Record<string, Readonly<number[]>>>;
export type BigObject = Readonly<Record<string, Readonly<Big[]>>>;

export interface HighLowClose extends NumberObject {
  high: Readonly<number[]>;
  low: Readonly<number[]>;
  close: Readonly<number[]>;
}

export interface HighLowCloseB extends BigObject {
  high: Readonly<Big[]>;
  low: Readonly<Big[]>;
  close: Readonly<Big[]>;
}
