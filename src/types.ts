import type { App, ComponentInternalInstance } from 'vue'

export type VueScanUpdateType = 'mount' | 'update'

export type VueScanComponentFilter =
  | string
  | RegExp
  | ((event: VueScanRenderEvent) => boolean)

export interface VueScanRenderEvent {
  app: App
  componentName: string
  count: number
  duration: number
  element: Element | null
  instance: ComponentInternalInstance
  timestamp: number
  type: VueScanUpdateType
}

export interface VueScanOptions {
  enabled?: boolean
  includeMounts?: boolean
  log?: boolean
  showToolbar?: boolean
  showOverlay?: boolean
  threshold?: number
  maxEvents?: number
  ignore?: VueScanComponentFilter[]
  only?: VueScanComponentFilter[]
  onRender?: (event: VueScanRenderEvent) => void
}

export interface VueScanResolvedOptions {
  enabled: boolean
  includeMounts: boolean
  log: boolean
  showToolbar: boolean
  showOverlay: boolean
  threshold: number
  maxEvents: number
  ignore: VueScanComponentFilter[]
  only: VueScanComponentFilter[]
  onRender?: (event: VueScanRenderEvent) => void
}

export interface VueScanStats {
  enabled: boolean
  eventCount: number
  lastEvent: VueScanRenderEvent | null
}

export interface VueScanReportEntry {
  componentName: string
  count: number
  totalDuration: number
  maxDuration: number
  averageDuration: number
  lastType: VueScanUpdateType
  lastTimestamp: number
}

export interface VueScanHandle {
  getOptions: () => VueScanResolvedOptions
  getReport: () => VueScanReportEntry[]
  getStats: () => VueScanStats
  onRender: (
    filter: VueScanComponentFilter,
    callback: (event: VueScanRenderEvent) => void
  ) => () => void
  setOptions: (options: VueScanOptions) => void
  stop: () => void
}
