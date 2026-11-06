import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { toEither } from '../../src/utils/toEither.js';
import { failure, success } from '../result.js';

describe('toEither', () => {
	it('converts a failed Result to Left', () => {
		const error = new NotEnoughDataError(1, 2);
		expect(toEither(failure(error))).toStrictEqual(E.left(error));
	});

	it('converts a successful Result to Right', () => {
		expect(toEither(success([1.5, -2.5]))).toStrictEqual(E.right([1.5, -2.5]));
	});
});
