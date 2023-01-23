import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { wamean } from 'src/averages/wamean.js';

describe('wamean', () => {
	test.each(<{ v: RNEA.ReadonlyNonEmptyArray<Big>; r: Big }[]>[
		{ v: [new Big(0)], r: new Big(0) },
		{ v: [new Big(1), new Big(2), new Big(3), new Big(-1.8)], r: new Big(0.68) },
	])('calculates the Average for values $v', ({ v, r }) => {
		expect(wamean(v)).toStrictEqual(r);
	});
});
