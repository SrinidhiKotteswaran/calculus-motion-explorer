import { useState, useMemo } from 'react';
import { Graph } from './Graph';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput, Slider, Button, StatCard, Label } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS } from '../lib/colors';
import { parse, makeEvaluator, nthDerivative, toLatex, simplify } from '../lib/mathEngine';
import { numericalDerivative, generateErrorData, compareMethods, type DiffMethod } from '../lib/numerics';

function formatNumber(value: number, digits = 8): string { return Number.isFinite(value) ? value.toFixed(digits) : 'undefined'; }
function formatExponential(value: number, digits = 3): string { return Number.isFinite(value) ? value.toExponential(digits) : 'undefined'; }

export function NumericsMode() {
  const [input, setInput] = useState('sin(t)');
  const [t0, setT0] = useState(1);
  const [method, setMethod] = useState<DiffMethod>('central');
  const [h, setH] = useState(0.01);

  const parsed = useMemo(() => {
    try {
      const ast = parse(input);
      const fn = makeEvaluator(ast);
      const derivAst = simplify(nthDerivative(ast, 1));
      const deriv = makeEvaluator(derivAst);
      return { fn, deriv, derivLatex: toLatex(derivAst), error: null };
    } catch (e: unknown) {
      return { fn: () => NaN, deriv: () => NaN, derivLatex: '', error: e instanceof Error ? e.message : 'Invalid expression' };
    }
  }, [input]);

  const { fn, deriv, derivLatex, error } = parsed;
  const errorData = useMemo(() => generateErrorData(fn, deriv, t0, method), [fn, deriv, t0, method]);
  const comparisonData = useMemo(() => compareMethods(fn, deriv, t0), [fn, deriv, t0]);
  const numericalResult = numericalDerivative(fn, t0, h, method);
  const exactResult = deriv(t0);
  const currentError = Number.isFinite(numericalResult) && Number.isFinite(exactResult) ? Math.abs(numericalResult - exactResult) : NaN;
  const relativeError = Number.isFinite(currentError) && Number.isFinite(exactResult) && Math.abs(exactResult) > 1e-15 ? currentError / Math.abs(exactResult) : NaN;
  const tRange: [number, number] = [-5, 5];

  const yDomain = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i <= 300; i++) {
      const tv = tRange[0] + (i / 300) * (tRange[1] - tRange[0]);
      const y = fn(tv);
      if (Number.isFinite(y)) { min = Math.min(min, y); max = Math.max(max, y); }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [-5, 5] as [number, number];
    if (min === max) return [min - 1, max + 1] as [number, number];
    const pad = Math.max(1, (max - min) * 0.15);
    return [min - pad, max + pad] as [number, number];
  }, [fn]);

  const errDomain = useMemo(() => {
    const errs = errorData.map((d) => d.logError).filter(Number.isFinite);
    if (!errs.length) return [-5, 1] as [number, number];
    return [Math.min(...errs) - 0.5, Math.max(...errs) + 0.5] as [number, number];
  }, [errorData]);

  const methodColors: Record<DiffMethod, string> = { forward: COLORS.position, backward: COLORS.velocity, central: COLORS.acceleration };

  return (
    <div className="space-y-6">
      <Panel>
        <SectionTitle subtitle="Compare numerical differentiation methods and investigate floating-point error. Smaller h isn't always better.">Numerical Differentiation Laboratory</SectionTitle>
        <FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider label="Evaluation point t" value={t0} min={-4} max={4} step={0.05} onChange={setT0} valueDisplay={`t = ${t0.toFixed(2)}`} />
          <div><Label>Method</Label><div className="flex gap-2">{(['forward', 'backward', 'central'] as DiffMethod[]).map((m) => <Button key={m} active={method === m} onClick={() => setMethod(m)} size="sm">{m.charAt(0).toUpperCase() + m.slice(1)}</Button>)}</div></div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionTitle subtitle="The function and its derivatives at the selected point.">Function View</SectionTitle>
          <Graph curves={[{ fn, color: COLORS.position, width: 2.5 }, { fn: deriv, color: COLORS.velocity, width: 2, dashArray: '5 3' }]} markers={Number.isFinite(fn(t0)) ? [{ t: t0, y: fn(t0), color: COLORS.selected, size: 5 }] : []} vLines={[{ t: t0, color: COLORS.selected }]} xDomain={tRange} yDomain={yDomain} xLabel="t" yLabel="f(t), f'(t)" height={240} />
          <div className="flex items-center gap-4 mt-2 text-xs"><div className="flex items-center gap-1.5"><div className="w-4 h-0.5" style={{ background: COLORS.position }} /><span className="text-secondary">f(t)</span></div><div className="flex items-center gap-1.5"><div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: COLORS.velocity }} /><span className="text-secondary">f'(t) exact</span></div></div>
        </Panel>

        <Panel>
          <SectionTitle subtitle="Numerical vs. exact derivative at the current h.">Current Approximation</SectionTitle>
          <div className="space-y-3">
            <div className="bg-elevated border border-default rounded-md p-3"><div className="text-xs text-secondary mb-1">Formula used:</div><div className="text-center">{method === 'forward' && <MathTex display tex={`f'(t) \\approx \\frac{f(t+h) - f(t)}{h}`} />}{method === 'backward' && <MathTex display tex={`f'(t) \\approx \\frac{f(t) - f(t-h)}{h}`} />}{method === 'central' && <MathTex display tex={`f'(t) \\approx \\frac{f(t+h) - f(t-h)}{2h}`} />}</div></div>
            <Slider label="Step size h" value={h} min={0.0001} max={1} step={0.0001} onChange={setH} valueDisplay={`h = ${h}`} />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Numerical" value={formatNumber(numericalResult)} color={methodColors[method]} />
              <StatCard label="Exact" value={formatNumber(exactResult)} color={COLORS.tangent} />
              <StatCard label="Absolute error" value={formatExponential(currentError)} color={Number.isFinite(currentError) && currentError < 1e-6 ? COLORS.velocity : COLORS.warning} />
              <StatCard label="Relative error" value={formatExponential(relativeError)} color={COLORS.neutral} />
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle subtitle="Error vs. step size h (log-log scale). Notice: error decreases, then increases due to floating-point cancellation. The optimal h balances truncation and round-off.">Floating-Point Error Investigation</SectionTitle>
        <Graph curves={[{ fn: (logH: number) => { const point = errorData.find((d) => Math.abs(d.logH - logH) < 0.001); return point?.logError ?? NaN; }, color: methodColors[method], width: 2.5 }]} xDomain={[Math.min(...errorData.map((d) => d.logH)) - 0.1, Math.max(...errorData.map((d) => d.logH)) + 0.1]} yDomain={errDomain} xLabel="log₁₀(h)" yLabel="log₁₀(error)" height={260} />
        <p className="text-xs text-secondary mt-2">The U-shape reveals a fundamental tradeoff: large h causes truncation error, while tiny h causes catastrophic cancellation in floating-point arithmetic. The minimum is the optimal step size.</p>
      </Panel>

      <Panel>
        <SectionTitle subtitle="Compare all three methods. Central difference is O(h²) — one order better than forward/backward O(h).">Method Comparison</SectionTitle>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-default"><th className="text-left py-2 px-3 text-secondary font-medium">h</th><th className="text-right py-2 px-3 font-medium" style={{ color: COLORS.position }}>Forward</th><th className="text-right py-2 px-3 font-medium" style={{ color: COLORS.velocity }}>Backward</th><th className="text-right py-2 px-3 font-medium" style={{ color: COLORS.acceleration }}>Central</th></tr></thead><tbody>{comparisonData.map((row) => <tr key={row.h} className="border-b border-default"><td className="py-1.5 px-3 font-mono text-secondary">{row.h}</td><td className="py-1.5 px-3 font-mono text-right text-secondary">{formatExponential(row.forward)}</td><td className="py-1.5 px-3 font-mono text-right text-secondary">{formatExponential(row.backward)}</td><td className="py-1.5 px-3 font-mono text-right" style={{ color: COLORS.acceleration }}>{formatExponential(row.central)}</td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}
