<script setup lang="ts">
import NumberInput from '@/components/NumberInput.vue';
import Vec2Input from '@/components/Vec2Input.vue';
import Vec3Input from '@/components/Vec3Input.vue';
import type { WSONConfig } from '@/lib/packages/wson';

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
      :labels="['W', 'L', 'H']"
    />

    <h2>Pad</h2>
    <label class="dynamic-input">
      <span>Count</span>
      <NumberInput integer v-model="config.pad_count_per_side" />
    </label>
    <label class="dynamic-input">
      <span>Pitch</span>
      <NumberInput v-model="config.pad.pitch" />
    </label>
    <Vec2Input v-model:x="config.pad.width" v-model:y="config.pad.length" :labels="['W', 'L']" />
    <label class="dynamic-input">
      <span>Standoff</span>
      <NumberInput v-model="config.pad.standoff" />
    </label>
    <label class="dynamic-input">
      <span>Thickness</span>
      <NumberInput v-model="config.pad.thickness" />
    </label>

    <h2>EPAD</h2>
    <label class="input-label">
      <span>Enable</span>
      <input name="enable-epad" type="checkbox" v-model="config.epad.enabled" />
    </label>
    <Vec2Input
      v-if="config.epad.enabled"
      v-model:x="config.epad.width"
      v-model:y="config.epad.length"
      :labels="['X', 'Y']"
    />
  </form>
</template>
