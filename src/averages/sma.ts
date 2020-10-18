import { NotEnoughDataError } from '../errors/NotEnoughDataError';
import { clear } from '../utils/array';
import { avg } from './avg';

export const sma = (values: number[], period = 20): number[] => {
  if (values.length < period) {
    throw new NotEnoughDataError();
  }

  return values
    .map((_value, index, array) => {
      const pointer = index + 1;

      if (pointer < period) {
        return null;
      }

      return avg(array.slice(pointer - period, pointer));
    })
    .filter(clear);
};
