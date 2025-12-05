import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import turboConfig from "eslint-config-turbo/flat";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";
import preferArrow from "eslint-plugin-prefer-arrow";
import globals from "globals";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...turboConfig,
  js.configs.recommended,
  ...ts.configs.recommended,

  // React
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  // Next.js and Hooks
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // Prettier
  ...compat.extends("prettier"),

  // Custom Rules and Overrides
  {
    ignores: ["**/public/**", "**/dist/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "prefer-arrow": preferArrow,
    },
    rules: {
      // ESLint overrides
      "no-unused-vars": "off", // Typescript plugin handles this
      "no-undef": "error",

      // Typescript overrides
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React overrides
      "react/jsx-uses-react": "warn",
      "react/jsx-uses-vars": "warn",
      "react/react-in-jsx-scope": "off", // Causes too many false positives
      "react/function-component-definition": [
        "warn",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],

      // React hooks overrides
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility overrides
      // "jsx-a11y/click-events-have-key-events": "off", // Requires jsx-a11y plugin
      // "jsx-a11y/label-has-associated-control": "warn",

      // Turbo overrides
      "turbo/no-undeclared-env-vars": [
        "error",
        { allowList: ["^ENV_[A-Z]+$"] },
      ],

      // Prefer-arrow overrides
      "prefer-arrow/prefer-arrow-functions": [
        "warn",
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // Prefer concise arrow functions for simple returns
      "arrow-body-style": ["warn", "as-needed"],
      "prefer-arrow-callback": ["warn", { allowNamedFunctions: false }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

export default eslintConfig;
