import { NumberObject } from '../../src/types';

declare global {
  namespace jest {
    interface Matchers<R> {
      eitherRightToEqualFixedPrecision(
        expected: ReadonlyArray<number> | NumberObject,
        decimals = 12,
      ): R;
    }
  }
}
