type ArrayType<T> = Extract<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	true extends false & T ? any[] : T extends readonly any[] ? T : unknown[],
	T
>;

declare global {
	interface ArrayConstructor {
		/**
		 * Fixed type guard for arrays.
		 * @see https://github.com/microsoft/TypeScript/issues/17002#issuecomment-1285847629
		 */
		isArray<T>(argument: T): argument is ArrayType<T>;
	}
}

export {};
