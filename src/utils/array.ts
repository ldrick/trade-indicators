import { readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Get the second last item from `Array`.
 *
 * @internal
 */
export const previous = <A>(a: RNEA.ReadonlyNonEmptyArray<A>): A => a[a.length - 1];

/**
 * Create new `Array` from given `Array` by dropping left items to reach size of offset `Array`.
 *
 * @internal
 */
export const trimLeft = <A, O>(
  arr: RNEA.ReadonlyNonEmptyArray<A>,
  offsetArr: RNEA.ReadonlyNonEmptyArray<O>,
): RNEA.ReadonlyNonEmptyArray<A> =>
  arr.length > offsetArr.length ? arr.slice(-1 * offsetArr.length) : arr;
