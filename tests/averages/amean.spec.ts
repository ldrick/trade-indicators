import { readonlyNonEmptyArray as RNEA } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { amean } from '../../src/averages/amean.js';

describe('amean', () => {
	it.each<{ r: number; v: RNEA.ReadonlyNonEmptyArray<number> }>([
		{ r: 0, v: [0] },
		{ r: 1.25, v: [1, 2, 3, -1] },
	])('calculates the Average for values $v', ({ r, v }) => {
		expect(amean(v)).toBeCloseTo(r, 12);
	});
});
