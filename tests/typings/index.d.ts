import { ReadonlyRecordNumber } from '../../src/types';

declare global {
  namespace jest {
    interface Matchers<R> {
      eitherRightToEqualFixedPrecision(
        expected: ReadonlyArray<number> | ReadonlyRecordNumber,
        decimals = 12,
      ): R;
    }
  }
}
