import { readonlyNonEmptyArray as RNEA } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { wamean } from '../../src/averages/wamean.js';

describe('wamean', () => {
	it.each<{ r: number; v: RNEA.ReadonlyNonEmptyArray<number> }>([
		{ r: 0, v: [0] },
		{ r: 0.68, v: [1, 2, 3, -1.8] },
	])('calculates the Average for values $v', ({ r, v }) => {
		expect(wamean(v)).toBeCloseTo(r, 12);
	});
});
