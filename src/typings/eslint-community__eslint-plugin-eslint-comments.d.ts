declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	const toBeExported: {
		recommended: FlatConfig.Config;
	};
	export default toBeExported;
}
