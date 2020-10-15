import { avg } from './avg';
import { NotEnoughDataError } from './NotEnoughDataError';

export const ema = (values: number[], period = 20): number[] => {
  const factor = 2 / (period + 1);
  let previous: number;

  if (values.length < period) {
    throw new NotEnoughDataError();
  }

  return values.map((value, index, array) => {
    const pointer = index + 1;

    if (pointer < period) {
      return 0;
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
  });
};
