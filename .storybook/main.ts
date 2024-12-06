import { join, dirname } from "path"
import { StorybookConfig } from "@storybook/react-webpack5"
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin"

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")))
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],

  framework: "@storybook/react-webpack5",

  staticDirs: ["./public"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-webpack5-compiler-swc"),
  ],

  webpackFinal: async (config) => {
    if (!config?.resolve) {
      throw new Error("Expected config.resolve to be defined")
    }
    config.resolve.plugins = [new TsconfigPathsPlugin()]
    return config
  },

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
}

export default config
