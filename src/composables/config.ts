import { defaultConfig, type PackageConfig } from '@/lib/packages';
import { useLocalStorage, useMagicKeys, useRefHistory, whenever, type UseRefHistoryReturn } from '@vueuse/core';
import type { Ref } from 'vue';

let config: Ref<PackageConfig> | null;
let history: UseRefHistoryReturn<PackageConfig, PackageConfig> | null;

export function useConfig() {
  if (config == null) {
    config = useLocalStorage<PackageConfig>('model-generator-package-config', defaultConfig('qfn'));
  }

  return config;
}

export function useHistory() {
  if (history == null) {
    history = useRefHistory(useConfig(), { deep: true });

    const { ctrl_z, ctrl_y } = useMagicKeys();
    whenever(ctrl_z!, history.undo);
    whenever(ctrl_y!, history.redo);
  }

  return history;
}
