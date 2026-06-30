import type { App, ComponentCustomProperties, ComponentInternalInstance } from 'vue'
import { getCurrentInstance, nextTick } from 'vue'
import { getComponentElement, getComponentName } from './dom'
import { createOverlay } from './overlay'
import { mergeOptions, resolveOptions, shouldTrackEvent } from './options'
import type {
  VueScanComponentFilter,
  VueScanHandle,
  VueScanOptions,
  VueScanReportEntry,
  VueScanRenderEvent,
  VueScanStats
} from './types'

const handles = new WeakMap<App, VueScanHandle>()
const startTimes = new WeakMap<ComponentInternalInstance, number>()
let activeHandle: VueScanHandle | undefined

export function scan(app: App, options: VueScanOptions = {}): VueScanHandle {
  const existing = handles.get(app)

  if (existing) {
    existing.setOptions(options)
    activeHandle = existing
    return existing
  }

  let currentOptions = resolveOptions(options)
  let stopped = false
  let eventCount = 0
  let lastEvent: VueScanRenderEvent | null = null
  const events: VueScanRenderEvent[] = []
  const renderListeners = new Set<{
    callback: (event: VueScanRenderEvent) => void
    filter: VueScanComponentFilter
  }>()
  const overlay = createOverlay()

  const getStats = (): VueScanStats => ({
    enabled: currentOptions.enabled,
    eventCount,
    lastEvent
  })

  const handle: VueScanHandle = {
    getOptions: () => currentOptions,
    getReport: () => buildReport(events),
    getStats,
    onRender: (filter, callback) => {
      const listener = { filter, callback }

      renderListeners.add(listener)

      return () => {
        renderListeners.delete(listener)
      }
    },
    setOptions: (nextOptions) => {
      currentOptions = mergeOptions(currentOptions, nextOptions)
      overlay.updateToolbar(getStats(), currentOptions)
    },
    stop: () => {
      stopped = true
      overlay.destroy()
      handles.delete(app)

      if (activeHandle === handle) {
        activeHandle = undefined
      }
    }
  }

  app.config.globalProperties.$vueScan = handle
  app.provide(VueScanKey, handle)

  app.mixin({
    beforeMount() {
      markStart(getCurrentInstance())
    },
    mounted() {
      trackLifecycle(getCurrentInstance(), 'mount')
    },
    beforeUpdate() {
      markStart(getCurrentInstance())
    },
    updated() {
      trackLifecycle(getCurrentInstance(), 'update')
    }
  })

  handles.set(app, handle)
  activeHandle = handle
  overlay.updateToolbar(getStats(), currentOptions)

  function markStart(instance: ComponentInternalInstance | null) {
    if (!instance || stopped || !currentOptions.enabled) return

    startTimes.set(instance, performance.now())
  }

  function trackLifecycle(
    instance: ComponentInternalInstance | null,
    type: VueScanRenderEvent['type']
  ) {
    if (!instance || stopped) return

    const start = startTimes.get(instance) ?? performance.now()
    const duration = performance.now() - start
    const event = createRenderEvent(app, instance, type, duration, eventCount + 1)

    if (!shouldTrackEvent(event, currentOptions)) return

    eventCount += 1
    lastEvent = event
    events.push(event)

    if (events.length > currentOptions.maxEvents) {
      events.splice(0, events.length - currentOptions.maxEvents)
    }

    currentOptions.onRender?.(event)
    notifyRenderListeners(renderListeners, event)

    if (currentOptions.log) {
      console.debug('[vue-render-scan]', event)
    }

    void nextTick(() => {
      overlay.flash(event, currentOptions)
      overlay.updateToolbar(getStats(), currentOptions)
    })
  }

  return handle
}

export const VueScanKey = Symbol('VueScan')

export function getVueScan(app: App): VueScanHandle | undefined {
  return handles.get(app)
}

export function getOptions() {
  return activeHandle?.getOptions()
}

export function getReport(): VueScanReportEntry[] {
  return activeHandle?.getReport() ?? []
}

export function getStats(): VueScanStats | undefined {
  return activeHandle?.getStats()
}

export function setOptions(options: VueScanOptions) {
  activeHandle?.setOptions(options)
}

export function onRender(
  filter: VueScanComponentFilter,
  callback: (event: VueScanRenderEvent) => void
): () => void {
  return activeHandle?.onRender(filter, callback) ?? (() => {})
}

function createRenderEvent(
  app: App,
  instance: ComponentInternalInstance,
  type: VueScanRenderEvent['type'],
  duration: number,
  count: number
): VueScanRenderEvent {
  return {
    app,
    componentName: getComponentName(instance),
    count,
    duration,
    element: getComponentElement(instance),
    instance,
    timestamp: performance.now(),
    type
  }
}

function notifyRenderListeners(
  listeners: Set<{
    callback: (event: VueScanRenderEvent) => void
    filter: VueScanComponentFilter
  }>,
  event: VueScanRenderEvent
) {
  for (const listener of listeners) {
    if (matchesRenderListener(listener.filter, event)) {
      listener.callback(event)
    }
  }
}

function matchesRenderListener(
  filter: VueScanComponentFilter,
  event: VueScanRenderEvent
): boolean {
  if (typeof filter === 'string') {
    return event.componentName === filter
  }

  if (filter instanceof RegExp) {
    return filter.test(event.componentName)
  }

  return filter(event)
}

function buildReport(events: VueScanRenderEvent[]): VueScanReportEntry[] {
  const grouped = new Map<string, VueScanReportEntry>()

  for (const event of events) {
    const existing = grouped.get(event.componentName)

    if (!existing) {
      grouped.set(event.componentName, {
        componentName: event.componentName,
        count: 1,
        totalDuration: event.duration,
        maxDuration: event.duration,
        averageDuration: event.duration,
        lastType: event.type,
        lastTimestamp: event.timestamp
      })
      continue
    }

    existing.count += 1
    existing.totalDuration += event.duration
    existing.maxDuration = Math.max(existing.maxDuration, event.duration)
    existing.averageDuration = existing.totalDuration / existing.count
    existing.lastType = event.type
    existing.lastTimestamp = event.timestamp
  }

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count)
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $vueScan?: VueScanHandle
  }
}
