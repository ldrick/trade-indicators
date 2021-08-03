import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Weighted Arithmetic Mean.
 */
export const wamean = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big => {
  const dividend = values.reduce(
    (reduced, value, index) => reduced.add(value.mul(index + 1)),
    new Big(0),
  );
  const divisor = values.reduce((reduced, _value, index) => reduced.add(index + 1), new Big(0));
  return dividend.div(divisor);
};
