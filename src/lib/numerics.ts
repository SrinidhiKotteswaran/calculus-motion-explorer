export type DiffMethod = 'forward' | 'backward' | 'central';

function validateStep(h: number): void {
  if (!Number.isFinite(h) || h <= 0) throw new Error('Step size h must be a positive finite number.');
}

export function forwardDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  const next = fn(t + h);
  const current = fn(t);
  if (!Number.isFinite(next) || !Number.isFinite(current)) return NaN;
  return (next - current) / h;
}

export function backwardDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  const current = fn(t);
  const previous = fn(t - h);
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return NaN;
  return (current - previous) / h;
}

export function centralDifference(fn: (t: number) => number, t: number, h: number): number {
  validateStep(h);
  const next = fn(t + h);
  const previous = fn(t - h);
  if (!Number.isFinite(next) || !Number.isFinite(previous)) return NaN;
  return (next - previous) / (2 * h);
}

export function numericalDerivative(fn: (t: number) => number, t: number, h: number, method: DiffMethod = 'central'): number {
  switch (method) {
    case 'forward': return forwardDifference(fn, t, h);
    case 'backward': return backwardDifference(fn, t, h);
    case 'central': return centralDifference(fn, t, h);
  }
}

export interface ErrorDataPoint { h: number; logH: number; numerical: number; exact: number; error: number; logError: number; }

export function generateErrorData(fn: (t: number) => number, exactDeriv: (t: number) => number, t: number, method: DiffMethod = 'central', hValues?: number[]): ErrorDataPoint[] {
  const hs = hValues || [1, 0.5, 0.25, 0.1, 0.05, 0.025, 0.01, 0.005, 0.0025, 0.001, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10, 1e-11, 1e-12, 1e-13, 1e-14, 1e-15];
  const exact = exactDeriv(t);
  return hs.filter((h) => Number.isFinite(h) && h > 0).map((h) => {
    const numerical = numericalDerivative(fn, t, h, method);
    const error = Number.isFinite(numerical) && Number.isFinite(exact) ? Math.abs(numerical - exact) : NaN;
    const plottedError = Number.isFinite(error) ? Math.max(error, 1e-17) : NaN;
    return { h, logH: Math.log10(h), numerical, exact, error, logError: Number.isFinite(plottedError) ? Math.log10(plottedError) : NaN };
  });
}

export interface ConvergenceData { h: number; forward: number; backward: number; central: number; }

export function compareMethods(fn: (t: number) => number, exactDeriv: (t: number) => number, t: number, hValues?: number[]): ConvergenceData[] {
  const hs = hValues || [0.1, 0.05, 0.01, 0.005, 0.001, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10];
  const exact = exactDeriv(t);
  return hs.filter((h) => Number.isFinite(h) && h > 0).map((h) => ({ h, forward: Math.abs(forwardDifference(fn, t, h) - exact), backward: Math.abs(backwardDifference(fn, t, h) - exact), central: Math.abs(centralDifference(fn, t, h) - exact) }));
}

export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid';

function validatePartitionCount(n: number): void {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error('Number of subintervals n must be a positive integer.');
}

export function riemannSum(fn: (t: number) => number, a: number, b: number, n: number, method: RiemannMethod): number {
  validatePartitionCount(n);
  const dt = (b - a) / n;
  let sum = 0;
  switch (method) {
    case 'left': for (let i = 0; i < n; i++) sum += fn(a + i * dt); break;
    case 'right': for (let i = 1; i <= n; i++) sum += fn(a + i * dt); break;
    case 'midpoint': for (let i = 0; i < n; i++) sum += fn(a + (i + 0.5) * dt); break;
    case 'trapezoid': for (let i = 0; i <= n; i++) sum += (i === 0 || i === n ? 0.5 : 1) * fn(a + i * dt); break;
  }
  return Number.isFinite(sum) ? sum * dt : NaN;
}

export interface RiemannRect { x: number; width: number; height: number; method: RiemannMethod; }

export function getRiemannRects(fn: (t: number) => number, a: number, b: number, n: number, method: RiemannMethod): RiemannRect[] {
  validatePartitionCount(n);
  const dt = (b - a) / n;
  const rects: RiemannRect[] = [];
  switch (method) {
    case 'left': for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + i * dt), method }); break;
    case 'right': for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + (i + 1) * dt), method }); break;
    case 'midpoint': for (let i = 0; i < n; i++) rects.push({ x: a + i * dt, width: dt, height: fn(a + (i + 0.5) * dt), method }); break;
    case 'trapezoid': for (let i = 0; i < n; i++) { const l = fn(a + i * dt); const r = fn(a + (i + 1) * dt); rects.push({ x: a + i * dt, width: dt, height: (l + r) / 2, method }); } break;
  }
  return rects;
}

export interface IntegrationErrorData { n: number; logN: number; error: number; logError: number; }

export function integrationErrorData(fn: (t: number) => number, a: number, b: number, exactIntegral: number, method: RiemannMethod, nValues?: number[]): IntegrationErrorData[] {
  const ns = nValues || [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
  return ns.filter((n) => Number.isInteger(n) && n > 0).map((n) => {
    const approx = riemannSum(fn, a, b, n, method);
    const error = Number.isFinite(approx) && Number.isFinite(exactIntegral) ? Math.abs(approx - exactIntegral) : NaN;
    const plottedError = Number.isFinite(error) ? Math.max(error, 1e-17) : NaN;
    return { n, logN: Math.log10(n), error, logError: Number.isFinite(plottedError) ? Math.log10(plottedError) : NaN };
  });
}

export function simpsonsRule(fn: (t: number) => number, a: number, b: number, n = 1000): number {
  validatePartitionCount(n);
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * fn(a + i * h);
  return Number.isFinite(sum) ? (h / 3) * sum : NaN;
}
