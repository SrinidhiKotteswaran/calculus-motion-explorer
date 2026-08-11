import { useState, useMemo } from 'react';
import { Graph } from './Graph';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS } from '../lib/colors';
import { parse, makeEvaluator, nthDerivative, toLatex, simplify } from '../lib/mathEngine';
import { findCriticalPoints, findInflectionPoints, findIncreasingDecreasing, findConcavity, classifyMotion } from '../lib/analysis';

export function AnalyzeMode() {
  const [input, setInput] = useState('t^3 - 4*t^2 + 2*t');

  const parsed = useMemo(() => {
    try {
      const ast = parse(input);
      const fn = makeEvaluator(ast);
      const d1Ast = simplify(nthDerivative(ast, 1));
      const d2Ast = simplify(nthDerivative(ast, 2));
      const d1 = makeEvaluator(d1Ast);
      const d2 = makeEvaluator(d2Ast);
      return { fn, d1, d2, d1Latex: toLatex(d1Ast), d2Latex: toLatex(d2Ast), error: null };
    } catch (e: any) {
      return { fn: () => NaN, d1: () => NaN, d2: () => NaN, d1Latex: '', d2Latex: '', error: e.message };
    }
  }, [input]);

  const { fn, d1, d2, d1Latex, d2Latex, error } = parsed;
  const tRange: [number, number] = [-5, 5];

  const analysis = useMemo(() => {
    if (error) return null;
    return {
      criticalPoints: findCriticalPoints(fn, d1, d2, tRange[0], tRange[1]),
      inflectionPoints: findInflectionPoints(fn, d2, tRange[0], tRange[1]),
      intervals: findIncreasingDecreasing(d1, tRange[0], tRange[1]),
      concavity: findConcavity(d2, tRange[0], tRange[1]),
    };
  }, [fn, d1, d2, error, tRange]);

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

  if (!analysis) {
    return (
      <Panel>
        <FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} />
      </Panel>
    );
  }

  const { criticalPoints, inflectionPoints, intervals, concavity } = analysis;

  // Build regions for concavity coloring
  const concavityRegions = concavity.map((c) => ({
    start: c.start,
    end: c.end,
    color: c.concavity === 'up' ? COLORS.acceleration : c.concavity === 'down' ? COLORS.warning : COLORS.neutral,
    opacity: 0.06,
  }));

  return (
    <div className="space-y-6">
      <Panel>
        <SectionTitle subtitle="Automatic calculus analysis: critical points, intervals, concavity, and inflection points.">
          Calculus Analysis
        </SectionTitle>
        <FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} />
        {d1Latex && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-elevated border border-default rounded-md p-3 text-center">
              <div className="text-xs text-secondary mb-1">First derivative</div>
              <MathTex display tex={`s'(t) = ${d1Latex}`} />
            </div>
            <div className="bg-elevated border border-default rounded-md p-3 text-center">
              <div className="text-xs text-secondary mb-1">Second derivative</div>
              <MathTex display tex={`s''(t) = ${d2Latex}`} />
            </div>
          </div>
        )}
      </Panel>

      {/* Main graph with critical points and inflection points */}
      <Panel>
        <SectionTitle subtitle="Critical points (max/min) and inflection points are automatically detected and labeled.">
          Function with Critical Points
        </SectionTitle>
        <Graph
          curves={[{ fn, color: COLORS.position, width: 2.5 }]}
          regions={concavityRegions}
          markers={[
            ...criticalPoints.map((cp) => ({
              t: cp.t,
              y: cp.value,
              color: cp.type === 'max' ? COLORS.error : cp.type === 'min' ? COLORS.velocity : COLORS.neutral,
              label: cp.type === 'max' ? 'max' : cp.type === 'min' ? 'min' : undefined,
              size: 6,
            })),
            ...inflectionPoints.map((ip) => ({
              t: ip.t,
              y: ip.value,
              color: COLORS.warning,
              label: 'infl',
              size: 4,
            })),
          ]}
          xDomain={tRange}
          yDomain={yDomain}
          xLabel="t"
          yLabel="s(t)"
          height={320}
        />
        <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.error }} /><span className="text-secondary">Local max</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.velocity }} /><span className="text-secondary">Local min</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.warning }} /><span className="text-secondary">Inflection</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-3" style={{ background: COLORS.acceleration, opacity: 0.15 }} /><span className="text-secondary">Concave up</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-3" style={{ background: COLORS.warning, opacity: 0.15 }} /><span className="text-secondary">Concave down</span></div>
        </div>
      </Panel>

      {/* Sign charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* First derivative sign chart */}
        <Panel>
          <SectionTitle subtitle="Where s'(t) is positive, s(t) is increasing. Where negative, decreasing.">
            First Derivative Sign Chart
          </SectionTitle>
          <SignChart
            intervals={intervals}
            color={COLORS.velocity}
            label="s'(t)"
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-2 px-2 text-secondary font-medium">Interval</th>
                  <th className="text-center py-2 px-2 text-secondary font-medium">s'(t)</th>
                  <th className="text-right py-2 px-2 text-secondary font-medium">Behavior</th>
                </tr>
              </thead>
              <tbody>
                {intervals.map((iv, i) => (
                  <tr key={i} className="border-b border-default">
                    <td className="py-1.5 px-2 font-mono text-secondary">
                      {iv.start.toFixed(2)} &lt; t &lt; {iv.end.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-center" style={{ color: iv.sign === 'positive' ? COLORS.velocity : iv.sign === 'negative' ? COLORS.error : COLORS.neutral }}>
                      {iv.sign === 'positive' ? '+' : iv.sign === 'negative' ? '−' : '0'}
                    </td>
                    <td className="py-1.5 px-2 text-right text-secondary">{iv.behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Second derivative / concavity */}
        <Panel>
          <SectionTitle subtitle="Where s''(t) is positive, s(t) is concave up. Where negative, concave down.">
            Concavity Sign Chart
          </SectionTitle>
          <SignChart
            intervals={concavity.map((c) => ({
              start: c.start,
              end: c.end,
              sign: c.concavity === 'up' ? 'positive' as const : c.concavity === 'down' ? 'negative' as const : 'zero' as const,
              behavior: c.concavity === 'up' ? 'concave up' as const : c.concavity === 'down' ? 'concave down' as const : 'linear' as const,
            }))}
            color={COLORS.acceleration}
            label="s''(t)"
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-2 px-2 text-secondary font-medium">Interval</th>
                  <th className="text-center py-2 px-2 text-secondary font-medium">s''(t)</th>
                  <th className="text-right py-2 px-2 text-secondary font-medium">Concavity</th>
                </tr>
              </thead>
              <tbody>
                {concavity.map((c, i) => (
                  <tr key={i} className="border-b border-default">
                    <td className="py-1.5 px-2 font-mono text-secondary">
                      {c.start.toFixed(2)} &lt; t &lt; {c.end.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-center" style={{ color: c.concavity === 'up' ? COLORS.acceleration : c.concavity === 'down' ? COLORS.warning : COLORS.neutral }}>
                      {c.concavity === 'up' ? '+' : c.concavity === 'down' ? '−' : '0'}
                    </td>
                    <td className="py-1.5 px-2 text-right text-secondary">{c.concavity === 'up' ? 'concave up' : c.concavity === 'down' ? 'concave down' : 'linear'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Critical points summary */}
      <Panel>
        <SectionTitle subtitle="All detected critical points with classification.">
          Critical Points
        </SectionTitle>
        {criticalPoints.length === 0 ? (
          <p className="text-sm text-secondary">No critical points found in the interval [{tRange[0]}, {tRange[1]}].</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalPoints.map((cp, i) => (
              <div key={i} className="bg-elevated border border-default rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary uppercase tracking-wider">t = {cp.t.toFixed(3)}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      color: cp.type === 'max' ? COLORS.error : cp.type === 'min' ? COLORS.velocity : COLORS.neutral,
                      background: cp.type === 'max' ? 'rgba(239,68,68,0.1)' : cp.type === 'min' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                    }}
                  >
                    {cp.type === 'max' ? 'Local Max' : cp.type === 'min' ? 'Local Min' : 'Stationary'}
                  </span>
                </div>
                <div className="mt-2 text-sm font-mono">
                  <span className="text-secondary">s(t) = </span>
                  <span style={{ color: COLORS.position }}>{cp.value.toFixed(4)}</span>
                </div>
                <div className="text-sm font-mono">
                  <span className="text-secondary">s'(t) = </span>
                  <span style={{ color: COLORS.velocity }}>{cp.derivativeValue.toFixed(6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function SignChart({
  intervals,
  color,
  label,
}: {
  intervals: { start: number; end: number; sign: 'positive' | 'negative' | 'zero'; behavior: string }[];
  color: string;
  label: string;
}) {
  const width = 800;
  const height = 60;
  const padding = 20;
  const trackW = width - padding * 2;
  const [a, b] = [-5, 5];
  const sx = (t: number) => padding + ((t - a) / (b - a)) * trackW;

  return (
    <div className="bg-elevated border border-default rounded-md p-3">
      <div className="text-xs text-secondary mb-2 font-mono">{label}</div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1={padding} y1={30} x2={width - padding} y2={30} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
        {intervals.map((iv, i) => {
          const x1 = sx(iv.start);
          const x2 = sx(iv.end);
          const mid = (x1 + x2) / 2;
          return (
            <g key={i}>
              {iv.sign === 'positive' && (
                <text x={mid} y={20} textAnchor="middle" style={{ fontSize: 16, fill: color, fontWeight: 600 }}>+</text>
              )}
              {iv.sign === 'negative' && (
                <text x={mid} y={20} textAnchor="middle" style={{ fontSize: 16, fill: COLORS.error, fontWeight: 600 }}>−</text>
              )}
              <text x={mid} y={48} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--text-secondary)' }}>
                {iv.behavior}
              </text>
              <line x1={x1} y1={24} x2={x1} y2={36} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
            </g>
          );
        })}
        <line x1={sx(b)} y1={24} x2={sx(b)} y2={36} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
      </svg>
    </div>
  );
}
