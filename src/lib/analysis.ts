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

// Find roots of fn(t) = 0 in [a, b] using bisection + sign change detection
export function findRoots(fn: (t: number) => number, a: number, b: number, steps = 5000): number[] {
  const roots: number[] = [];
  const dt = (b - a) / steps;
  let prevT = a;
  let prevVal = fn(a);

  for (let i = 1; i <= steps; i++) {
    const t = a + i * dt;
    const val = fn(t);

    if (isNaN(prevVal) || isNaN(val) || !isFinite(prevVal) || !isFinite(val)) {
      prevT = t;
      prevVal = val;
      continue;
    }

    // Sign change => root
    if (prevVal * val < 0) {
      const root = bisect(fn, prevT, t, 100);
      if (root !== null && !roots.some((r) => Math.abs(r - root) < dt * 2)) {
        roots.push(root);
      }
    }
    // Near-zero (touching axis)
    else if (Math.abs(val) < 1e-10 && Math.abs(prevVal) < 1e-10) {
      const root = (prevT + t) / 2;
      if (!roots.some((r) => Math.abs(r - root) < dt * 2)) {
        roots.push(root);
      }
    }

    prevT = t;
    prevVal = val;
  }

  return roots;
}

function bisect(fn: (t: number) => number, a: number, b: number, maxIter: number): number | null {
  let fa = fn(a);
  let fb = fn(b);
  if (fa * fb > 0) return null;

  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fm = fn(mid);
    if (Math.abs(fm) < 1e-12 || (b - a) < 1e-12) return mid;
    if (fa * fm < 0) {
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
    if (!isNaN(d2) && isFinite(d2)) {
      if (d2 < -1e-10) type = 'max';
      else if (d2 > 1e-10) type = 'min';
      else {
        // Fall back to sign change of derivative
        const dLeft = deriv(t - 0.001);
        const dRight = deriv(t + 0.001);
        if (dLeft > 0 && dRight < 0) type = 'max';
        else if (dLeft < 0 && dRight > 0) type = 'min';
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
      // Verify sign change in second derivative
      const left = secondDeriv(t - 0.001);
      const right = secondDeriv(t + 0.001);
      return left * right < 0;
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
    if (isNaN(val) || !isFinite(val)) continue;
    if (val > 0) {
      intervals.push({ start, end, sign: 'positive', behavior: 'increasing' });
    } else if (val < 0) {
      intervals.push({ start, end, sign: 'negative', behavior: 'decreasing' });
    } else {
      intervals.push({ start, end, sign: 'zero', behavior: 'stationary' });
    }
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
    if (isNaN(val) || !isFinite(val)) continue;
    if (val > 0) {
      intervals.push({ start, end, concavity: 'up' });
    } else if (val < 0) {
      intervals.push({ start, end, concavity: 'down' });
    } else {
      intervals.push({ start, end, concavity: 'none' });
    }
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

  if (stopped) {
    return { direction: 'stopped', speed: 'stopped', interpretation: 'Instantaneously at rest' };
  }
  if (movingForward && accelPositive) {
    return { direction: 'forward', speed: 'up', interpretation: 'Forward, speeding up' };
  }
  if (movingForward && !accelPositive) {
    return { direction: 'forward', speed: 'down', interpretation: 'Forward, slowing down' };
  }
  if (movingBackward && accelPositive) {
    return { direction: 'backward', speed: 'down', interpretation: 'Backward, slowing down' };
  }
  return { direction: 'backward', speed: 'up', interpretation: 'Backward, speeding up' };
}

// Procedural problem generation
export interface Problem {
  functionStr: string;
  question: string;
  answer: number;
  tolerance: number;
  hint: string;
  type: 'direction-change' | 'max-position' | 'min-position' | 'velocity-zero' | 'speed-up';
}

export function generateProblem(): Problem {
  const templates = [
    () => {
      const a = randInt(-3, 3, [0]);
      const b = randInt(-5, 5, [0]);
      const c = randInt(-5, 5);
      const d = randInt(-5, 5);
      const fn = `${a}*t^3 + ${b}*t^2 + ${c}*t + ${d}`;
      return {
        functionStr: fn,
        question: `A particle moves according to s(t) = ${formatTerm(a)}t³ ${formatTerm(b)}t² ${formatTerm(c)}t ${formatTerm(d)}. At what time t does the particle change direction? (Round to 2 decimal places)`,
        answer: 0, // computed below
        tolerance: 0.05,
        hint: 'The particle changes direction when velocity changes sign. Find v(t) = s\'(t), then find where v(t) = 0 and check sign change.',
        type: 'direction-change' as const,
        coeffs: [a, b, c, d],
      };
    },
  ];
  const p = templates[0]();
  // For s(t) = at³ + bt² + ct + d, v(t) = 3at² + 2bt + c
  // Direction change at roots of v(t) where sign changes
  const [a, b, c] = p.coeffs;
  const vA = 3 * a;
  const vB = 2 * b;
  const vC = c;
  const disc = vB * vB - 4 * vA * vC;
  let answer = 0;
  if (disc >= 0) {
    const sq = Math.sqrt(disc);
    const r1 = (-vB + sq) / (2 * vA);
    const r2 = (-vB - sq) / (2 * vA);
    // pick the root where sign actually changes (for cubic with a≠0, both roots are direction changes)
    answer = Math.abs(r1) < Math.abs(r2) ? r1 : r2;
  }
  return { ...p, answer };
}

function randInt(min: number, max: number, exclude: number[] = []): number {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (exclude.includes(val));
  return val;
}

function formatTerm(n: number): string {
  if (n === 0) return '+0';
  return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}
