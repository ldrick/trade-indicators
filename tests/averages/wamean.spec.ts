import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import { wamean } from '../../src/averages/wamean.js';

describe('wamean', () => {
	it.each([
		{ r: new Big(0), v: [new Big(0)] },
		{ r: new Big(0.68), v: [new Big(1), new Big(2), new Big(3), new Big(-1.8)] },
	] as { r: Big; v: RNEA.ReadonlyNonEmptyArray<Big> }[])(
		'calculates the Average for values $v',
		({ r, v }) => {
			expect(wamean(v)).toStrictEqual(r);
		},
	);
});
