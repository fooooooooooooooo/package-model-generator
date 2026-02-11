import { offset } from '@/lib/packages';
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

    exposure: number;
    thickness: number;
  };

  epad:
    | { enabled: false }
    | {
        enabled: true;
        width: number;
        length: number;
      };
};

// default as gigadevice GD25QxxxE
export const DEFAULT_WSON_CONFIG: WSONConfig = {
  type: 'wson',

  body: {
    width: 6.0,
    length: 8.0,
    height: 0.75,
  },

  pad_count_per_side: 4,

  pad: {
    pitch: 1.27,
    width: 0.4,
    length: 0.5,

    exposure: 0.02,
    thickness: 0.203,
  },

  epad: {
    enabled: true,
    width: 4.3,
    length: 3.4,
  },
};

export function WSONToSolids(config: WSONConfig): Solid[] {
  const solids: Solid[] = [];

  // Body
  solids.push({
    type: 'body',
    position: [0, 0, config.body.height / 2 + config.pad.exposure],
    size: [config.body.width, config.body.length, config.body.height],
  });

  const padBase: Pad = {
    type: 'pad',
    position: [0, 0, config.pad.thickness / 2 + config.pad.exposure / 2],
    size: [config.pad.width, config.pad.length + config.pad.exposure, config.pad.thickness + config.pad.exposure],
  };

  function padXOffset(i: number) {
    const totalPadWidth = (config.pad_count_per_side - 1) * config.pad.pitch;
    const startX = -totalPadWidth / 2;
    return startX + i * config.pad.pitch;
  }

  // offset pad so that the outer edge is flush with the body edge + pad exposure
  const halfPadLength = config.pad.length / 2;
  const leftSidePadY = -(config.body.length / 2 - halfPadLength + config.pad.exposure / 2);
  const rightSidePadY = config.body.length / 2 - halfPadLength + config.pad.exposure / 2;

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
      size: [config.epad.width, config.epad.length, config.pad.thickness + config.pad.exposure],
    });
  }

  return solids;
}

/**
 * With EPad: `WSON-{padCount}-1EP_{bodyWidth}x{bodyLength}mm_P{padPitch}mm_EP{epadWidth}x{epadLength}mm`
 *
 * Without EPad: `WSON-{padCount}_{bodyWidth}x{bodyLength}mm_P{padPitch}mm`
 *
 * `WSON-8-1EP_8x6mm_P1.27mm_EP3.4x4.3mm`
 */
export function WSONToName(config: WSONConfig): string {
  const padCount = config.pad_count_per_side * 2;
  const bodyAndPad = `${config.body.width}x${config.body.length}mm_P${config.pad.pitch}mm`;

  if (config.epad.enabled) {
    const epad = `EP${config.epad.width}x${config.epad.length}mm`;
    return `WSON-${padCount}-1EP_${bodyAndPad}_${epad}`;
  } else {
    return `WSON-${padCount}_${bodyAndPad}`;
  }
}
