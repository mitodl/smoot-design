const fs = require("fs")
const path = require("path")
const package = require("../package.json")
const VERSION = package.version

// Define outputPath as an absolute path based on __dirname
const outputPath = path.resolve(__dirname, "../src/VERSION.ts")

// Update the file writing logic to use outputPath
const versionContent = `
/**
 * This file is auto-generated at build time.
 * Run node ./scripts/set_version.js to update the version.
 * Do not update this file manually.
 */
export const VERSION = "${VERSION}"
`
fs.writeFileSync(outputPath, versionContent, "utf8")
