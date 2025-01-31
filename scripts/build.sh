#!/usr/bin/env bash
set -e -o pipefail

rm -rf dist &&
	rm -f .tsbuildinfo &&
	npm run build:esm &&
	npm run build:cjs &&
	npm run build:type-augmentation &&
	npm run build:static &&
	npm run build:bundles
