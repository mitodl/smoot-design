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
  },
  rootDir: "./src",
}

export default config
