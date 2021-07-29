import { Big } from 'big.js';

export type Movement = 'up' | 'down';
export type ValuesInput = readonly number[] | NumberObject;

export interface NumberObject {
  [x: string]: readonly number[];
}

export interface BigObject {
  [x: string]: readonly Big[];
}

export interface HighLowClose extends NumberObject {
  readonly high: readonly number[];
  readonly low: readonly number[];
  readonly close: readonly number[];
}

export interface HighLowCloseB extends BigObject {
  readonly high: readonly Big[];
  readonly low: readonly Big[];
  readonly close: readonly Big[];
}
