declare module '@eslint/js' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	const toBeExported: {
		configs: {
			all: FlatConfig.Config;
			recommended: FlatConfig.Config;
		};
	};
	export default toBeExported;
}
