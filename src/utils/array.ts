/**
 * Get the second last item from `Array`.
 *
 * @internal
 */
export const previous = <A>(a: readonly A[]): A => a[a.length - 1];

/**
 * Create new `Array` from given `Array` by dropping left items to reach size of offset `Array`.
 *
 * @internal
 */
export const trimLeft = <A, O>(arr: readonly A[], offsetArr: readonly O[]): readonly A[] =>
  arr.length > offsetArr.length ? arr.slice(-1 * offsetArr.length) : arr;
