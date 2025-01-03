import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  setupFilesAfterEnv: ["./jest-setup.ts"],
  testEnvironment: "<rootDir>/jsdom-extended.ts",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "\\.(svg|jpg|jpeg|png)$": "ol-test-utilities/filemocks/imagemock.js",
    "\\.(css|scss)$": "ol-test-utilities/filemocks/filemock.js",
  },
  rootDir: "./src",
}

export default config
