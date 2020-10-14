import { NotEnoughDataError } from './NotEnoughDataError';

const wavg = (values: number[]): number => {
  const dividend = values.reduce(
    (accumulator, current, index) => accumulator + current * (index + 1),
    0,
  );
  const divisor = values.reduce((accumulator, _current, index) => accumulator + index + 1, 0);
  return dividend / divisor;
};

export const wma = (values: number[], period = 20): number[] => {
  if (values.length < period) {
    throw new NotEnoughDataError();
  }

  return values.map((_value, index, array) => {
    const pointer = index + 1;

    if (pointer < period) {
      return 0;
    }

    return wavg(array.slice(pointer - period, pointer));
  });
};
