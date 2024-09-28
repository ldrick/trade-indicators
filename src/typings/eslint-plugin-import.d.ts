declare module 'eslint-plugin-import' {
	import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

	const toBeExported: {
		flatConfigs: {
			electron: FlatConfig.Config;
			errors: FlatConfig.Config;
			react: FlatConfig.Config;
			'react-native': FlatConfig.Config;
			recommended: FlatConfig.Config;
			typescript: FlatConfig.Config;
			warnings: FlatConfig.Config;
		};
		meta: FlatConfig.Plugin['meta'];
		rules: FlatConfig.Plugin['rules'];
	};

	export default toBeExported;
}
