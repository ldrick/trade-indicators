import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { EmptyArrayError } from 'src/errors/EmptyArrayError.js';
import * as arr from 'src/utils/array.js';

describe('tail', () => {
	test.each<{
		v: RNEA.ReadonlyNonEmptyArray<number>;
		r: E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>;
	}>([
		{ v: [1], r: E.left(new EmptyArrayError()) },
		{ v: [1, 2], r: E.right([2]) },
	])('takes all but the first element of an given Array $v', ({ v, r }) => {
		expect(arr.tail(v)).toStrictEqual(r);
	});
});

describe('fillLeftW', () => {
	test.each<{
		v: RNEA.ReadonlyNonEmptyArray<number>;
		s: number;
		r: RNEA.ReadonlyNonEmptyArray<number | undefined>;
	}>([
		{ v: [1], s: 5, r: [undefined, undefined, undefined, undefined, 1] },
		{ v: [1, 2], s: 2, r: [1, 2] },
		{ v: [1, 2, 3], s: 2, r: [1, 2, 3] },
	])(
		'creates a copy of given Array and fills from left up to size $s with given value',
		({ v, s, r }) => {
			expect(arr.fillLeftW(s, undefined)(v)).toStrictEqual(r);
		},
	);
});
