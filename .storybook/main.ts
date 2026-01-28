import { StorybookConfig } from "@storybook/react-webpack5"
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import { exec as execCb } from "child_process"
import { promisify } from "util"
import * as fs from "fs"
import * as path from "path"

const exec = promisify(execCb)
const getGitSha = async (): Promise<string> => {
  const { stdout } = await exec("git rev-parse HEAD")
  return stdout.trim()
}
// We have postinstall hooks disabled, so ensure that MSW is initialized
const serviceWorkerPath = path.join(
  process.cwd(),
  "storybook-public",
  "mockServiceWorker.js",
)
if (!fs.existsSync(serviceWorkerPath)) {
  console.error(
    "mockServiceWorker.js not found at storybook-public/mockServiceWorker.js. Please run 'yarn msw init storybook-public' to initialize MSW.",
  )
  process.exit(1)
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],

  framework: "@storybook/react-webpack5",

  staticDirs: ["../storybook-public"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",
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
  env: async () => {
    return {
      STORYBOOK_GIT_SHA: await getGitSha(),
    }
  },
}

export default config
