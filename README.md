# smoot-design

Design system components for MITODL Projects

## Development and Release

All PR titles and commits to `main` should use the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format. During release, the types of commits included since the last release inform what sort of version bump should be made. For example, bugfixes yield a new patch version, whereas breaking changes trigger a major version bump.

To trigger a release, run the "Release" github action. Using [semantic-release](https://semantic-release.gitbook.io/semantic-release), this action will:

1. Inspect the commit history since previous release for [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) an
2. Determine whether the version bump should be major, minor, or patch based on commit types. Breaking changes (e.g., `feat!: remove Button variant 'outlined'`) will result in major version bumps.
3. Publish the package to NPM and the repository's [Github Releases](https://github.com/mitodl/smoot-design/releases).
