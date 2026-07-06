import { Big } from 'big.js';
import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import * as number_ from '../../src/utils/number.js';

describe('numberToBig', () => {
	it.each([
		{ r: E.right(new Big(1)), v: 1 },
		{ r: E.right(new Big(1.0000333)), v: 1.0000333 },
		{ r: E.right(new Big(0)), v: 0 },
		{ r: E.right(new Big(-4_988_383.99)), v: -4_988_383.99 },
		{ r: E.left(new Error('[big.js] Invalid number')), v: NaN },
		{ r: E.left(new Error('[big.js] Invalid number')), v: Infinity },
		{ r: E.left(new Error('[big.js] Invalid number')), v: -Infinity },
	])('safely convert number to Big $v', ({ r, v }) => {
		expect(number_.toBig(v)).toStrictEqual(r);
	});
});
