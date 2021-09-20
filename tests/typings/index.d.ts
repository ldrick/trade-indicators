import { JestResult } from '../types';

declare global {
  namespace jest {
    interface Matchers<R> {
      eitherRightToEqualFixedPrecision(expected: JestResult, decimals = 12): R;
    }
  }
}
