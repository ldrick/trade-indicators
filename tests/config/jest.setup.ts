import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';

expect.extend({
  toEqualFixedPrecision: (actual: number[], expected: number[], decimals = 8) => {
    const passMessage = (a: number[], e: number[]) => () =>
      `${matcherHint('.not.toEqualFixedPrecision')}\n\n` +
      `Expected list to not equal on fixed decimals:\n` +
      `  ${printExpected(e)}\n` +
      `Received:\n` +
      `  ${printReceived(a)}`;

    const failMessage = (a: number[], e: number[]) => () =>
      `${matcherHint('.toEqualFixedPrecision')}\n\n` +
      `Expected list to equal on fixed decimals:\n` +
      `  ${printExpected(e)}\n` +
      `Received:\n` +
      `  ${printReceived(a)}`;

    const pass = actual.every(
      (a, index) => a.toFixed(decimals) === expected[index].toFixed(decimals),
    );

    if (pass) {
      return { pass: true, message: passMessage(actual, expected) };
    }
    return { pass: false, message: failMessage(actual, expected) };
  },
});
