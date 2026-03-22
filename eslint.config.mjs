import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import prettierConfig from "eslint-config-prettier"

export default [
  {
    ignores: ["build/**", "node_modules/**", ".plasmo/**"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      // TypeScript
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Kötelező típusok
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true
      }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/typedef": ["error", {
        arrowParameter: false,
        variableDeclaration: false,
        memberVariableDeclaration: true,
        parameter: true,
        propertyDeclaration: true
      }],

      // React
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  prettierConfig
]
