declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	declare const toBeExported: {
		recommended: FlatConfig.Config;
	};
	export = toBeExported;
}
