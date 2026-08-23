export interface CriticalPoint {
  t: number;
  value: number;
  type: 'max' | 'min' | 'neither';
  derivativeValue: number;
}

export interface Interval {
  start: number;
  end: number;
  sign: 'positive' | 'negative' | 'zero';
  behavior: 'increasing' | 'decreasing' | 'stationary';
}

export interface InflectionPoint {
  t: number;
  value: number;
}

export interface ConcavityInterval {
  start: number;
  end: number;
  concavity: 'up' | 'down' | 'none';
}

const ROOT_TOLERANCE = 1e-9;
const DEDUPE_TOLERANCE = 1e-5;

// Find roots of fn(t) = 0 in [a, b]. Sign changes are refined with bisection;
// near-zero samples are refined with Newton's method so even-multiplicity roots
// (which touch the axis without changing sign) can also be detected.
export function findRoots(fn: (t: number) => number, a: number, b: number, steps = 5000): number[] {
  const roots: number[] = [];
  const dt = (b - a) / steps;
  const derivativeStep = Math.max(1e-6, dt * 0.1);
  const derivative = (t: number) => {
    const left = fn(t - derivativeStep);
    const right = fn(t + derivativeStep);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;
    return (right - left) / (2 * derivativeStep);
  };

  const addRoot = (root: number) => {
    if (!Number.isFinite(root) || root < a - ROOT_TOLERANCE || root > b + ROOT_TOLERANCE) return;
    const clamped = Math.max(a, Math.min(b, root));
    if (!roots.some((r) => Math.abs(r - clamped) < DEDUPE_TOLERANCE)) roots.push(clamped);
  };

  const newton = (start: number): number | null => {
    let t = start;
    for (let i = 0; i < 25; i++) {
      const value = fn(t);
      const slope = derivative(t);
      if (!Number.isFinite(value) || !Number.isFinite(slope) || Math.abs(slope) < 1e-12) return null;
      const next = t - value / slope;
      if (!Number.isFinite(next) || next < a || next > b) return null;
      if (Math.abs(next - t) < ROOT_TOLERANCE) return Math.abs(fn(next)) < 1e-7 ? next : null;
      t = next;
    }
    return Number.isFinite(fn(t)) && Math.abs(fn(t)) < 1e-7 ? t : null;
  };

  let prevT = a;
  let prevVal = fn(a);

  for (let i = 1; i <= steps; i++) {
    const t = a + i * dt;
    const val = fn(t);

    if (!Number.isFinite(prevVal) || !Number.isFinite(val)) {
      prevT = t;
      prevVal = val;
      continue;
    }

    if (Math.abs(prevVal) < ROOT_TOLERANCE) addRoot(prevT);
    if (prevVal * val < 0) {
      const root = bisect(fn, prevT, t, 100);
      if (root !== null) addRoot(root);
    }

    // Detect roots that touch the axis without changing sign. A local minimum
    // of |f| is a useful candidate; Newton refinement confirms the root.
    const nextT = t + dt;
    if (i < steps && Number.isFinite(nextT)) {
      const nextVal = fn(nextT);
      if (Number.isFinite(nextVal) && Math.abs(val) <= Math.abs(prevVal) && Math.abs(val) <= Math.abs(nextVal) && Math.abs(val) < 1e-3) {
        const root = newton(t);
        if (root !== null) addRoot(root);
      }
    }

    prevT = t;
    prevVal = val;
  }

  if (Number.isFinite(prevVal) && Math.abs(prevVal) < ROOT_TOLERANCE) addRoot(b);
  return roots.sort((x, y) => x - y);
}

function bisect(fn: (t: number) => number, a: number, b: number, maxIter: number): number | null {
  let fa = fn(a);
  let fb = fn(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fm = fn(mid);
    if (!Number.isFinite(fm)) return null;
    if (Math.abs(fm) < ROOT_TOLERANCE || (b - a) < ROOT_TOLERANCE) return mid;
    if (fa * fm <= 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

export function findCriticalPoints(
  fn: (t: number) => number,
  deriv: (t: number) => number,
  secondDeriv: (t: number) => number,
  a: number,
  b: number
): CriticalPoint[] {
  const roots = findRoots(deriv, a, b);
  return roots.map((t) => {
    const value = fn(t);
    const d2 = secondDeriv(t);
    let type: 'max' | 'min' | 'neither' = 'neither';
    if (Number.isFinite(d2)) {
      if (d2 < -1e-10) type = 'max';
      else if (d2 > 1e-10) type = 'min';
      else {
        // Use a scale-aware neighborhood instead of a fixed 0.001 step.
        const delta = Math.max(1e-5, Math.min((b - a) * 1e-3, 0.01));
        const dLeft = deriv(Math.max(a, t - delta));
        const dRight = deriv(Math.min(b, t + delta));
        if (Number.isFinite(dLeft) && Number.isFinite(dRight)) {
          if (dLeft > 0 && dRight < 0) type = 'max';
          else if (dLeft < 0 && dRight > 0) type = 'min';
        }
      }
    }
    return { t, value, type, derivativeValue: deriv(t) };
  });
}

export function findInflectionPoints(
  fn: (t: number) => number,
  secondDeriv: (t: number) => number,
  a: number,
  b: number
): InflectionPoint[] {
  const roots = findRoots(secondDeriv, a, b);
  return roots
    .filter((t) => {
      const delta = Math.max(1e-5, Math.min((b - a) * 1e-3, 0.01));
      const left = secondDeriv(Math.max(a, t - delta));
      const right = secondDeriv(Math.min(b, t + delta));
      return Number.isFinite(left) && Number.isFinite(right) && left * right < 0;
    })
    .map((t) => ({ t, value: fn(t) }));
}

export function findIncreasingDecreasing(
  deriv: (t: number) => number,
  a: number,
  b: number
): Interval[] {
  const roots = findRoots(deriv, a, b);
  const breakpoints = [a, ...roots.sort((x, y) => x - y), b];
  const intervals: Interval[] = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const start = breakpoints[i];
    const end = breakpoints[i + 1];
    const mid = (start + end) / 2;
    const val = deriv(mid);
    if (!Number.isFinite(val)) continue;
    if (val > 0) intervals.push({ start, end, sign: 'positive', behavior: 'increasing' });
    else if (val < 0) intervals.push({ start, end, sign: 'negative', behavior: 'decreasing' });
    else intervals.push({ start, end, sign: 'zero', behavior: 'stationary' });
  }
  return intervals;
}

export function findConcavity(
  secondDeriv: (t: number) => number,
  a: number,
  b: number
): ConcavityInterval[] {
  const roots = findRoots(secondDeriv, a, b);
  const breakpoints = [a, ...roots.sort((x, y) => x - y), b];
  const intervals: ConcavityInterval[] = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const start = breakpoints[i];
    const end = breakpoints[i + 1];
    const mid = (start + end) / 2;
    const val = secondDeriv(mid);
    if (!Number.isFinite(val)) continue;
    if (val > 0) intervals.push({ start, end, concavity: 'up' });
    else if (val < 0) intervals.push({ start, end, concavity: 'down' });
    else intervals.push({ start, end, concavity: 'none' });
  }
  return intervals;
}

export interface MotionPhase {
  t: number;
  velocity: number;
  acceleration: number;
  interpretation: string;
  speed: 'up' | 'down' | 'stopped';
}

export function classifyMotion(
  velocity: number,
  acceleration: number
): { direction: string; speed: 'up' | 'down' | 'stopped'; interpretation: string } {
  const movingForward = velocity > 0;
  const movingBackward = velocity < 0;
  const stopped = Math.abs(velocity) < 1e-10;
  const accelPositive = acceleration > 0;
  if (stopped) return { direction: 'stopped', speed: 'stopped', interpretation: 'Instantaneously at rest' };
  if (movingForward && accelPositive) return { direction: 'forward', speed: 'up', interpretation: 'Forward, speeding up' };
  if (movingForward && !accelPositive) return { direction: 'forward', speed: 'down', interpretation: 'Forward, slowing down' };
  if (movingBackward && accelPositive) return { direction: 'backward', speed: 'down', interpretation: 'Backward, slowing down' };
  return { direction: 'backward', speed: 'up', interpretation: 'Backward, speeding up' };
}

export interface Problem {
  functionStr: string;
  question: string;
  answer: number;
  tolerance: number;
  hint: string;
  type: 'direction-change' | 'max-position' | 'min-position' | 'velocity-zero' | 'speed-up';
}

export function generateProblem(): Problem {
  // Generate until the velocity quadratic has two distinct real roots. Since
  // a != 0, each simple velocity root is a genuine direction change.
  for (let attempt = 0; attempt < 100; attempt++) {
    const a = randInt(-3, 3, [0]);
    const b = randInt(-5, 5, [0]);
    const c = randInt(-5, 5);
    const d = randInt(-5, 5);
    const vA = 3 * a;
    const vB = 2 * b;
    const vC = c;
    const disc = vB * vB - 4 * vA * vC;
    if (disc <= 0) continue;

    const sq = Math.sqrt(disc);
    const r1 = (-vB + sq) / (2 * vA);
    const r2 = (-vB - sq) / (2 * vA);
    const candidates = [r1, r2].filter(Number.isFinite);
    if (candidates.length === 0) continue;

    const answer = candidates.reduce((best, root) => Math.abs(root) < Math.abs(best) ? root : best, candidates[0]);
    const fn = `${a}*t^3 + ${b}*t^2 + ${c}*t + ${d}`;
    return {
      functionStr: fn,
      question: `A particle moves according to s(t) = ${formatTerm(a)}t³ ${formatTerm(b)}t² ${formatTerm(c)}t ${formatTerm(d)}. At what time t does the particle change direction? (Round to 2 decimal places)`,
      answer,
      tolerance: 0.05,
      hint: 'The particle changes direction when velocity changes sign. Find v(t) = s\'(t), then find where v(t) = 0 and check the sign change.',
      type: 'direction-change',
    };
  }

  // Deterministic fallback with two simple velocity roots at t = -1 and 1.
  return {
    functionStr: '1*t^3 - 3*t',
    question: 'A particle moves according to s(t) = t³ - 3t. At what time t does the particle change direction? (Round to 2 decimal places)',
    answer: 1,
    tolerance: 0.05,
    hint: 'The particle changes direction when velocity changes sign. Find v(t) = s\'(t), then find where v(t) = 0 and check the sign change.',
    type: 'direction-change',
  };
}

function randInt(min: number, max: number, exclude: number[] = []): number {
  let val: number;
  do { val = Math.floor(Math.random() * (max - min + 1)) + min; } while (exclude.includes(val));
  return val;
}

function formatTerm(n: number): string {
  if (n === 0) return '+0';
  return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}
