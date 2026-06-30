<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  count: number
  noisyValue: number
}>()

const derivedLabel = computed(() =>
  props.count % 2 === 0 ? 'even update path' : 'odd update path'
)
</script>

<template>
  <section class="render-panel">
    <div class="metric">
      <span class="metric-label">Count</span>
      <strong class="metric-value">{{ count }}</strong>
    </div>
    <div class="metric">
      <span class="metric-label">Noisy prop</span>
      <strong class="metric-value">{{ noisyValue }}</strong>
    </div>
    <p class="derived-label">{{ derivedLabel }}</p>
  </section>
</template>

<style scoped>
.render-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: min(720px, 100%);
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
}

.metric {
  min-width: 0;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  padding: 14px;
}

.metric-label {
  display: block;
  color: #5f6b7a;
  font-size: 13px;
}

.metric-value {
  display: block;
  margin-top: 6px;
  color: #111827;
  font-size: 34px;
  line-height: 1;
}

.derived-label {
  grid-column: 1 / -1;
  margin: 0;
  color: #354152;
}

@media (max-width: 640px) {
  .render-panel {
    grid-template-columns: 1fr;
  }
}
</style>
