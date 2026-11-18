import * as Arr from 'effect/Array';

/**
 * Pure state machine: `step` takes the current state and the next input
 * and returns the next state and the output for this input.
 * Every indicator is a `Stepper`; batch and incremental calculation share it.
 * @internal
 */
// A state machine pairs its initial state with its transition function.
// eslint-disable-next-line functional/no-mixed-types
export interface Stepper<S, I, O> {
	readonly initial: S;
	readonly step: (state: S, input: I) => readonly [S, O];
}

/**
 * Run a stepper over all inputs: one output per input, linear in the input length.
 * @internal
 */
export const run =
	<S, I, O>(stepper: Stepper<S, I, O>) =>
	(inputs: Arr.NonEmptyReadonlyArray<I>): Arr.NonEmptyReadonlyArray<O> =>
		Arr.mapAccum(inputs, stepper.initial, (state, input) => stepper.step(state, input))[1];

/**
 * Feed only non-null inputs to `stepper`; a `null` input yields `null` and keeps the state.
 * @internal
 */
export const skipNull = <S, I, O>(stepper: Stepper<S, I, O>): Stepper<S, I | null, null | O> => ({
	initial: stepper.initial,
	step: (state, input) => (input === null ? [state, null] : stepper.step(state, input)),
});
