import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  setupFilesAfterEnv: ["./jest-setup.ts"],
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|svg|jpg|jpeg|png)$": "<rootDir>/test-utils/filemock.js",
    "^rehype-raw$": "<rootDir>/test-utils/modulemock.js",
    "^react-markdown$": "<rootDir>/test-utils/modulemock.js",
  },
  rootDir: "./src",
}

export default config
