import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Arithmetic Mean.
 */
export const amean = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big =>
  values.reduce((reduced, value) => reduced.add(value), new Big(0)).div(values.length);
