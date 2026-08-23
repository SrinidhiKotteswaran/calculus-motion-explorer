import { useMemo, useState } from 'react';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput, Slider, Button, StatCard, Label } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS } from '../lib/colors';
import { parse, makeEvaluator } from '../lib/mathEngine';
import { getRiemannRects, riemannSum, simpsonsRule, type RiemannMethod } from '../lib/numerics';

function format(value: number, digits = 6): string { return Number.isFinite(value) ? value.toFixed(digits) : 'undefined'; }

export function IntegrateMode() {
  const [input, setInput] = useState('sin(t)');
  const [a, setA] = useState(0);
  const [b, setB] = useState(Math.PI);
  const [n, setN] = useState(12);
  const [method, setMethod] = useState<RiemannMethod>('midpoint');
  const parsed = useMemo(() => {
    try { const ast = parse(input); return { fn: makeEvaluator(ast), error: null }; }
    catch (e: unknown) { return { fn: () => NaN, error: e instanceof Error ? e.message : 'Invalid expression' }; }
  }, [input]);
  const { fn, error } = parsed;
  const approx = riemannSum(fn, a, b, n, method);
  const reference = simpsonsRule(fn, a, b, 2000);
  const rects = useMemo(() => getRiemannRects(fn, a, b, n, method).map((r) => ({ ...r, color: COLORS.position, opacity: 0.2 })), [fn, a, b, n, method]);
  const yDomain: [number, number] = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const y = fn(a + (b - a) * i / 200);
      if (Number.isFinite(y)) { min = Math.min(min, y); max = Math.max(max, y); }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [-1, 1];
    if (min === max) return [min - 1, max + 1];
    const p = Math.max(0.5, (max - min) * 0.2);
    return [min - p, max + p];
  }, [fn, a, b]);
  const absoluteError = Number.isFinite(approx) && Number.isFinite(reference) ? Math.abs(approx - reference) : NaN;
  const graphDomain: [number, number] = [Math.min(a, b), Math.max(a, b)];

  return <div className="space-y-6">
    <Panel>
      <SectionTitle subtitle="Approximate accumulated change with rectangles, then compare with a high-resolution numerical reference.">Integral Explorer & Riemann Sums</SectionTitle>
      <FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Left endpoint a</Label><input type="number" value={a} onChange={(e) => { const value = Number(e.target.value); if (Number.isFinite(value)) setA(value); }} /></div>
        <div><Label>Right endpoint b</Label><input type="number" value={b} onChange={(e) => { const value = Number(e.target.value); if (Number.isFinite(value)) setB(value); }} /></div>
        <div><Label>Rule</Label><div className="flex flex-wrap gap-1">{(['left', 'right', 'midpoint', 'trapezoid'] as RiemannMethod[]).map((m) => <Button key={m} active={method === m} size="sm" onClick={() => setMethod(m)}>{m}</Button>)}</div></div>
      </div>
      <div className="mt-4"><Slider label="Number of rectangles" value={n} min={2} max={100} step={1} onChange={setN} valueDisplay={`n = ${n}`} /></div>
    </Panel>
    <Panel>
      <Graph curves={[{ fn, color: COLORS.position, width: 2.5 }]} rects={rects} xDomain={graphDomain} yDomain={yDomain} xLabel="t" yLabel="f(t)" height={340} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4"><StatCard label="Riemann sum" value={format(approx)} color={COLORS.position} /><StatCard label="Reference integral" value={format(reference)} color={COLORS.velocity} /><StatCard label="Absolute error" value={Number.isFinite(absoluteError) ? absoluteError.toExponential(3) : 'undefined'} color={COLORS.warning} /></div>
    </Panel>
    <Panel><SectionTitle subtitle="The Fundamental Theorem connects accumulated velocity to displacement.">Area Under the Curve</SectionTitle><div className="text-center bg-elevated border border-default rounded-md p-5"><MathTex display tex={`\\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} v(t)\\,dt \\approx ${format(approx, 5)}`}/><p className="text-sm text-secondary mt-3">If v(t) is velocity, this signed area is the particle's displacement.</p></div></Panel>
  </div>;
}
