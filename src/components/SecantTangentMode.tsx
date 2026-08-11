import { useState, useMemo, useEffect, useRef } from 'react';
import { Graph } from './Graph';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput, Slider, Button, StatCard } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS } from '../lib/colors';
import { parse, makeEvaluator, nthDerivative, toLatex, simplify } from '../lib/mathEngine';
import { centralDifference } from '../lib/numerics';

const H_STEPS = [1, 0.5, 0.25, 0.1, 0.05, 0.01, 0.005, 0.001];

export function SecantTangentMode() {
  const [input, setInput] = useState('t^3 - 4*t^2 + 2*t');
  const [t0, setT0] = useState(1);
  const [hIndex, setHIndex] = useState(0);
  const [autoAnimate, setAutoAnimate] = useState(false);

  const parsed = useMemo(() => {
    try {
      const ast = parse(input);
      const fn = makeEvaluator(ast);
      const derivAst = simplify(nthDerivative(ast, 1));
      const deriv = makeEvaluator(derivAst);
      return { fn, deriv, derivLatex: toLatex(derivAst), error: null };
    } catch (e: any) {
      return { fn: () => NaN, deriv: () => NaN, derivLatex: '', error: e.message };
    }
  }, [input]);

  const { fn, deriv, derivLatex, error } = parsed;
  const h = H_STEPS[hIndex];
  const tRange: [number, number] = [-5, 5];

  // Secant line: passes through (t0, fn(t0)) and (t0+h, fn(t0+h))
  const secantSlope = useMemo(() => {
    return (fn(t0 + h) - fn(t0)) / h;
  }, [fn, t0, h]);

  const secantFn = useMemo(() => {
    const y0 = fn(t0);
    return (t: number) => y0 + secantSlope * (t - t0);
  }, [fn, t0, secantSlope]);

  const tangentFn = useMemo(() => {
    const slope = deriv(t0);
    const y0 = fn(t0);
    return (t: number) => y0 + slope * (t - t0);
  }, [fn, t0, deriv]);

  // Auto-animation
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    if (!autoAnimate) {
      if (animRef.current) clearTimeout(animRef.current);
      return;
    }
    const step = () => {
      setHIndex((prev) => {
        if (prev >= H_STEPS.length - 1) {
          setAutoAnimate(false);
          return prev;
        }
        return prev + 1;
      });
      animRef.current = setTimeout(step, 1200) as unknown as number;
    };
    animRef.current = setTimeout(step, 1200) as unknown as number;
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [autoAnimate]);

  // Domain
  const yDomain = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i <= 300; i++) {
      const tv = tRange[0] + (i / 300) * (tRange[1] - tRange[0]);
      const y = fn(tv);
      if (isFinite(y) && !isNaN(y)) {
        min = Math.min(min, y);
        max = Math.max(max, y);
      }
    }
    if (min === Infinity) return [-5, 5] as [number, number];
    const pad = Math.max(1, (max - min) * 0.15);
    return [min - pad, max + pad] as [number, number];
  }, [fn]);

  const exactSlope = deriv(t0);
  const secantError = Math.abs(secantSlope - exactSlope);
  const y0 = fn(t0);
  const y1 = fn(t0 + h);

  return (
    <div className="space-y-6">
      <Panel>
        <SectionTitle subtitle="Watch the secant line approach the tangent line as h shrinks. This is the definition of the derivative made visible.">
          Secant to Tangent: The Derivative as a Limit
        </SectionTitle>
        <FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider label="Point t" value={t0} min={-4} max={4} step={0.05} onChange={setT0} valueDisplay={`t = ${t0.toFixed(2)}`} />
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-secondary uppercase tracking-wider">Step size h</span>
              <span className="text-xs text-secondary font-mono">h = {h}</span>
            </div>
            <input type="range" value={hIndex} min={0} max={H_STEPS.length - 1} step={1} onChange={(e) => setHIndex(parseInt(e.target.value))} />
            <div className="flex justify-between mt-1 text-[10px] text-muted">
              <span>{H_STEPS[0]}</span>
              <span>{H_STEPS[H_STEPS.length - 1]}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setAutoAnimate(!autoAnimate)} active={autoAnimate} size="sm">
            {autoAnimate ? 'Stop' : 'Animate'} h → 0
          </Button>
          <Button onClick={() => setHIndex(0)} size="sm">Reset h</Button>
        </div>
      </Panel>

      <Panel>
        <Graph
          curves={[
            { fn, color: COLORS.position, width: 2.5, label: 's(t)' },
            { fn: tangentFn, color: COLORS.tangent, width: 1.5, dashArray: '6 4', label: 'Tangent' },
            { fn: secantFn, color: COLORS.velocity, width: 2, label: 'Secant' },
          ]}
          markers={[
            { t: t0, y: y0, color: COLORS.selected, label: `(${t0.toFixed(2)}, ${y0.toFixed(2)})`, size: 5 },
            { t: t0 + h, y: y1, color: COLORS.velocity, label: `(${(t0+h).toFixed(2)}, ${y1.toFixed(2)})`, size: 5 },
          ]}
          vLines={[{ t: t0, color: COLORS.selected }, { t: t0 + h, color: COLORS.velocity }]}
          xDomain={tRange}
          yDomain={yDomain}
          xLabel="t"
          yLabel="s(t)"
          height={360}
        />
        <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5" style={{ background: COLORS.position }} /><span className="text-secondary">s(t)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5" style={{ background: COLORS.velocity }} /><span className="text-secondary">Secant line</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: COLORS.tangent }} /><span className="text-secondary">Tangent line</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.selected }} /><span className="text-secondary">Point at t</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.velocity }} /><span className="text-secondary">Point at t+h</span></div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionTitle subtitle="The difference quotient and its limit.">
            The Definition
          </SectionTitle>
          <div className="space-y-4">
            <div className="bg-elevated border border-default rounded-md p-4 text-center">
              <div className="text-secondary text-sm mb-2">Secant slope (difference quotient):</div>
              <MathTex display tex={`\\frac{s(t+h) - s(t)}{h} = \\frac{${y1.toFixed(4)} - ${y0.toFixed(4)}}{${h}} = ${secantSlope.toFixed(6)}`} />
            </div>
            <div className="bg-elevated border border-default rounded-md p-4 text-center">
              <div className="text-secondary text-sm mb-2">As h → 0, the secant becomes the tangent:</div>
              <MathTex display tex={`s'(t) = \\lim_{h \\to 0} \\frac{s(t+h) - s(t)}{h} = ${exactSlope.toFixed(6)}`} />
            </div>
            {derivLatex && (
              <div className="bg-elevated border border-default rounded-md p-4 text-center">
                <div className="text-secondary text-sm mb-2">Symbolic derivative:</div>
                <MathTex display tex={`s'(t) = ${derivLatex}`} />
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <SectionTitle subtitle="How close is the secant slope to the true derivative?">
            Convergence
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Secant slope" value={secantSlope.toFixed(6)} color={COLORS.velocity} />
            <StatCard label="Exact s'(t)" value={exactSlope.toFixed(6)} color={COLORS.tangent} />
            <StatCard label="Error" value={secantError.toExponential(2)} color={secantError < 0.01 ? COLORS.velocity : COLORS.warning} />
            <StatCard label="h" value={h.toString()} color={COLORS.selected} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-2 px-2 text-secondary font-medium">h</th>
                  <th className="text-right py-2 px-2 text-secondary font-medium">Secant slope</th>
                  <th className="text-right py-2 px-2 text-secondary font-medium">Exact</th>
                  <th className="text-right py-2 px-2 text-secondary font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {H_STEPS.map((hVal, i) => {
                  const slope = (fn(t0 + hVal) - fn(t0)) / hVal;
                  const err = Math.abs(slope - exactSlope);
                  return (
                    <tr key={i} className={`border-b border-default ${i === hIndex ? 'bg-[var(--accent)]/10' : ''}`}>
                      <td className="py-1.5 px-2 font-mono text-secondary">{hVal}</td>
                      <td className="py-1.5 px-2 font-mono text-right" style={{ color: i === hIndex ? COLORS.velocity : 'var(--text)' }}>{slope.toFixed(6)}</td>
                      <td className="py-1.5 px-2 font-mono text-right text-secondary">{exactSlope.toFixed(6)}</td>
                      <td className="py-1.5 px-2 font-mono text-right text-secondary">{err.toExponential(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
