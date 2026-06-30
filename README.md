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
