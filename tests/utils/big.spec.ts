import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';
import * as big from '../../src/utils/big.js';

describe('ord.compare', () => {
	it.each([
		{ f: new Big(-1), s: new Big(-2), r: 1 },
		{ f: new Big(0), s: new Big(0), r: 0 },
		{ f: new Big(-1), s: new Big(2), r: -1 },
	])('fp-ts Ord compares two Big $f and $s', ({ f, s, r }) => {
		expect(big.ord.compare(f, s)).toStrictEqual(r);
	});
});

describe('ord.equals', () => {
	it.each([
		{ f: new Big(-1), s: new Big(-2), r: false },
		{ f: new Big(0), s: new Big(0), r: true },
		{ f: new Big(-1), s: new Big(2), r: false },
	])('fp-ts Ord compares two Big $f and $s', ({ f, s, r }) => {
		expect(big.ord.equals(f, s)).toStrictEqual(r);
	});
});

describe('max', () => {
	it.each<{
		v: RNEA.ReadonlyNonEmptyArray<Big>;
		r: Big;
	}>([
		{ v: [new Big(-1)], r: new Big(-1) },
		{ v: [new Big(0)], r: new Big(0) },
		{ v: [new Big(1), new Big(1), new Big(2)], r: new Big(2) },
	])('returns the maximum value of $v', ({ v, r }) => {
		expect(big.max(v)).toStrictEqual(r);
	});
});
