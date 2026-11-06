import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { type Incremental } from '../types.js';
import { fromResult } from '../utils/result.js';
import { type Stepper } from './stepper.js';

/**
 * Wrap a stepper into the public, immutable `Incremental` API.
 * Every `push` validates the input and returns a new instance; existing instances never change.
 * @internal
 */
export const toIncremental = <S, I, O>(
	stepper: Stepper<S, I, O>,
	initialValue: O,
	validate: (input: I) => R.Result<I, Error>,
): Incremental<I, O> => {
	const make = (state: S, value: O): Incremental<I, O> => ({
		push: (input) =>
			pipe(
				validate(input),
				R.map((valid) => {
					const [next, output] = stepper.step(state, valid);
					return make(next, output);
				}),
				fromResult,
			),
		value,
	});
	return make(stepper.initial, initialValue);
};
