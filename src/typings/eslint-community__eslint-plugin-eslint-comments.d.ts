declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
	import type { Linter } from 'eslint';

	const recommended: Linter.Config & {
		// @see https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215
		plugins: NonNullable<Linter.Config['plugins']>;
	};
	export = { recommended };
}
