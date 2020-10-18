export interface HighLow {
  high: number[];
  low: number[];
}

export interface HighLowClose extends HighLow {
  close: number[];
}
