import * as Arr from 'effect/Array';
import { describe, expect, it } from 'vitest';

import { wamean } from '../../src/averages/wamean.js';

describe('wamean', () => {
	it.each<{ r: number; v: Arr.NonEmptyReadonlyArray<number> }>([
		{ r: 0, v: [0] },
		{ r: 0.68, v: [1, 2, 3, -1.8] },
	])('calculates the Average for values $v', ({ r, v }) => {
		expect(wamean(v)).toBeCloseTo(r, 12);
	});
});
