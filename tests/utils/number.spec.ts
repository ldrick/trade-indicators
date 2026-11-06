import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import * as number_ from '../../src/utils/number.js';

describe('validateFinite', () => {
	it.each([
		{ r: E.right(1), v: 1 },
		{ r: E.right(1.0000333), v: 1.0000333 },
		{ r: E.right(0), v: 0 },
		{ r: E.right(-4_988_383.99), v: -4_988_383.99 },
		{ r: E.left(new NotFiniteNumberError()), v: NaN },
		{ r: E.left(new NotFiniteNumberError()), v: Infinity },
		{ r: E.left(new NotFiniteNumberError()), v: -Infinity },
	])('validates finite number $v', ({ r, v }) => {
		expect(number_.validateFinite(v)).toStrictEqual(r);
	});
});
