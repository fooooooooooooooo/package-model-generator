export type Vec3 = [number, number, number];

/**
 * Solid defined by
 *
 * - position: center of the solid
 * - size: width, length, height of the solid (z is up)
 */
export type Transform = {
  position: Vec3;
  size: Vec3;
};

export type Body = Transform & {
  type: 'body';
};

export type Pad = Transform & {
  type: 'pad';
};

export type Solid = Body | Pad;
