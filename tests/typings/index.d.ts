export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualFixedPrecision(expected: number[], decimals = 8): R;
    }
  }
}
