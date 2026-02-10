import type { QFNConfig } from '@/lib/packages/qfn';
import type { WSONConfig } from '@/lib/packages/wson';
import type { Solid, Vec3 } from '@/lib/types';

export type PackageConfig = QFNConfig | WSONConfig;

// amount of pad exposed beyond body bottom
export const PAD_EXPOSURE_BOTTOM = 0.05;
// amount of pad exposed on body sides
export const PAD_EXPOSURE_SIDES = 0.01;
// thickness of pad
export const PAD_THICKNESS = 0.1;

export function offset(solid: Solid, offset: Vec3): Solid {
  return {
    ...solid,
    position: [solid.position[0] + offset[0], solid.position[1] + offset[1], solid.position[2] + offset[2]],
  };
}
