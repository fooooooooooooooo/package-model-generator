<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  labels: [string, string];

  min?: number;
  max?: number;
  step?: number;
}>();

const x = defineModel('x', { type: Number, default: 0 });
const y = defineModel('y', { type: Number, default: 0 });

const step = computed(() => props.step ?? 0.1);
</script>

<template>
  <div class="vec2-input">
    <label class="input">
      <span class="label-x">{{ props.labels[0] }}</span>
      <input type="number" :step="step" v-model.number="x" />
    </label>
    <label class="input">
      <span class="label-y">{{ props.labels[1] }}</span>
      <input type="number" :step="step" v-model.number="y" />
    </label>
  </div>
</template>

<style>
.vec2-input {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  .label-x {
    color: oklch(95% 0.16 22);
    background-color: oklch(60% 0.2 22);
  }

  .label-y {
    color: oklch(95% 0.15 163);
    background-color: oklch(60% 0.2 163);
  }
}
</style>
