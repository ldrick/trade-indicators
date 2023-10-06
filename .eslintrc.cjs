// @ts-check
/** @type {import('eslint').Linter.Config} */
const config = {
	ignorePatterns: ['**/node_modules/', '/dist', '/coverage'],
	env: {
		es6: true,
		node: true,
	},
	extends: ['airbnb-base', 'plugin:eslint-comments/recommended', 'prettier'],
	overrides: [
		{
			files: ['*.ts'],
			extends: [
				'airbnb-typescript/base',
				'plugin:@typescript-eslint/strict-type-checked',
				'plugin:@typescript-eslint/stylistic-type-checked',
				'plugin:jsdoc/recommended',
				'plugin:eslint-comments/recommended',
				'prettier',
			],
			parserOptions: {
				project: './tsconfig.json',
				warnOnUnsupportedTypeScriptVersion: false,
			},
			rules: {
				'no-nested-ternary': 'off',
				'import/prefer-default-export': 'off',
				'import/no-default-export': 'error',
				'jsdoc/require-returns': 'off',
				'jsdoc/require-param': 'off',
				'jsdoc/require-jsdoc': [
					'warn',
					{
						publicOnly: {
							esm: true,
						},
						require: {
							ArrowFunctionExpression: true,
							ClassDeclaration: true,
							ClassExpression: true,
							FunctionDeclaration: true,
							FunctionExpression: true,
							MethodDefinition: false,
						},
					},
				],
				'jsdoc/require-description': [
					'warn',
					{
						contexts: ['any'],
					},
				],
				'jsdoc/check-tag-names': [
					'warn',
					{
						definedTags: ['internal'],
					},
				],
			},
		},
		{
			files: ['src/!(errors)/*.ts'],
			plugins: ['functional'],
			extends: ['plugin:functional/recommended'],
			settings: {
				immutability: {
					overrides: [
						{
							type: { from: 'package', package: 'big.js', name: 'Big' },
							from: 'Mutable',
							to: 'Immutable',
						},
					],
				},
			},
			rules: {
				'@typescript-eslint/prefer-readonly-parameter-types': 'off',
				'functional/functional-parameters': [
					'warn',
					{
						enforceParameterCount: false,
					},
				],
			},
		},
		{
			files: ['*.spec.ts'],
			plugins: ['vitest'],
			rules: {
				'vitest/consistent-test-it': [
					'warn',
					{
						fn: 'it',
						withinDescribe: 'it',
					},
				],
			},
		},
	],
};

module.exports = config;
