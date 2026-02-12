<script setup lang="ts">
import { useHistory } from '@/composables/config';
import { useEventListener } from '@vueuse/core';
import { onBeforeUnmount, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    integer?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  {
    integer: false,
    step: 0.01,
    min: 0.01,
  },
);

const modelValue = defineModel<number>({ default: 0 });

const { pause, resume, commit } = useHistory();

function getStep(e: { ctrlKey: boolean; shiftKey: boolean }) {
  if (props.integer && e.ctrlKey) return 10;
  if (props.integer) return 1;
  if (e.ctrlKey) return props.step * 10;
  if (e.shiftKey) return props.step * 0.1;
  return props.step;
}

function clamp(value: number) {
  let v = value;
  if (props.min != null) v = Math.max(props.min, v);
  if (props.max != null) v = Math.min(props.max, v);
  return v;
}

function round(value: number) {
  if (props.integer) return Math.round(value);
  // Round to avoid floating point drift
  return Math.round(value * 1e10) / 1e10;
}

// arrow keys

let arrowHeld = false;

function onKeyDown(e: KeyboardEvent) {
  // if modifier pressed, reset drag start to avoid jumping
  if (isDragging.value && (e.ctrlKey || e.shiftKey)) {
    dragStartX = dragCurrentX;
    dragStartValue = modelValue.value;
  }

  if (e.ctrlKey && (e.key === 'z' || e.key === 'y')) {
    e.preventDefault();
    return;
  }
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();

  const step = getStep(e);
  const direction = e.key === 'ArrowUp' ? 1 : -1;

  if (!arrowHeld) {
    arrowHeld = true;
    pause();
  }

  modelValue.value = clamp(round(modelValue.value + step * direction));
}

function onKeyUp(e: KeyboardEvent) {
  // if modifier released, reset drag start to avoid jumping
  if (isDragging.value && !(e.ctrlKey || e.shiftKey)) {
    dragStartX = dragCurrentX;
    dragStartValue = modelValue.value;
  }

  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  if (!arrowHeld) return;

  arrowHeld = false;
  resume();
  commit();
}

function onBlur() {
  if (arrowHeld) {
    arrowHeld = false;
    resume();
    commit();
  }
}

// horizontal drag

const isDragging = ref(false);
const moved = ref(false);
// todo: maybe just store last position instead of resetting when modifiers are pressed
let dragStartX = 0;
let dragCurrentX = 0;
let dragStartValue = 0;
let dragStep = 0;

let pointerMoveCleanup = () => {};
let pointerUpCleanup = () => {};

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return;

  isDragging.value = true;
  dragStartX = e.clientX;
  dragStartValue = modelValue.value;
  dragStep = getStep(e);

  pause();

  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  pointerMoveCleanup = useEventListener('pointermove', onPointerMove);
  pointerUpCleanup = useEventListener('pointerup', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return;

  const step = getStep(e);
  dragCurrentX = e.clientX;
  const dx = dragCurrentX - dragStartX;
  const delta = Math.round(dx / 4) * step;

  modelValue.value = clamp(round(dragStartValue + delta));
  moved.value = true;
}

function onPointerUp(_e: PointerEvent) {
  if (!isDragging.value) return;

  isDragging.value = false;
  moved.value = false;
  resume();
  commit();

  pointerMoveCleanup();
  pointerUpCleanup();
}

onBeforeUnmount(() => {
  if (arrowHeld) {
    arrowHeld = false;
    resume();
    commit();
  }
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = parseFloat(target.value);
  if (!isNaN(value)) {
    modelValue.value = clamp(value);
  }
}
</script>

<template>
  <input
    type="number"
    :min
    :max
    :step="dragStep"
    :value="modelValue"
    :style="{ cursor: isDragging && moved ? 'ew-resize' : undefined }"
    @input="onInput"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @blur="onBlur"
    @pointerdown="onPointerDown"
  />
</template>
