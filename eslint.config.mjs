import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(eslint.configs.recommended, tseslint.configs.recommended, eslintConfigPrettier, {
	languageOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"sort-imports": [
			"error",
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				allowSeparatedGroups: false,
				memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
			},
		],
	},
});
