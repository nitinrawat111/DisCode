import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{cjs,mjs,cts,mts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      // Specify the react version explicitly to avoid auto-detection crash
      // See https://github.com/vercel/next.js/issues/89764#issuecomment-3928272828
      react: {
        version: "19",
      },
    },
    rules: {
      // Use the "jsx-runtime" config for React 17+ projects, which disables the "react/react-in-jsx-scope" rule
      // Reference: https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md#when-not-to-use-it
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  globalIgnores(["node_modules", "dist", "logs"]),
]);
