import type {
  VueScanComponentFilter,
  VueScanOptions,
  VueScanRenderEvent,
  VueScanResolvedOptions
} from './types'

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'

export const defaultOptions: VueScanResolvedOptions = {
  enabled: !isProduction,
  includeMounts: false,
  log: false,
  showToolbar: true,
  showOverlay: true,
  threshold: 0,
  maxEvents: 250,
  ignore: [],
  only: []
}

export function resolveOptions(options: VueScanOptions = {}): VueScanResolvedOptions {
  return {
    ...defaultOptions,
    ...options,
    ignore: options.ignore ?? defaultOptions.ignore,
    only: options.only ?? defaultOptions.only
  }
}

export function mergeOptions(
  current: VueScanResolvedOptions,
  next: VueScanOptions
): VueScanResolvedOptions {
  return {
    ...current,
    ...next,
    ignore: next.ignore ?? current.ignore,
    only: next.only ?? current.only
  }
}

export function shouldTrackEvent(
  event: VueScanRenderEvent,
  options: VueScanResolvedOptions
): boolean {
  if (!options.enabled) return false
  if (event.type === 'mount' && !options.includeMounts) return false
  if (event.duration < options.threshold) return false
  if (options.only.length > 0 && !options.only.some((filter) => matchesFilter(filter, event))) {
    return false
  }

  return !options.ignore.some((filter) => matchesFilter(filter, event))
}

function matchesFilter(filter: VueScanComponentFilter, event: VueScanRenderEvent): boolean {
  if (typeof filter === 'string') {
    return event.componentName === filter
  }

  if (filter instanceof RegExp) {
    return filter.test(event.componentName)
  }

  return filter(event)
}
