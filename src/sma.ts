import { avg } from './avg';
import { NotEnoughDataError } from './NotEnoughDataError';

export const sma = (values: number[], period = 20): number[] => {
  if (values.length < period) {
    throw new NotEnoughDataError();
  }

  return values.map((_value, index, array) => {
    const pointer = index + 1;

    if (pointer < period) {
      return 0;
    }

    return avg(array.slice(pointer - period, pointer));
  });
};
