import { type Stepper } from './stepper.js';

/**
 * State of an exponential smoother.
 * @internal
 */
export interface SmootherState {
	readonly count: number;
	readonly sum: number;
	readonly value: null | number;
}

const seed = (period: number, state: SmootherState, input: number): SmootherState => {
	const count = state.count + 1;
	const sum = state.sum + input;
	return { count, sum, value: count === period ? sum / period : null };
};

/**
 * Exponential smoothing, the base of the Exponential (EMA) and Smoothed Moving Average (SMMA).
 * The first value is the arithmetic mean of the first `period` inputs,
 * every further value is `(input - previous) * factor + previous`.
 * @internal
 */
export const smoother = (
	period: number,
	factor: number,
): Stepper<SmootherState, number, null | number> => ({
	initial: { count: 0, sum: 0, value: null },
	step: (state, input) => {
		const next =
			state.value === null
				? seed(period, state, input)
				: { ...state, value: (input - state.value) * factor + state.value };
		return [next, next.value];
	},
});
