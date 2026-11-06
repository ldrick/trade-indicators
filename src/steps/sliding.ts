import * as Arr from 'effect/Array';
import * as O from 'effect/Option';

import { type Stepper } from './stepper.js';

/**
 * Input of a sliding window stepper: the entering value and the value leaving
 * the window (`null` while the window is not full yet).
 * @internal
 */
export type SlidingInput = readonly [entering: number, leaving: null | number];

/**
 * Batch inputs for a sliding window of `period` values: the leaving value is read
 * directly from `values`, so a whole series is processed in linear time.
 * @internal
 */
export const slidingInputs = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): Arr.NonEmptyReadonlyArray<SlidingInput> =>
	Arr.map(values, (value, index) => [
		value,
		index >= period ? O.getOrNull(Arr.get(values, index - period)) : null,
	]);

/**
 * State of `withWindow`: the last `period` inputs and the state of the wrapped stepper.
 * @internal
 */
export interface WindowState<S> {
	readonly inner: S;
	readonly window: readonly number[];
}

/**
 * Incremental counterpart of `slidingInputs`: remembers the last `period` inputs
 * to know the leaving value.
 * @internal
 */
export const withWindow = <S, O>(
	period: number,
	stepper: Stepper<S, SlidingInput, O>,
): Stepper<WindowState<S>, number, O> => ({
	initial: { inner: stepper.initial, window: [] },
	step: (state, input) => {
		const isFull = state.window.length === period;
		const leaving = isFull ? O.getOrNull(Arr.get(state.window, 0)) : null;
		const [inner, output] = stepper.step(state.inner, [input, leaving]);
		const window = isFull ? [...state.window.slice(1), input] : [...state.window, input];
		return [{ inner, window }, output];
	},
});
