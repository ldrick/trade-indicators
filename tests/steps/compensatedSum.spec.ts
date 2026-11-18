import { describe, expect, it } from 'vitest';

import { add, emptySum, total } from '../../src/steps/compensatedSum.js';

describe('compensatedSum', () => {
	it('keeps values that a plain sum loses', () => {
		const values = [1, 1e100, 1, -1e100];
		const plain = values.reduce((sum, value) => sum + value, 0);
		const compensated = values.reduce(add, emptySum);
		expect(plain).toBe(0);
		expect(total(compensated)).toBe(2);
	});

	it('returns to zero after adding and removing many values', () => {
		const values = Array.from({ length: 100_000 }, (_, index) => 100 + Math.sin(index) * 7.3);
		const added = values.reduce(add, emptySum);
		const removed = values.reduce((sum, value) => add(sum, -value), added);
		expect(total(removed)).toBe(0);
	});
});
