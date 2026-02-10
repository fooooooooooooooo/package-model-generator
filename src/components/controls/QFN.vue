<script setup lang="ts">
import Vec2Input from '@/components/Vec2Input.vue';
import Vec3Input from '@/components/Vec3Input.vue';
import type { QFNConfig } from '@/lib/packages/qfn';

const props = defineProps<{
  config: QFNConfig;
}>();
</script>

<template>
  <form>
    <h2>Body</h2>
    <Vec3Input :v-bind="config.body.width" :y="config.body.length" :z="config.body.height" :labels="['W', 'L', 'H']" />

    <h2>Pad</h2>
    <label class="input-label">
      <span>Count</span>
      <Vec2Input :x="config.pad_count.x" :y="config.pad_count.y" :labels="['X', 'Y']" />
    </label>
    <label class="dynamic-input">
      <span>Pitch</span>
      <input type="number" step="0.01" min="0" v-model.number="config.pad.pitch" />
    </label>
    <Vec2Input :x="config.pad.width" :y="config.pad.length" :labels="['W', 'L']" />
    <label class="dynamic-input">
      <span>Exposure</span>
      <input type="number" step="0.01" min="0" v-model.number="config.pad.exposure" />
    </label>
    <label class="dynamic-input">
      <span>Thickness</span>
      <input type="number" step="0.01" min="0" v-model.number="config.pad.thickness" />
    </label>

    <h2>EPAD</h2>
    <label class="input-label">
      <span>Enable</span>
      <input name="enable-epad" type="checkbox" v-model="config.epad.enabled" />
    </label>
    <Vec2Input
      v-if="config.epad.enabled"
      :x="config.epad.width"
      :y="config.epad.length"
      :min="0"
      :labels="['X', 'Y']" />
  </form>
</template>
