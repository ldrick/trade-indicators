declare module 'eslint-plugin-functional' {
	import type { ClassicConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

	declare const exprt: {
		configs: {
			all: ClassicConfig.Config;
			lite: ClassicConfig.Config;
			recommended: ClassicConfig.Config;
			strict: ClassicConfig.Config;
			off: ClassicConfig.Config;
			'external-vanilla-recommended': ClassicConfig.Config;
			'external-typescript-recommended': ClassicConfig.Config;
			currying: ClassicConfig.Config;
			'no-exceptions': ClassicConfig.Config;
			'no-mutations': ClassicConfig.Config;
			'no-other-paradigms': ClassicConfig.Config;
			'no-statements': ClassicConfig.Config;
			stylistic: ClassicConfig.Config;
		};
		rules: NonNullable<Linter.Plugin['rules']>;
	};
	export = exprt;
}
