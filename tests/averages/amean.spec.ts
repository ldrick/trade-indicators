import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { amean } from 'src/averages/amean.js';

describe('amean', () => {
	test.each(<{ v: RNEA.ReadonlyNonEmptyArray<Big>; r: Big }[]>[
		{ v: [new Big(0)], r: new Big(0) },
		{ v: [new Big(1), new Big(2), new Big(3), new Big(-1)], r: new Big(1.25) },
	])('calculates the Average for values $v', ({ v, r }) => {
		expect(amean(v)).toStrictEqual(r);
	});
});
