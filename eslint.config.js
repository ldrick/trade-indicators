// @ts-check

import commentsPlugin, {
	configs as commentsConfigs,
} from '@eslint-community/eslint-plugin-eslint-comments';
import eslint from '@eslint/js';
import jsonPlugin from '@eslint/json';
import markdownPlugin from '@eslint/markdown';
import vitestPlugin from '@vitest/eslint-plugin';
import configPrettier from 'eslint-config-prettier';
import functionalPlugin from 'eslint-plugin-functional';
import { importX as importXPlugin } from 'eslint-plugin-import-x';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import { configs as packageJsonConfigs } from 'eslint-plugin-package-json';
import { configs as perfectionistConfigs } from 'eslint-plugin-perfectionist';
import unicornPlugin from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { configs as typescriptEslintConfigs } from 'typescript-eslint';

const EXTENSIONS_MINIMATCH = {
	JavaScript: ['**/*.cjs', '**/*.mjs', '**/*.js'],
	JavaScriptReact: ['**/*.jsx'],
	JSON: ['**/*.json'],
	JSONC: ['**/*.jsonc'],
	Markdown: ['**/*.md'],
	TypeScript: ['**/*.cts', '**/*.mts', '**/*.ts'],
	TypeScriptDefinition: ['**/*.d.ts'],
	TypeScriptReact: ['**/*.tsx'],
};

export default defineConfig(
	// ignored files
	globalIgnores(['node_modules', 'dist', 'coverage', 'package-lock.json']),
	// restrict eslint recommended only to js and ts files
	{
		extends: [eslint.configs.recommended],
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScript,
			...EXTENSIONS_MINIMATCH.TypeScriptReact,
		],
	},
	// extend typescript-eslint recommended configs as in their docs
	typescriptEslintConfigs.strictTypeChecked,
	typescriptEslintConfigs.stylisticTypeChecked,
	// base config for js and ts files
	{
		extends: [
			importXPlugin.configs['flat/recommended'],
			importXPlugin.configs['flat/typescript'],
			unicornPlugin.configs.recommended,
			perfectionistConfigs['recommended-natural'],
		],
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScript,
			...EXTENSIONS_MINIMATCH.TypeScriptReact,
			...EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		],
		languageOptions: {
			ecmaVersion: 2024,
			globals: {
				...globals.es2024,
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				warnOnUnsupportedTypeScriptVersion: false,
			},
		},
		plugins: {
			['@eslint-community/eslint-comments']: commentsPlugin,
		},
		rules: {
			...commentsConfigs.recommended.rules,
			'import-x/no-default-export': 'error',
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-null': 'off',
		},
	},
	// disable type-checked rules according to file types without typings
	// https://typescript-eslint.io/troubleshooting/typed-linting/#how-can-i-disable-type-aware-linting-for-a-set-of-files
	{
		extends: [typescriptEslintConfigs.disableTypeChecked],
		files: [
			...EXTENSIONS_MINIMATCH.JavaScript,
			...EXTENSIONS_MINIMATCH.JavaScriptReact,
			...EXTENSIONS_MINIMATCH.JSON,
			...EXTENSIONS_MINIMATCH.JSONC,
			...EXTENSIONS_MINIMATCH.Markdown,
		],
	},
	// overrides for TypeScript files
	{
		extends: [jsdocPlugin.configs['flat/recommended-typescript-error']],
		files: [...EXTENSIONS_MINIMATCH.TypeScript, ...EXTENSIONS_MINIMATCH.TypeScriptReact],
		ignores: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		rules: {
			'jsdoc/check-tag-names': [
				'error',
				{
					definedTags: ['internal'],
				},
			],
			'jsdoc/require-description': [
				'error',
				{
					contexts: ['any'],
				},
			],
			'jsdoc/require-jsdoc': [
				'error',
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
			'jsdoc/require-param': 'off',
			'jsdoc/require-returns': 'off',
			'no-nested-ternary': 'off',
		},
	},
	// overrides for TypeScript Definition files
	{
		files: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		rules: {
			'@typescript-eslint/no-empty-object-type': [
				'error',
				{ allowInterfaces: 'with-single-extends', allowObjectTypes: 'never' },
			],
			'import-x/no-default-export': 'off',
			'unicorn/filename-case': 'off',
		},
	},
	// overrides for functional TypeScript files
	{
		extends: [
			functionalPlugin.configs.recommended,
			functionalPlugin.configs.externalTypeScriptRecommended,
			functionalPlugin.configs.stylistic,
		],
		files: ['src/!(errors)/*.ts'],
		ignores: EXTENSIONS_MINIMATCH.TypeScriptDefinition,
		settings: {
			immutability: {
				overrides: [
					{
						// Always treat big.js's Big as Immutable.
						to: 'Immutable',
						type: { from: 'package', package: 'big.js', pattern: /^Big.BigConstructor.Big$/ },
					},
					{
						// Always treat TypeScript's ReadonlyArrays as Immutable.
						to: 'Immutable',
						type: { from: 'lib', name: 'ReadonlyArray' },
					},
				],
			},
		},
	},
	// overrides for Test files
	{
		extends: [vitestPlugin.configs.recommended],
		files: ['**/*.spec.ts'],
		languageOptions: {
			globals: {
				...vitestPlugin.environments.env.globals,
			},
		},
		rules: {
			'vitest/consistent-test-it': [
				'error',
				{
					fn: 'it',
					withinDescribe: 'it',
				},
			],
		},
		settings: {
			vitest: {
				typecheck: true,
			},
		},
	},
	// overrides for json files
	{
		extends: [jsonPlugin.configs.recommended],
		files: EXTENSIONS_MINIMATCH.JSON,
		language: 'json/json',
		plugins: {
			['json']: jsonPlugin,
		},
	},
	// overrides for jsonc files
	{
		extends: [jsonPlugin.configs.recommended],
		files: [...EXTENSIONS_MINIMATCH.JSONC, '**/tsconfig.json', '.vscode/*.json'],
		language: 'json/jsonc',
		plugins: {
			['json']: jsonPlugin,
		},
	},
	// overrides for markdown files
	{
		extends: [markdownPlugin.configs.recommended],
		files: EXTENSIONS_MINIMATCH.Markdown,
		plugins: {
			// @ts-expect-error - markdown plugin currently not supporting eslint@10
			['markdown']: markdownPlugin,
		},
	},
	// overrides for Config files
	{
		files: ['eslint.config.js', 'oxfmt.config.ts', 'vitest.config.ts'],
		rules: {
			'import-x/no-default-export': 'off',
		},
	},
	// overrides for package.json files
	{
		extends: [
			packageJsonConfigs.recommended,
			packageJsonConfigs['recommended-publishable'],
			packageJsonConfigs.stylistic,
		],
		files: ['package.json'],
	},
	// prettier has to be the last extension
	configPrettier,
);
