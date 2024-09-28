import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import * as big from '../../src/utils/big.js';

describe('ord.compare', () => {
	it.each([
		{ f: new Big(-1), r: 1, s: new Big(-2) },
		{ f: new Big(0), r: 0, s: new Big(0) },
		{ f: new Big(-1), r: -1, s: new Big(2) },
	])('fp-ts Ord compares two Big $f and $s', ({ f, r, s }) => {
		expect(big.ord.compare(f, s)).toStrictEqual(r);
	});
});

describe('ord.equals', () => {
	it.each([
		{ f: new Big(-1), r: false, s: new Big(-2) },
		{ f: new Big(0), r: true, s: new Big(0) },
		{ f: new Big(-1), r: false, s: new Big(2) },
	])('fp-ts Ord compares two Big $f and $s', ({ f, r, s }) => {
		expect(big.ord.equals(f, s)).toStrictEqual(r);
	});
});

describe('max', () => {
	it.each<{
		r: Big;
		v: RNEA.ReadonlyNonEmptyArray<Big>;
	}>([
		{ r: new Big(-1), v: [new Big(-1)] },
		{ r: new Big(0), v: [new Big(0)] },
		{ r: new Big(2), v: [new Big(1), new Big(1), new Big(2)] },
	])('returns the maximum value of $v', ({ r, v }) => {
		expect(big.max(v)).toStrictEqual(r);
	});
});
