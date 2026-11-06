import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Dependabot and release-please write long lines (tables, URLs) into bodies and footers.
		'body-max-line-length': [RuleConfigSeverity.Disabled],
		'footer-max-line-length': [RuleConfigSeverity.Disabled],
	},
};

export default config;
