import { clear } from '../utils/array';
import { avg } from './avg';

export const dma = (values: number[], period: number, factor: number): number[] => {
  let previous: number;

  return values
    .map((value, index, array) => {
      const pointer = index + 1;

      if (pointer < period) {
        return Infinity;
      }

      let val = value;
      if (pointer === period) {
        // first is calculated as Moving Average
        val = avg(array.slice(pointer - period, pointer));
      } else {
        val = (val - previous) * factor + previous;
      }
      previous = val;

      return val;
    })
    .filter(clear);
};
