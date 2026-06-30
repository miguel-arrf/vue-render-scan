import { addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import type { VueScanOptions } from '../types'

export interface ModuleOptions extends VueScanOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-render-scan',
    configKey: 'vueScan'
  },
  defaults: {
    enabled: process.env.NODE_ENV !== 'production',
    includeMounts: false,
    showOverlay: true,
    showToolbar: true
  },
  setup(options: ModuleOptions) {
    addPluginTemplate({
      filename: 'vue-render-scan.client.mjs',
      getContents: () => `
import { defineNuxtPlugin } from '#app'
import { scan } from 'vue-render-scan'

export default defineNuxtPlugin((nuxtApp) => {
  scan(nuxtApp.vueApp, ${JSON.stringify(options)})
})
`
    })
  }
})
