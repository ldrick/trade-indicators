/**
 * Running sum with Neumaier compensation: adding and removing many values
 * keeps the rounding error at the level of a single addition.
 * @internal
 */
export interface CompensatedSum {
	readonly compensation: number;
	readonly sum: number;
}

/**
 * Empty compensated sum.
 * @internal
 */
export const emptySum: CompensatedSum = { compensation: 0, sum: 0 };

/**
 * Add `value` (negative to remove it).
 * @internal
 */
export const add = (accumulator: CompensatedSum, value: number): CompensatedSum => {
	const sum = accumulator.sum + value;
	const lost =
		Math.abs(accumulator.sum) >= Math.abs(value)
			? accumulator.sum - sum + value
			: value - sum + accumulator.sum;
	return { compensation: accumulator.compensation + lost, sum };
};

/**
 * Current value of the sum.
 * @internal
 */
export const total = (accumulator: CompensatedSum): number =>
	accumulator.sum + accumulator.compensation;
