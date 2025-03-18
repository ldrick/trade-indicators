import { Big } from 'big.js';
import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import * as number_ from '../../src/utils/number.js';

describe('numberToBig', () => {
	it.each([
		{ r: E.right(new Big(1)), v: 1 },
		{ r: E.right(new Big(1.000_033_3)), v: 1.000_033_3 },
		{ r: E.right(new Big(0)), v: 0 },
		{ r: E.right(new Big(-4_988_383.99)), v: -4_988_383.99 },
		{ r: E.left(new Error('[big.js] Invalid number')), v: Number.NaN },
		{ r: E.left(new Error('[big.js] Invalid number')), v: Number.POSITIVE_INFINITY },
		{ r: E.left(new Error('[big.js] Invalid number')), v: Number.NEGATIVE_INFINITY },
	])('safely convert number to Big $v', ({ r, v }) => {
		expect(number_.toBig(v)).toStrictEqual(r);
	});
});
