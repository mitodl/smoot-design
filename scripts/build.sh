#!/usr/bin/env bash
set -e -o pipefail

rm -rf dist &&
	rm -f .tsbuildinfo &&
	node ./scripts/set_version.js &&
	npm run build:esm &&
	npm run build:cjs &&
	npm run build:type-augmentation &&
	npm run build:bundles &&
	npm run build:bundles:legacy
