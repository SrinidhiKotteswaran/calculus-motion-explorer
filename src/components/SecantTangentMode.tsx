import { useState, useMemo, useEffect, useRef } from 'react';
import { Graph } from './Graph';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput, Slider, Button, StatCard } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS } from '../lib/colors';
import { parse, makeEvaluator, nthDerivative, toLatex, simplify } from '../lib/mathEngine';
import { centralDifference } from '../lib/numerics';

const H_STEPS = [1, 0.5, 0.25, 0.1, 0.05, 0.01, 0.005, 0.001];
const fmt = (v: number, digits = 6) => Number.isFinite(v) ? v.toFixed(digits) : 'undefined';

export function SecantTangentMode() {
  const [input, setInput] = useState('t^3 - 4*t^2 + 2*t');
  const [t0, setT0] = useState(1);
  const [hIndex, setHIndex] = useState(0);
  const [autoAnimate, setAutoAnimate] = useState(false);
  const parsed = useMemo(() => {
    try { const ast = parse(input); const fn = makeEvaluator(ast); const derivAst = simplify(nthDerivative(ast, 1)); return { fn, deriv: makeEvaluator(derivAst), derivLatex: toLatex(derivAst), error: null }; }
    catch (e: unknown) { return { fn: () => NaN, deriv: () => NaN, derivLatex: '', error: e instanceof Error ? e.message : 'Invalid expression' }; }
  }, [input]);
  const { fn, deriv, derivLatex, error } = parsed;
  const h = H_STEPS[hIndex];
  const tRange: [number, number] = [-5, 5];
  const secantSlope = useMemo(() => centralDifference(fn, t0 + h / 2, h), [fn, t0, h]);
  const secantFn = useMemo(() => { const y0 = fn(t0); return (t: number) => y0 + secantSlope * (t - t0); }, [fn, t0, secantSlope]);
  const tangentFn = useMemo(() => { const slope = deriv(t0); const y0 = fn(t0); return (t: number) => y0 + slope * (t - t0); }, [fn, t0, deriv]);

  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!autoAnimate) { if (animRef.current !== null) clearTimeout(animRef.current); animRef.current = null; return; }
    if (hIndex >= H_STEPS.length - 1) { setAutoAnimate(false); return; }
    animRef.current = setTimeout(() => setHIndex((prev) => Math.min(prev + 1, H_STEPS.length - 1)), 1200);
    return () => { if (animRef.current !== null) clearTimeout(animRef.current); animRef.current = null; };
  }, [autoAnimate, hIndex]);

  const yDomain = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i <= 300; i++) { const y = fn(tRange[0] + (i / 300) * (tRange[1] - tRange[0])); if (Number.isFinite(y)) { min = Math.min(min, y); max = Math.max(max, y); } }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [-5, 5] as [number, number];
    if (min === max) return [min - 1, max + 1] as [number, number];
    const pad = Math.max(1, (max - min) * 0.15); return [min - pad, max + pad] as [number, number];
  }, [fn]);

  const exactSlope = deriv(t0);
  const secantError = Number.isFinite(secantSlope) && Number.isFinite(exactSlope) ? Math.abs(secantSlope - exactSlope) : NaN;
  const y0 = fn(t0), y1 = fn(t0 + h);

  return <div className="space-y-6">
    <Panel><SectionTitle subtitle="Watch the secant line approach the tangent line as h shrinks. This is the definition of the derivative made visible.">Secant to Tangent: The Derivative as a Limit</SectionTitle><FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput}/><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"><Slider label="Point t" value={t0} min={-4} max={4} step={0.05} onChange={setT0} valueDisplay={`t = ${t0.toFixed(2)}`}/><div><div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-secondary uppercase tracking-wider">Step size h</span><span className="text-xs text-secondary font-mono">h = {h}</span></div><input type="range" value={hIndex} min={0} max={H_STEPS.length - 1} step={1} onChange={(e)=>setHIndex(Number(e.target.value))}/><div className="flex justify-between mt-1 text-[10px] text-muted"><span>{H_STEPS[0]}</span><span>{H_STEPS[H_STEPS.length-1]}</span></div></div></div><div className="mt-4 flex gap-2"><Button onClick={()=>setAutoAnimate(!autoAnimate)} active={autoAnimate} size="sm">{autoAnimate?'Stop':'Animate'} h → 0</Button><Button onClick={()=>{setAutoAnimate(false);setHIndex(0)}} size="sm">Reset h</Button></div></Panel>
    <Panel><Graph curves={[{fn,color:COLORS.position,width:2.5,label:'s(t)'},{fn:tangentFn,color:COLORS.tangent,width:1.5,dashArray:'6 4',label:'Tangent'},{fn:secantFn,color:COLORS.velocity,width:2,label:'Secant'}]} markers={Number.isFinite(y0)&&Number.isFinite(y1)?[{t:t0,y:y0,color:COLORS.selected,label:`(${t0.toFixed(2)}, ${y0.toFixed(2)})`,size:5},{t:t0+h,y:y1,color:COLORS.velocity,label:`(${(t0+h).toFixed(2)}, ${y1.toFixed(2)})`,size:5}]:[]} vLines={[{t:t0,color:COLORS.selected},{t:t0+h,color:COLORS.velocity}]} xDomain={tRange} yDomain={yDomain} xLabel="t" yLabel="s(t)" height={360}/></Panel>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Panel><SectionTitle subtitle="The difference quotient and its limit.">The Definition</SectionTitle><div className="space-y-4"><div className="bg-elevated border border-default rounded-md p-4 text-center"><div className="text-secondary text-sm mb-2">Secant slope (difference quotient):</div><MathTex display tex={`\\frac{s(t+h) - s(t)}{h} = \\frac{${fmt(y1,4)} - ${fmt(y0,4)}}{${h}} = ${fmt(secantSlope)}`} /></div><div className="bg-elevated border border-default rounded-md p-4 text-center"><div className="text-secondary text-sm mb-2">As h → 0, the secant becomes the tangent:</div><MathTex display tex={`s'(t) = \\lim_{h \\to 0} \\frac{s(t+h) - s(t)}{h} = ${fmt(exactSlope)}`} /></div>{derivLatex&&<div className="bg-elevated border border-default rounded-md p-4 text-center"><div className="text-secondary text-sm mb-2">Symbolic derivative:</div><MathTex display tex={`s'(t) = ${derivLatex}`} /></div>}</div></Panel>
    <Panel><SectionTitle subtitle="How close is the secant slope to the true derivative?">Convergence</SectionTitle><div className="grid grid-cols-2 gap-3 mb-4"><StatCard label="Secant slope" value={fmt(secantSlope)} color={COLORS.velocity}/><StatCard label="Exact s'(t)" value={fmt(exactSlope)} color={COLORS.tangent}/><StatCard label="Error" value={Number.isFinite(secantError)?secantError.toExponential(2):'undefined'} color={Number.isFinite(secantError)&&secantError<0.01?COLORS.velocity:COLORS.warning}/><StatCard label="h" value={h.toString()} color={COLORS.selected}/></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-default"><th className="text-left py-2 px-2 text-secondary font-medium">h</th><th className="text-right py-2 px-2 text-secondary font-medium">Secant slope</th><th className="text-right py-2 px-2 text-secondary font-medium">Exact</th><th className="text-right py-2 px-2 text-secondary font-medium">Error</th></tr></thead><tbody>{H_STEPS.map((hVal,i)=>{const slope=centralDifference(fn,t0+hVal/2,hVal);const err=Number.isFinite(slope)&&Number.isFinite(exactSlope)?Math.abs(slope-exactSlope):NaN;return <tr key={hVal} className={`border-b border-default ${i===hIndex?'bg-[var(--accent)]/10':''}`}><td className="py-1.5 px-2 font-mono text-secondary">{hVal}</td><td className="py-1.5 px-2 font-mono text-right">{fmt(slope)}</td><td className="py-1.5 px-2 font-mono text-right text-secondary">{fmt(exactSlope)}</td><td className="py-1.5 px-2 font-mono text-right text-secondary">{Number.isFinite(err)?err.toExponential(2):'undefined'}</td></tr>})}</tbody></table></div></Panel></div>
  </div>;
}
