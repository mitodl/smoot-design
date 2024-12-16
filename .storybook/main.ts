import { StorybookConfig } from "@storybook/react-webpack5"
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin"

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],

  framework: "@storybook/react-webpack5",

  staticDirs: ["./public"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-swc",
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
