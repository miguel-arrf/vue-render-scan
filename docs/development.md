# Development

## Setup

Install dependencies from the repository root:

```sh
npm install
```

Run the local checks:

```sh
npm test
npm run typecheck
npm run build
```

Use the playground for manual browser testing:

```sh
npm run build
npm run playground
```

Open the printed local URL and interact with the page. The toolbar and component highlight overlay should appear when Vue components update.

## Test Suite

The test suite lives in `tests/scan.test.ts` and runs with Vitest in jsdom.

The tests intentionally mount real Vue apps instead of mocking lifecycle hooks. The fixture installs `scan(app, options)` before mounting, then updates a reactive prop passed to `TrackedChild`. That causes Vue to run its normal update lifecycle, which lets the scanner observe the same events it receives in a real application.

Current coverage verifies:

- update rerender detection
- optional mount detection
- disabled scanner behavior
- `ignore` and `only` filters
- `getStats()` and `getReport()`
- handle-level `onRender()` listeners

Run tests with:

```sh
npm test
```

## Development Flow

For scanner changes, prefer this loop:

1. Add or update a focused test in `tests/scan.test.ts`.
2. Run `npm test` and confirm the test fails for the expected reason.
3. Change the implementation in `src/`.
4. Run `npm test`, `npm run typecheck`, and `npm run build`.
5. Test manually in the playground when the change affects overlay behavior.

The overlay is not pixel-tested yet. If you change visual behavior, use the playground to verify that the toolbar and highlight boxes still appear, fade, and avoid blocking page interaction.

## Release Flow

Releases are tag-driven. Before tagging, update the changelog manually and bump the package version:

```sh
$EDITOR CHANGELOG.md
npm version patch --no-git-tag-version
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): v0.1.1"
git tag v0.1.1
git push origin main
git push origin main --tags
```

The GitHub Actions release workflow verifies that the tag matches `package.json`, runs checks, publishes to npm with provenance, and creates or updates the matching GitHub release.

Before using automated releases, npm trusted publishing must be configured for:

- repository: `miguel-arrf/vue-render-scan`
- workflow: `.github/workflows/release.yml`
- allowed action: npm publish
