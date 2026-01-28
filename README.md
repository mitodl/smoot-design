# @mitodl/smoot-design

Design system components for MITODL Projects

![NPM Version](https://img.shields.io/npm/v/@mitodl/smoot-design)

![NPM Last Update](https://img.shields.io/npm/last-update/@mitodl/smoot-design?label=npm+last+update)

![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/@mitodl/smoot-design)

![GitHub branch status](https://img.shields.io/github/checks-status/mitodl/smoot-design/main)

## Development and Release

All PR titles and commits to `main` should use the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format. During release, the types of commits included since the last release inform what sort of version bump should be made. For example, bugfixes yield a new patch version, whereas breaking changes trigger a major version bump.

To trigger a release, use the "Releases (Semantic & Pre-release)" github action (`release.md`). This action will perform a semantic release or pre-release based on `release-type` input.

**Pre-releases:** The action will (1) publish the latest commit on specified branch to NPM, with a version `v0.0.0-<git-short-sha>`, e.g., `v0.0.0-7bc0c0f`; and (2) leave a comment on the branch's PR indicating releaseed version number, if such a PR is open.

**Semantic Release:** The action will:

1. Inspect the commit history since previous release for [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) an
2. Determine whether the version bump should be major, minor, or patch based on commit types. Breaking changes (e.g., `feat!: remove Button variant 'outlined'`) will result in major version bumps.
3. Publish the package to NPM and the repository's [Github Releases](https://github.com/mitodl/smoot-design/releases).

## Installation

Ensure `peerDependencies` are installed as well. See [`package.json`](./package.json).

## Documentation

Documentation for `smoot-design` components is available at https://mitodl.github.io/smoot-design.

### Storybook

Components in `smoot-design` are documented using Storybook's [autodocs](https://storybook.js.org/docs/writing-docs/autodocs) feature.

Autodocs _should_ infer props and comments from Typescript + JSDoc comments. However, autodocs can be a bit finnicky. Tips:

- **Filename should match Component Name:** If you're documenting `Button`, it must be exported from a file called `Button.tsx`.
- **Component `displayName`:** Some components may need an explicit `displayName`, this can be set by `Button.displayName="Button"`.
  - _React component display names are not visible to end users; they are used in React's Dev Tools. React automatically adds display names for most components while transpiling, but autodocs uses un-transpiled code to generate documentation._
