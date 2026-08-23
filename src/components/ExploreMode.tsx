import { useMemo, useState } from 'react';
import { Graph } from './Graph';
import { ParticleTrack } from './ParticleTrack';
import { Math as MathTex } from './Math';
import { Panel, SectionTitle, FunctionInput, PlaybackControls, Slider, StatCard, Button } from './ui';
import { PRESETS } from '../lib/useCalculus';
import { COLORS, UNITS } from '../lib/colors';
import type { CalculusState } from '../lib/useCalculus';

function displayValue(value: number, digits = 3): string {
  return Number.isFinite(value) ? value.toFixed(digits) : 'undefined';
}

export function ExploreMode({ state }: { state: CalculusState }) {
  const { input, setInput, error, fn, derivatives, derivativeLatex, t, setT, tRange, setTRange, playing, setPlaying, speed, setSpeed, reset, derivativeValues } = state;
  const [showDerivativeOrder, setShowDerivativeOrder] = useState(1);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const displayT = hoverT ?? t;

  const domains = useMemo(() => {
    const computeDomain = (f: (t: number) => number): [number, number] => {
      let min = Infinity;
      let max = -Infinity;
      const steps = 300;
      for (let i = 0; i <= steps; i++) {
        const tv = tRange[0] + (i / steps) * (tRange[1] - tRange[0]);
        const y = f(tv);
        if (Number.isFinite(y)) { min = Math.min(min, y); max = Math.max(max, y); }
      }
      if (!Number.isFinite(min) || !Number.isFinite(max)) return [-1, 1];
      if (min === max) { const pad = Math.max(1, Math.abs(min) * 0.15); return [min - pad, max + pad]; }
      const pad = Math.max(0.5, (max - min) * 0.15);
      return [min - pad, max + pad];
    };
    return derivatives.slice(0, 4).map(computeDomain);
  }, [derivatives, tRange]);

  const activeDerivatives = derivatives.slice(0, showDerivativeOrder + 1);
  const activeDomains = domains.slice(0, showDerivativeOrder + 1);
  const activeLabels = ['Position s(t)', 'Velocity v(t)', 'Acceleration a(t)', 'Jerk j(t)'].slice(0, showDerivativeOrder + 1);
  const activeColors = [COLORS.position, COLORS.velocity, COLORS.acceleration, COLORS.warning].slice(0, showDerivativeOrder + 1);
  const activeUnits = [UNITS.position, UNITS.velocity, UNITS.acceleration, UNITS.jerk].slice(0, showDerivativeOrder + 1);

  const v = derivativeValues[1];
  const a = derivativeValues[2];
  const j = derivativeValues[3];
  const safeT = Number.isFinite(displayT) ? displayT : tRange[0];

  return (
    <div className="space-y-6">
      <Panel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><FunctionInput value={input} onChange={setInput} error={error} presets={PRESETS} onPreset={setInput} /></div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">t min</label>
                <input type="number" value={tRange[0]} step={0.5} onChange={(e) => setTRange([Number(e.target.value), tRange[1]])} />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">t max</label>
                <input type="number" value={tRange[1]} step={0.5} onChange={(e) => setTRange([tRange[0], Number(e.target.value)])} />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-secondary">The range is kept valid automatically.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <PlaybackControls playing={playing} onPlayPause={() => setPlaying(!playing)} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
          <div className="flex-1 min-w-[200px]"><Slider label="Time t" value={t} min={tRange[0]} max={tRange[1]} step={0.01} onChange={setT} valueDisplay={`t = ${displayT.toFixed(2)} s`} /></div>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-secondary uppercase tracking-wider mr-2">Derivative order</span>
          {[{ n: 0, label: 's(t)', desc: 'Position' }, { n: 1, label: "s'(t)", desc: 'Velocity' }, { n: 2, label: "s''(t)", desc: 'Acceleration' }, { n: 3, label: "s'''(t)", desc: 'Jerk' }].map((d) => (
            <Button key={d.n} active={showDerivativeOrder === d.n} onClick={() => setShowDerivativeOrder(d.n)} size="sm">{d.desc} ({d.label})</Button>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle subtitle="The particle moves along the track according to s(t). Green arrow = velocity, purple arrow = acceleration.">Particle Motion</SectionTitle>
        <ParticleTrack position={safeT} velocity={Number.isFinite(v) ? v : 0} acceleration={Number.isFinite(a) ? a : 0} minT={tRange[0]} maxT={tRange[1]} playing={playing} />
      </Panel>

      <div className="space-y-3">
        {activeDerivatives.map((dFn, i) => (
          <Panel key={i}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: activeColors[i] }} /><h3 className="text-sm font-semibold" style={{ color: activeColors[i] }}>{activeLabels[i]}</h3></div>
              {i > 0 && <div className="text-xs text-secondary font-mono"><MathTex tex={derivativeLatex[i]} /></div>}
            </div>
            <Graph curves={[{ fn: dFn, color: activeColors[i], width: 2.5 }]} markers={Number.isFinite(dFn(safeT)) ? [{ t: safeT, y: dFn(safeT), color: COLORS.selected, size: 5 }] : []} vLines={[{ t: safeT, color: COLORS.selected }]} xDomain={tRange} yDomain={activeDomains[i]} xLabel="t (s)" yLabel={activeUnits[i]} height={200} onHover={setHoverT} cursorT={t} cursorColor={COLORS.selected} />
          </Panel>
        ))}
      </div>

      <Panel>
        <SectionTitle subtitle="Values at the current time t. Undefined values are shown explicitly rather than as zero.">Live Measurements at t = {safeT.toFixed(3)} s</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Position s(t)" value={displayValue(fn(safeT))} unit="m" color={COLORS.position} />
          <StatCard label="Velocity v(t)" value={displayValue(v)} unit="m/s" color={COLORS.velocity} />
          <StatCard label="Acceleration a(t)" value={displayValue(a)} unit="m/s²" color={COLORS.acceleration} />
          <StatCard label="Jerk j(t)" value={displayValue(j)} unit="m/s³" color={COLORS.warning} />
        </div>
      </Panel>
    </div>
  );
}
