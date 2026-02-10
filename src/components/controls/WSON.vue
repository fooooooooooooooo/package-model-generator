<script setup lang="ts">
import type { WSONConfig } from '@/lib/packages/wson';
import Vec2Input from '@/components/Vec2Input.vue';
import Vec3Input from '@/components/Vec3Input.vue';

const props = defineProps<{
  config: WSONConfig;
}>();
</script>

<template>
  <form>
    <h2>Body</h2>
    <Vec3Input
      v-model:x="config.body.width"
      v-model:y="config.body.length"
      v-model:z="config.body.height"
      :labels="['W', 'L', 'H']" />

    <h2>Pad</h2>
    <label class="dynamic-input">
      <span>Count</span>
      <input type="number" step="1" min="0" v-model.number="config.pad_count_per_side" />
    </label>
    <label class="dynamic-input">
      <span>Pitch</span>
      <input type="number" step="0.01" min="0" v-model.number="config.pad.pitch" />
    </label>
    <Vec2Input v-model:x="config.pad.width" v-model:y="config.pad.length" :labels="['W', 'L']" />

    <h2>EPAD</h2>
    <label class="input-label">
      <span>Enable</span>
      <input name="enable-epad" type="checkbox" v-model="config.epad.enabled" />
    </label>
    <Vec2Input
      v-if="config.epad.enabled"
      v-model:x="config.epad.width"
      v-model:y="config.epad.length"
      :min="0"
      :labels="['X', 'Y']" />
  </form>
</template>
