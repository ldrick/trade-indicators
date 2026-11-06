import * as Arr from 'effect/Array';
import * as R from 'effect/Result';
import { describe, expect, it } from 'vitest';

import { EmptyArrayError } from '../../src/errors/EmptyArrayError.js';
import * as array from '../../src/utils/array.js';

describe('tail', () => {
	it.each<{
		r: R.Result<Arr.NonEmptyReadonlyArray<number>, Error>;
		v: Arr.NonEmptyReadonlyArray<number>;
	}>([
		{ r: R.fail(new EmptyArrayError()), v: [1] },
		{ r: R.succeed([2]), v: [1, 2] },
	])('takes all but the first element of an given Array $v', ({ r, v }) => {
		expect(array.tail(v)).toStrictEqual(r);
	});
});

describe('fillLeftW', () => {
	it.each<{
		r: Arr.NonEmptyReadonlyArray<null | number>;
		s: number;
		v: Arr.NonEmptyReadonlyArray<number>;
	}>([
		{ r: [null, null, null, null, 1], s: 5, v: [1] },
		{ r: [1, 2], s: 2, v: [1, 2] },
		{ r: [1, 2, 3], s: 2, v: [1, 2, 3] },
	])(
		'creates a copy of given Array and fills from left up to size $s with given value',
		({ r, s, v }) => {
			expect(array.fillLeftW(s, null)(v)).toStrictEqual(r);
		},
	);
});
