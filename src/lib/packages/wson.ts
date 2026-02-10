import { PAD_EXPOSURE_BOTTOM, PAD_EXPOSURE_SIDES, PAD_THICKNESS, offset } from '@/lib/packages';
import type { Pad, Solid } from '@/lib/types';

export type WSONConfig = {
  type: 'wson';

  body: {
    width: number;
    length: number;
    height: number;
  };

  pad_count_per_side: number;

  pad: {
    pitch: number;
    width: number;
    length: number;
  };

  epad:
    | { enabled: false }
    | {
        enabled: true;
        width: number;
        length: number;
      };
};

// default as microchip 8L_WSON_5x6_EZX_C04-0452A
export const DEFAULT_WSON_CONFIG: WSONConfig = {
  type: 'wson',

  body: {
    width: 5.0,
    length: 6.0,
    height: 0.75,
  },

  pad_count_per_side: 4,

  pad: {
    pitch: 1.27,
    width: 0.4,
    length: 0.6,
  },

  epad: {
    enabled: true,
    width: 3.4,
    length: 4.0,
  },
};

export function WSONToSolids(config: WSONConfig): Solid[] {
  const solids: Solid[] = [];

  // Body
  solids.push({
    type: 'body',
    position: [0, 0, config.body.height / 2 + PAD_EXPOSURE_BOTTOM],
    size: [config.body.width, config.body.length, config.body.height],
  });

  const padBase: Pad = {
    type: 'pad',
    position: [0, 0, PAD_THICKNESS / 2],
    size: [config.pad.width, config.pad.length, PAD_THICKNESS],
  };

  function padXOffset(i: number) {
    const totalPadWidth = (config.pad_count_per_side - 1) * config.pad.pitch;
    const startX = -totalPadWidth / 2;
    return startX + i * config.pad.pitch;
  }

  // offset pad so that the outer edge is flush with the body edge + pad exposure
  const halfPadLength = config.pad.length / 2;
  const leftSidePadY = -(config.body.length / 2 - halfPadLength + PAD_EXPOSURE_SIDES);
  const rightSidePadY = config.body.length / 2 - halfPadLength + PAD_EXPOSURE_SIDES;

  // Left side
  for (let i = 0; i < config.pad_count_per_side; i++) {
    solids.push(offset(padBase, [padXOffset(i), leftSidePadY, 0]));
  }

  // Right side
  for (let i = 0; i < config.pad_count_per_side; i++) {
    solids.push(offset(padBase, [padXOffset(i), rightSidePadY, 0]));
  }

  // EPAD
  if (config.epad.enabled) {
    solids.push({
      ...padBase,
      size: [config.epad.width, config.epad.length, PAD_THICKNESS],
    });
  }

  return solids;
}
