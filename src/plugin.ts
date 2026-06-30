import type { App, Plugin } from 'vue'
import { scan } from './scan'
import type { VueScanOptions } from './types'

export function createVueScan(options: VueScanOptions = {}): Plugin {
  return {
    install(app: App) {
      scan(app, options)
    }
  }
}

export const VueScanPlugin = {
  install(app: App, options: VueScanOptions = {}) {
    scan(app, options)
  }
} satisfies Plugin
