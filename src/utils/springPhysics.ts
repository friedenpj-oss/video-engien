export interface SpringConfig {
  damping: number; // default ~20
  mass: number; // default ~1
  stiffness: number; // default ~100
}

/**
 * Calculates a spring animation value from 0 to 1 matching Remotion's spring physics.
 */
export function calculateSpring(options: {
  frame: number;
  fps: number;
  config?: Partial<SpringConfig>;
  from?: number;
  to?: number;
}): number {
  const { frame, fps, config = {}, from = 0, to = 1 } = options;

  if (frame <= 0) return from;

  const m = config.mass ?? 1;
  const k = config.stiffness ?? 100;
  const c = config.damping ?? 20;

  // Damping ratio and natural frequency
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(m * k));
  const t = frame / fps;

  let progress = 0;

  if (zeta < 1) {
    // Underdamped
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * t);
    progress = 1 - envelope * (Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t));
  } else if (zeta === 1) {
    // Critically damped
    progress = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  } else {
    // Overdamped
    const s1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const s2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
    progress = 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
  }

  // Handle tiny precision limits
  if (t > 2.0 && Math.abs(progress - 1) < 0.001) {
    progress = 1;
  }

  return from + progress * (to - from);
}

/**
 * Linear/clamped interpolation matching Remotion's interpolate()
 */
export function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: { extrapolateLeft?: 'clamp' | 'extend'; extrapolateRight?: 'clamp' | 'extend' }
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;

  let val = input;
  const clampLeft = options?.extrapolateLeft !== 'extend';
  const clampRight = options?.extrapolateRight !== 'extend';

  if (clampLeft && val < inMin) val = inMin;
  if (clampRight && val > inMax) val = inMax;

  if (inMax === inMin) return outMin;
  const factor = (val - inMin) / (inMax - inMin);
  return outMin + factor * (outMax - outMin);
}
