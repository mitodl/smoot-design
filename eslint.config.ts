import { FlatCompat } from "@eslint/eslintrc"
import path from "path"
import { fileURLToPath } from "url"
import styledComponentsA11y from "eslint-plugin-styled-components-a11y"
import importPlugin from "eslint-plugin-import"
import * as mdxPlugin from "eslint-plugin-mdx"
import testingLibraryPlugin from "eslint-plugin-testing-library"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {},
})

const restrictedImports = ({ paths = [], patterns = [] } = {}) => ({
  "@typescript-eslint/no-restricted-imports": [
    "error",
    {
      paths: [
        /**
         * No direct imports from large "barrel files". They make Jest slow.
         *
         * For more, see:
         *  - https://github.com/jestjs/jest/issues/11234
         *  - https://github.com/faker-js/faker/issues/1114#issuecomment-1169532948
         */
        {
          name: "@faker-js/faker",
          message: "Please use @faker-js/faker/locale/en instead.",
          allowTypeImports: true,
        },
        {
          name: "@mui/material",
          message: "Please use @mui/material/<COMPONENT_NAME> instead.",
          allowTypeImports: true,
        },
        ...paths,
      ],
      patterns: [...patterns],
    },
  ],
})

export default [
  // Global ignores
  {
    ignores: ["**/build/**"],
  },

  // Convert legacy configs to flat config - apply to all files
  ...compat.extends("eslint-config-mitodl"),
  ...compat.extends("eslint-config-prettier"),

  // Base configuration for all files
  {
    files: ["**/*.{js,jsx,ts,tsx,mdx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "styled-components-a11y": styledComponentsA11y,
      import: importPlugin,
      mdx: mdxPlugin,
      "testing-library": testingLibraryPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      "jsx-a11y": {
        components: {
          "ListCard.Image": "img",
          "Card.Image": "img",
          Button: "button",
          ButtonLink: "a",
          ActionButton: "button",
          ActionButtonLink: "a",
        },
      },
    },
    rules: {
      ...restrictedImports(),
      "react/display-name": [2, {}],
      // This rule is disabled in the default a11y config, but unclear why.
      // It does catch useful errors, e.g., buttons with no text or label.
      // If it proves to be flaky, we can find other ways to check for this.
      // We need both rules below. One for normal elements, one for styled
      "jsx-a11y/control-has-associated-label": ["error"],
      "styled-components-a11y/control-has-associated-label": ["error"],
      "@typescript-eslint/triple-slash-reference": [
        "error",
        {
          path: "never",
          types: "prefer-import",
          lib: "never",
        },
      ],
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/src/setupJest.ts",
            "**/jest-setup.ts",
            "**/jsdom-extended.ts",
            "**/test-utils/**",
            "**/test-utils/**",
            "**/webpack.config.js",
            "**/webpack.exports.js",
            "**/postcss.config.js",
            "**/*.stories.ts",
            "**/*.stories.tsx",
            "**/*.mdx",
            "vite.config.mts",
            ".storybook/**",
          ],
        },
      ],
      "import/no-duplicates": "error",
      quotes: ["error", "double", { avoidEscape: true }],
      "no-restricted-syntax": [
        "error",
        /**
         * See https://eslint.org/docs/latest/rules/no-restricted-syntax
         *
         * The selectors use "ES Query", a css-like syntax for AST querying. A
         * useful tool is  https://estools.github.io/esquery/
         */
        {
          selector:
            "Property[key.name=fontWeight][value.raw=/\\d+/], TemplateElement[value.raw=/font-weight: \\d+/]",
          message:
            "Do not specify `fontWeight` manually. Prefer spreading `theme.typography.subtitle1` or similar. If you MUST use a fontWeight, refer to `fontWeights` theme object.",
        },
        {
          selector:
            "Property[key.name=fontFamily][value.raw=/Neue Haas/], TemplateElement[value.raw=/Neue Haas/]",
          message:
            "Do not specify `fontFamily` manually. Prefer spreading `theme.typography.subtitle1` or similar. If using neue-haas-grotesk-text, this is ThemeProvider's default fontFamily.",
        },
      ],
    },
  },

  // Test files configuration
  {
    files: ["./**/*.test.{ts,tsx}"],
    ...compat.extends("eslint-config-mitodl/jest")[0],
    plugins: {
      "testing-library": testingLibraryPlugin,
    },
    rules: {
      "testing-library/no-node-access": "off",
    },
  },
]
