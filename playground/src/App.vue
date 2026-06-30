<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { getReport, setOptions } from 'vue-render-scan'
import RenderPanel from './components/RenderPanel.vue'

const count = shallowRef(0)
const noisyValue = shallowRef(0)
const scannerEnabled = shallowRef(true)

const status = computed(() =>
  scannerEnabled.value ? 'scanner enabled' : 'scanner paused'
)

function increment() {
  count.value += 1
}

function noisyUpdate() {
  noisyValue.value = Math.round(Math.random() * 1000)
}

function toggleScanner() {
  scannerEnabled.value = !scannerEnabled.value
  setOptions({ enabled: scannerEnabled.value })
}

function printReport() {
  console.table(getReport())
}
</script>

<template>
  <main class="app-shell">
    <section class="hero">
      <p class="eyebrow">Vue Render Scan Playground</p>
      <h1 class="title">Click controls and watch redraws flash.</h1>
      <p class="subtitle">
        The local package is installed as a Vue plugin. Updates are highlighted on screen and logged in the browser console.
      </p>
    </section>

    <section class="controls" aria-label="Playground controls">
      <button class="button" type="button" @click="increment">
        Increment count
      </button>
      <button class="button" type="button" @click="noisyUpdate">
        Random noisy prop
      </button>
      <button class="button button-secondary" type="button" @click="toggleScanner">
        {{ status }}
      </button>
      <button class="button button-secondary" type="button" @click="printReport">
        Print report
      </button>
    </section>

    <RenderPanel :count="count" :noisy-value="noisyValue" />
  </main>
</template>
