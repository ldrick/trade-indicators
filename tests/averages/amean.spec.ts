import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';
import { amean } from '../../src/averages/amean.js';

describe('amean', () => {
	it.each([
		{ v: [new Big(0)], r: new Big(0) },
		{ v: [new Big(1), new Big(2), new Big(3), new Big(-1)], r: new Big(1.25) },
	] as { v: RNEA.ReadonlyNonEmptyArray<Big>; r: Big }[])(
		'calculates the Average for values $v',
		({ v, r }) => {
			expect(amean(v)).toStrictEqual(r);
		},
	);
});
