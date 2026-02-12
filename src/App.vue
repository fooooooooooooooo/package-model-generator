<script setup lang="ts">
import QFN from '@/components/controls/QFN.vue';
import WSON from '@/components/controls/WSON.vue';
import { configToFreeCADScript } from '@/lib/freecad';
import { configTypeValid, defaultConfig, toName, type PackageConfig } from '@/lib/packages';
import { DEFAULT_WSON_CONFIG } from '@/lib/packages/wson';
import { createScene } from '@/lib/three';
import { useLocalStorage } from '@vueuse/core';
import { computed, onBeforeMount, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';

const container = useTemplateRef<HTMLDivElement>('container');

let scene: null | ReturnType<typeof createScene> = null;
const config = useLocalStorage<PackageConfig>('model-generator-package-config', DEFAULT_WSON_CONFIG);

function onPackageTypeChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const value = select.value;

  if (configTypeValid(value)) {
    config.value = defaultConfig(value);
  }
}

onBeforeMount(() => {
  // if url contains ?config=..., load config from url
  const urlParams = new URLSearchParams(window.location.search);
  const configParam = urlParams.get('config');
  if (configParam) {
    try {
      const decodedConfig = JSON.parse(atob(configParam));

      if (configTypeValid(decodedConfig.type)) {
        config.value = decodedConfig;
      } else {
        console.warn('Invalid config type in url, ignoring:', decodedConfig);
      }
    } catch (error) {
      console.error('Failed to load config from url:', error);
    }
  }
});

onMounted(() => {
  if (!container.value) return;
  scene = createScene(container.value);
  scene.updateModel(config.value);
});

watch(
  () => config.value,
  (newConfig) => {
    if (!scene) return;
    scene.updateModel(newConfig);
  },
  { deep: true }
);

type Status = 'default' | 'success' | 'error';
const copyUrlStatus = ref<Status>('default');
const copyJsonStatus = ref<Status>('default');
const copyScriptStatus = ref<Status>('default');

function withStatusReset(action: () => Promise<void>, statusRef: Ref<Status>) {
  return async () => {
    try {
      await action();
      statusRef.value = 'success';
    } catch (err) {
      statusRef.value = 'error';
    } finally {
      setTimeout(() => {
        statusRef.value = 'default';
      }, 2000);
    }
  };
}

function copyConfigUrl() {
  withStatusReset(async () => {
    const encodedConfig = btoa(JSON.stringify(config.value));
    const url = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;

    console.info('Copying URL to clipboard:', url);

    navigator.clipboard.writeText(url).then(
      () => {},
      (err) => {
        console.error('Could not copy URL: ', err);
        throw err;
      }
    );
  }, copyUrlStatus)();
}

function copyConfigJson() {
  withStatusReset(async () => {
    const json = JSON.stringify(config.value, null, 2);

    console.info('Copying JSON to clipboard:', json);

    navigator.clipboard.writeText(json).then(
      () => {},
      (err) => {
        console.error('Could not copy JSON: ', err);
        throw err;
      }
    );
  }, copyJsonStatus)();
}

function copyScript() {
  withStatusReset(async () => {
    if (!scene) return;

    const script = configToFreeCADScript(config.value);

    console.info('Copying FreeCAD script to clipboard:', script);

    navigator.clipboard.writeText(script).then(
      () => {},
      (err) => {
        console.error('Could not copy script: ', err);
        throw err;
      }
    );
  }, copyScriptStatus)();
}

const importJsonText = ref('');
const importJsonStatus = ref<Status>('default');

function importJson() {
  withStatusReset(async () => {
    try {
      const parsedConfig = JSON.parse(importJsonText.value);
      if (configTypeValid(parsedConfig.type)) {
        config.value = parsedConfig;
      } else {
        console.warn('Invalid config type in imported JSON, ignoring:', parsedConfig);
        throw new Error('Invalid config type');
      }
    } catch (err) {
      console.error('Failed to import JSON:', err);
      throw err;
    }
  }, importJsonStatus)();
}

function reset() {
  console.info('Config before reset:', config.value);

  if (configTypeValid(config.value.type)) {
    console.info('Resetting config to default for type:', config.value.type);
    config.value = defaultConfig(config.value.type);
  } else {
    console.warn('Invalid config type, resetting to default QFN config:', config.value.type);
    config.value = defaultConfig('qfn');
  }
}

const name = computed(() => toName(config.value));
</script>

<template>
  <div ref="container" class="w-full h-full"></div>
  <aside class="controls">
    <label class="input-label">
      <span>Package Type</span>
      <select @change="onPackageTypeChange" :value="config.type">
        <option value="qfn">QFN</option>
        <option value="wson">WSON</option>
      </select>
    </label>

    <WSON v-if="config.type === 'wson'" :config="config" />
    <QFN v-else-if="config.type === 'qfn'" :config="config" />

    <h2>{{ name }}</h2>

    <h2>Export</h2>
    <div>
      <button @click="copyConfigUrl" :status="copyUrlStatus">Copy URL</button>
      <button @click="copyConfigJson" :status="copyJsonStatus">Copy JSON</button>
      <button @click="copyScript" :status="copyScriptStatus">Copy FreeCAD Script</button>
    </div>

    <h2>Import</h2>
    <div>
      <label class="input-label col">
        <span>JSON</span>
        <textarea v-model="importJsonText" class="text-mono"></textarea>
      </label>
      <button @click="importJson" :status="importJsonStatus">Import</button>
    </div>

    <button @click="reset">Reset</button>
  </aside>
</template>

<style>
.controls {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background: #121212ee;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  > form,
  > div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: normal;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }

  button[status] {
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }

  button[status='error'] {
    border-color: oklch(60% 0.23 25);
  }

  button[status='success'] {
    border-color: oklch(60% 0.23 143);
  }
}
</style>
