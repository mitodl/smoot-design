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
 *
 * NOTES:
 * - In development, VERSION will always be "0.0.0"
 * - The version should not simply be imported from package.json. This would
 *   result in all of the package.json being included in the bundled code, which
 *   is not desired.
 */
export const VERSION = "${VERSION}"
`
fs.writeFileSync(outputPath, versionContent, "utf8")
