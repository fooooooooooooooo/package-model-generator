import { DEFAULT_QFN_CONFIG, QFNToSolids, type QFNConfig } from '@/lib/packages/qfn';
import { DEFAULT_WSON_CONFIG, WSONToSolids, type WSONConfig } from '@/lib/packages/wson';
import type { Solid, Vec3 } from '@/lib/types';

export type PackageConfig = QFNConfig | WSONConfig;

export function offset(solid: Solid, offset: Vec3): Solid {
  return {
    ...solid,
    position: [solid.position[0] + offset[0], solid.position[1] + offset[1], solid.position[2] + offset[2]],
  };
}

export function toSolids(config: PackageConfig): Solid[] {
  switch (config.type) {
    case 'qfn':
      return QFNToSolids(config);
    case 'wson':
      return WSONToSolids(config);
    default:
      return [];
  }
}

export function defaultConfig(type: PackageConfig['type']): PackageConfig {
  switch (type) {
    case 'qfn':
      return DEFAULT_QFN_CONFIG;
    case 'wson':
      return DEFAULT_WSON_CONFIG;
    default:
      throw new Error(`Unknown package type: ${type}`);
  }
}
