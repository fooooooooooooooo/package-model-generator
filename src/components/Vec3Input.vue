<script setup lang="ts">
import NumberInput from '@/components/NumberInput.vue';

const props = defineProps<{
  labels: [string, string, string];

  integer?: boolean;
  min?: number;
  max?: number;
  step?: number;
}>();

const x = defineModel('x', { type: Number, default: 0 });
const y = defineModel('y', { type: Number, default: 0 });
const z = defineModel('z', { type: Number, default: 0 });
</script>

<template>
  <div class="vec3-input">
    <label class="input">
      <span class="label-x">{{ props.labels[0] }}</span>
      <NumberInput :integer :min :max :step v-model="x" />
    </label>
    <label class="input">
      <span class="label-y">{{ props.labels[1] }}</span>
      <NumberInput :integer :min :max :step v-model="y" />
    </label>
    <label class="input">
      <span class="label-z">{{ props.labels[2] }}</span>
      <NumberInput :integer :min :max :step v-model="z" />
    </label>
  </div>
</template>

<style>
.vec3-input {
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

  .label-z {
    color: oklch(95% 0.14 254);
    background-color: oklch(60% 0.2 254);
  }
}
</style>
