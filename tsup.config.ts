import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'nuxt/module': 'src/nuxt/module.ts'
  },
  clean: true,
  dts: true,
  format: ['esm'],
  minify: false,
  outExtension: () => ({ js: '.mjs' }),
  sourcemap: true,
  splitting: false,
  external: ['vue', '@nuxt/kit', '#app']
})
