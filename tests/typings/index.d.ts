import { NumberObject } from '../../src/types';

declare global {
  namespace jest {
    interface Matchers<R> {
      eitherRightToEqualFixedPrecision(
        expected: readonly number[] | NumberObject,
        decimals = 12,
      ): R;
    }
  }
}
