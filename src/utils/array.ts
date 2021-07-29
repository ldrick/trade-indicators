export const previous = <A>(a: readonly A[]): A => a[a.length - 1];

export const trimLeft = <A, O>(arr: readonly A[], offsetArr: readonly O[]): readonly A[] =>
  arr.length > offsetArr.length ? arr.slice(-1 * offsetArr.length) : arr;
