import * as R from 'effect/Result';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { toEffectResult } from '../../src/utils/toEffectResult.js';
import { failure, success } from '../result.js';

describe('toEffectResult', () => {
	it('converts a failed Result to an Effect Failure', () => {
		const error = new NotEnoughDataError(1, 2);
		expect(toEffectResult(failure(error))).toStrictEqual(R.fail(error));
	});

	it('converts a successful Result to an Effect Success', () => {
		expect(toEffectResult(success([1.5, -2.5]))).toStrictEqual(R.succeed([1.5, -2.5]));
	});
});
