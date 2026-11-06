import * as R from 'effect/Result';
import { describe, expect, it } from 'vitest';

import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import * as number_ from '../../src/utils/number.js';

describe('validateFinite', () => {
	it.each([
		{ r: R.succeed(1), v: 1 },
		{ r: R.succeed(1.0000333), v: 1.0000333 },
		{ r: R.succeed(0), v: 0 },
		{ r: R.succeed(-4_988_383.99), v: -4_988_383.99 },
		{ r: R.fail(new NotFiniteNumberError()), v: NaN },
		{ r: R.fail(new NotFiniteNumberError()), v: Infinity },
		{ r: R.fail(new NotFiniteNumberError()), v: -Infinity },
	])('validates finite number $v', ({ r, v }) => {
		expect(number_.validateFinite(v)).toStrictEqual(r);
	});
});
