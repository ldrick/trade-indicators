type ArrayType<T> = Extract<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	true extends false & T ? any[] : T extends readonly any[] ? T : unknown[],
	T
>;

declare global {
	interface ArrayConstructor {
		isArray<T>(argument: T): argument is ArrayType<T>;
	}
}

export {};
