import { offset } from '@/lib/packages';
import type { Pad, Solid } from '@/lib/types';

export type QFNConfig = {
  type: 'qfn';

  body: {
    width: number;
    length: number;
    height: number;
  };

  pad_count: {
    x: number;
    y: number;
  };

  pad: {
    pitch: number;
    width: number;
    length: number;

    standoff: number;
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

// default as nordic semiconductor nrf52832
export const DEFAULT_QFN_CONFIG: QFNConfig = {
  type: 'qfn',

  body: {
    width: 6.0,
    length: 6.0,
    height: 0.85,
  },

  pad_count: {
    x: 12,
    y: 12,
  },

  pad: {
    pitch: 0.4,
    width: 0.2,
    length: 0.4,

    standoff: 0.02,
    thickness: 0.2,
  },

  epad: {
    enabled: true,
    width: 4.6,
    length: 4.6,
  },
};

export function QFNToSolids(config: QFNConfig): Solid[] {
  const solids: Solid[] = [];

  // Body
  solids.push({
    type: 'body',
    position: [0, 0, config.body.height / 2 + config.pad.standoff],
    size: [config.body.width, config.body.length, config.body.height],
  });

  const padBase: Pad = {
    type: 'pad',
    position: [0, 0, config.pad.thickness / 2 + config.pad.standoff / 2],
    size: [0, 0, 0],
  };

  const padBaseX: Pad = {
    ...padBase,
    size: [config.pad.width, config.pad.length + config.pad.standoff, config.pad.thickness + config.pad.standoff],
  };

  const padBaseY: Pad = {
    ...padBase,
    size: [config.pad.length + config.pad.standoff, config.pad.width, config.pad.thickness + config.pad.standoff],
  };

  const leftPadY = -(config.body.width / 2 - config.pad.length / 2 + config.pad.standoff / 2);
  const rightPadY = -leftPadY;

  function padOffsetHorizontal(i: number, count: number) {
    return (i - (count - 1) / 2) * config.pad.pitch;
  }

  // left and right pads
  for (let i = 0; i < config.pad_count.x; i++) {
    const offsetX = padOffsetHorizontal(i, config.pad_count.x);
    solids.push(offset(padBaseX, [offsetX, leftPadY, 0]));
    solids.push(offset(padBaseX, [offsetX, rightPadY, 0]));
  }

  const topPadX = -(config.body.length / 2 - config.pad.length / 2 + config.pad.standoff / 2);
  const bottomPadX = -topPadX;

  // top and bottom pads
  for (let i = 0; i < config.pad_count.y; i++) {
    const offsetY = padOffsetHorizontal(i, config.pad_count.y);
    solids.push(offset(padBaseY, [topPadX, offsetY, 0]));
    solids.push(offset(padBaseY, [bottomPadX, offsetY, 0]));
  }

  if (config.epad.enabled) {
    solids.push({
      ...padBase,
      size: [config.epad.width, config.epad.length, config.pad.thickness + config.pad.standoff],
    });
  }

  return solids;
}

/**
 * With EPad: `QFN-{padCount}-1EP_{bodyWidth}x{bodyLength}mm_P{padPitch}mm_EP{epadWidth}x{epadLength}mm`
 *
 * Without EPad: `QFN-{padCount}_{bodyWidth}x{bodyLength}mm_P{padPitch}mm`
 *
 * `QFN-44-1EP_6x6mm_P0.4mm_EP4.6x4.6mm`
 */
export function QFNToName(config: QFNConfig): string {
  const padCount = 2 * (config.pad_count.x + config.pad_count.y);
  const bodyAndPad = `${config.body.width}x${config.body.length}mm_P${config.pad.pitch}mm`;

  if (config.epad.enabled) {
    const epad = `EP${config.epad.width}x${config.epad.length}mm`;
    return `QFN-${padCount}-1EP_${bodyAndPad}_${epad}`;
  } else {
    return `QFN-${padCount}_${bodyAndPad}`;
  }
}
