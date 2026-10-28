/** Directory sheet spring. damping ratio 0.8, response 0.3s. */
export const SHEET_DAMPING = 0.8;

export const SHEET_RESPONSE = 0.3;

export function stepSheetSpring(state, target, dt, damping = SHEET_DAMPING, response = SHEET_RESPONSE) {
  const step = Math.min(Math.max(Number(dt) || 0, 0), 0.064);
  if (step === 0) return { value: state.value, velocity: state.velocity, settled: false };
  const omega = (2 * Math.PI) / response;
  const zeta = damping;
  if (zeta >= 1) {
    const stiffness = omega * omega;
    const damp = 2 * zeta * omega;
    const acceleration = -stiffness * (state.value - target) - damp * state.velocity;
    const velocity = state.velocity + acceleration * step;
    const value = state.value + velocity * step;
    const settled = Math.abs(target - value) < 0.0015 && Math.abs(velocity) < 0.01;
    if (settled) return { value: target, velocity: 0, settled: true };
    return { value, velocity, settled: false };
  }
  const omegaD = omega * Math.sqrt(1 - zeta * zeta);
  const sigma = zeta * omega;
  const offset = state.value - target;
  const envelope = Math.exp(-sigma * step);
  const cos = Math.cos(omegaD * step);
  const sin = Math.sin(omegaD * step);
  const amplitude = offset;
  const blend = (state.velocity + sigma * offset) / omegaD;
  const nextOffset = envelope * (amplitude * cos + blend * sin);
  const velocity = -sigma * nextOffset + envelope * (-amplitude * omegaD * sin + blend * omegaD * cos);
  const settled = Math.abs(nextOffset) < 0.0015 && Math.abs(velocity) < 0.01;
  if (settled) return { value: target, velocity: 0, settled: true };
  return { value: target + nextOffset, velocity, settled: false };
}
