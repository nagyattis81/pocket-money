import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import preferArrowPlugin from "eslint-plugin-prefer-arrow"
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
      "react-hooks": reactHooksPlugin,
      "prefer-arrow": preferArrowPlugin
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
        arrowParameter: true,
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
      "react-hooks/exhaustive-deps": "warn",

      // Csak arrow függvények (React named component export kivételével)
      "prefer-arrow/prefer-arrow-functions": ["error", {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
        allowStandaloneDeclarations: false
      }],
      "prefer-arrow-callback": "error",

      // Egyszerű return esetén nincs szükség { } -re
      "arrow-body-style": ["error", "as-needed"]
    }
  },
  // .tsx fájlokban (React komponensek) az explicit-function-return-type túl zajos
  // (handlerek, render függvények, useEffect callbackek) – csak az exportált
  // szimbólumokat ellenőrizzük az explicit-module-boundary-types szabállyal.
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off"
    }
  },
  prettierConfig
]
