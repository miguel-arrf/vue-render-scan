# Vue Render Scan

Visualize Vue component redraws while you develop. This is an early Vue/Nuxt equivalent of React Scan: it watches Vue component mount/update cycles and flashes the DOM bounds of components that redrew.

## Install

```sh
pnpm add -D vue-render-scan
```

## Vue

```ts
import { createApp } from 'vue'
import { VueScanPlugin } from 'vue-render-scan'
import App from './App.vue'

createApp(App)
  .use(VueScanPlugin, {
    enabled: import.meta.env.DEV,
    includeMounts: false
  })
  .mount('#app')
```

## Nuxt

```ts
export default defineNuxtConfig({
  modules: ['vue-render-scan/nuxt'],
  vueScan: {
    enabled: process.env.NODE_ENV !== 'production',
    includeMounts: false,
    threshold: 0
  }
})
```

## API

```ts
import { getReport, scan, setOptions } from 'vue-render-scan'

const handle = scan(app, {
  enabled: true,
  includeMounts: false,
  threshold: 1,
  ignore: [/RouterLink/],
  onRender(event) {
    console.log(event.componentName, event.type, event.duration)
  }
})

setOptions({ enabled: false })
getReport()
handle.getStats()
handle.stop()
```

## Development

```sh
npm test
npm run typecheck
npm run build
```

The test suite mounts real Vue apps in jsdom and verifies that component updates emit redraw events, respect filters, and update reports.

See [docs/development.md](docs/development.md) for the test fixture design, manual playground checks, and release flow.

## Releases

Releases are driven by git tags. Before tagging, update the changelog and bump the npm version locally:

```sh
# 1. Document the release manually.
$EDITOR CHANGELOG.md

# 2. Bump package.json and package-lock.json without creating a tag yet.
npm version patch --no-git-tag-version

# 3. Commit the changelog and version bump.
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): v0.1.1"

# 4. Tag the release commit with the exact package version.
git tag v0.1.1

# 5. Push the commit and tag.
git push origin main
git push origin main --tags
```

The release workflow verifies the tag matches the package version, runs tests, publishes to npm with provenance, and creates the GitHub release.

Before the first automated release, configure npm trusted publishing for this package with repository `miguel-arrf/vue-render-scan` and workflow `.github/workflows/release.yml`.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` in development | Turns scanning on or off. |
| `includeMounts` | `false` | Also show first mounts, not only updates. |
| `log` | `false` | Logs render events to the console. |
| `showToolbar` | `true` | Shows the floating status toolbar. |
| `showOverlay` | `true` | Flashes component bounds after redraws. |
| `threshold` | `0` | Minimum measured lifecycle duration in ms. |
| `maxEvents` | `250` | Reserved for event history consumers. |
| `ignore` | `[]` | Component name filters to suppress. |
| `only` | `[]` | Component name filters to exclusively track. |
| `onRender` | `undefined` | Callback for every tracked event. |

## Notes

This package uses Vue lifecycle hooks through a global mixin. It reports component updates that Vue exposes through `beforeUpdate` and `updated`, then measures the elapsed wall-clock time around that component lifecycle pair. That is useful for finding noisy redraws, but it is not a replacement for Vue Devtools flamegraphs or browser performance traces.

Install this before the root component mounts. It is dev-only by default and should stay disabled in production unless you explicitly need field diagnostics.
