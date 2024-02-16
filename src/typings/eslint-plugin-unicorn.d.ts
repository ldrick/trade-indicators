declare module 'eslint-plugin-unicorn' {
	import type { ClassicConfig, FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

	declare const exprt: {
		configs: {
			all: ClassicConfig.Config;
			'flat/all': FlatConfig.Config;
			recommended: ClassicConfig.Config;
			'flat/recommended': FlatConfig.Config;
		};
		rules: NonNullable<Linter.Plugin['rules']>;
	};
	export = exprt;
}
