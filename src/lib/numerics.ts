export type DiffMethod = 'forward' | 'backward' | 'central';

function validateStep(h: number): void {
  if (!Number.isFinite(h) || h === 0) {
    throw new Error('Step size h must be a finite non-zero number.');
  }
}

function validatePartitionCount(n: number): void {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('The number of partitions n must be a positive integer.');
  }
}

export function forwardDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  return (fn(t + h) - fn(t)) / h;
}

export function backwardDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  return (fn(t) - fn(t - h)) / h;
}

export function centralDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  return (fn(t + h) - fn(t - h)) / (2 * h);
}

export function numericalDerivative(fn: (t: number) => number, t: number, h: number, method: DiffMethod = 'central'): number {
  validateStep(h);
  switch (method) {
    case 'forward': return forwardDifference(fn, t, h);
    case 'backward': return backwardDifference(fn, t, h);
    case 'central': return centralDifference(fn, t, h);
  }
}

export interface ErrorDataPoint {
  h: number;
  logH: number;
  numerical: number;
  exact: number;
  error: number;
  logError: number;
}

export function generateErrorData(
  fn: (t: number) => number,
  exactDeriv: (t: number) => number,
  t: number,
  method: DiffMethod = 'central',
  hValues?: number[]
): ErrorDataPoint[] {
  const hs = hValues || [1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01, 0.005, 0.0025, 0.001, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10, 1e-11, 1e-12, 1e-13, 1e-14, 1e-15];
  const exact = exactDeriv(t);
  return hs.map((h) => {
    const numerical = numericalDerivative(fn, t, h, method);
    const error = Math.abs(numerical - exact);
    return {
      h,
      logH: Math.log10(h),
      numerical,
      exact,
      error: error === 0 ? 1e-17 : error,
      logError: Math.log10(Math.max(error, 1e-17)),
    };
  });
}

export interface ConvergenceData {
  h: number;
  forward: number;
  backward: number;
  central: number;
}

export function compareMethods(
  fn: (t: number) => number,
  exactDeriv: (t: number) => number,
  t: number,
  hValues?: number[]
): ConvergenceData[] {
  const hs = hValues || [0.1, 0.05, 0.01, 0.005, 0.001, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10];
  const exact = exactDeriv(t);
  return hs.map((h) => ({
    h,
    forward: Math.abs(forwardDifference(fn, t, h) - exact),
    backward: Math.abs(backwardDifference(fn, t, h) - exact),
    central: Math.abs(centralDifference(fn, t, h) - exact),
  }));
}

export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid';

export function riemannSum(
  fn: (t: number) => number,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): number {
  validatePartitionCount(n);
  const dt = (b - a) / n;
  let sum = 0;
  switch (method) {
    case 'left':
      for (let i = 0; i < n; i++) sum += fn(a + i * dt);
      return sum * dt;
    case 'right':
      for (let i = 1; i <= n; i++) sum += fn(a + i * dt);
      return sum * dt;
    case 'midpoint':
      for (let i = 0; i < n; i++) sum += fn(a + (i + 0.5) * dt);
      return sum * dt;
    case 'trapezoid':
      for (let i = 0; i <= n; i++) {
        const w = i === 0 || i === n ? 0.5 : 1;
        sum += w * fn(a + i * dt);
      }
      return sum * dt;
  }
}

export interface RiemannRect {
  x: number;
  width: number;
  height: number;
  method: RiemannMethod;
}

export function getRiemannRects(
  fn: (t: number) => number,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): RiemannRect[] {
  validatePartitionCount(n);
  const dt = (b - a) / n;
  const rects: RiemannRect[] = [];
  switch (method) {
    case 'left':
      for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + i * dt), method });
      break;
    case 'right':
      for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + (i + 1) * dt), method });
      break;
    case 'midpoint':
      for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + (i + 0.5) * dt), method });
      break;
    case 'trapezoid':
      for (let i = 0; i < n; i++) {
        const l = fn(a + i * dt);
        const r = fn(a + (i + 1) * dt);
        rects.push({ x: a + i * dt, width: dt, height: (l + r) / 2, method });
      }
      break;
  }
  return rects;
}

export interface IntegrationErrorData {
  n: number;
  logN: number;
  error: number;
  logError: number;
}

export function integrationErrorData(
  fn: (t: number) => number,
  a: number,
  b: number,
  exactIntegral: number,
  method: RiemannMethod,
  nValues?: number[]
): IntegrationErrorData[] {
  const ns = nValues || [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
  return ns.map((n) => {
    const approx = riemannSum(fn, a, b, n, method);
    const error = Math.abs(approx - exactIntegral);
    return {
      n,
      logN: Math.log10(n),
      error: error === 0 ? 1e-17 : error,
      logError: Math.log10(Math.max(error, 1e-17)),
    };
  });
}

export function simpsonsRule(fn: (t: number) => number, a: number, b: number, n = 1000): number {
  validatePartitionCount(n);
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * fn(a + i * h);
  }
  return (h / 3) * sum;
}
