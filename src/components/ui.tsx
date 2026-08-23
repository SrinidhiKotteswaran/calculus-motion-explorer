import { ReactNode } from 'react';
import { Play, Pause, RotateCcw, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card border border-default rounded-lg p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return <div className="mb-4"><h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{children}</h2>{subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">{children}</label>;
}

export function Button({ children, onClick, active = false, variant = 'default', size = 'md', className = '', disabled = false }: { children: ReactNode; onClick?: () => void; active?: boolean; variant?: 'default' | 'primary' | 'ghost'; size?: 'sm' | 'md'; className?: string; disabled?: boolean }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 select-none';
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-2 text-sm' };
  const variants = {
    default: active ? 'bg-[var(--accent)] text-white' : 'bg-elevated border border-default text-secondary hover:text-[var(--text)] hover:border-light',
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
    ghost: 'text-secondary hover:text-[var(--text)]',
  };
  return <button type="button" disabled={disabled} aria-disabled={disabled} onClick={disabled ? undefined : onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>;
}

export function PlaybackControls({ playing, onPlayPause, onReset, speed, onSpeedChange }: { playing: boolean; onPlayPause: () => void; onReset: () => void; speed: number; onSpeedChange: (s: number) => void }) {
  return <div className="flex items-center gap-2 flex-wrap"><Button onClick={onPlayPause} variant="primary" size="sm">{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pause' : 'Play'}</Button><Button onClick={onReset} size="sm"><RotateCcw size={14} />Reset</Button><div className="flex items-center gap-1 ml-1"><span className="text-xs text-secondary mr-1">Speed</span>{[0.25, 0.5, 1, 2, 4].map((s) => <button type="button" key={s} onClick={() => onSpeedChange(s)} className={`px-2 py-1 text-xs rounded transition-colors ${speed === s ? 'bg-[var(--accent)] text-white' : 'text-secondary hover:text-[var(--text)]'}`}>{s}x</button>)}</div></div>;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button type="button" onClick={toggle} className="p-2 rounded-md text-secondary hover:text-[var(--text)] transition-colors" aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>;
}

export function Slider({ value, min, max, step = 0.01, onChange, label, valueDisplay }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label?: string; valueDisplay?: string }) {
  return <div>{label && <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</span>{valueDisplay && <span className="text-xs text-secondary font-mono">{valueDisplay}</span>}</div>}<input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(parseFloat(e.target.value))} /></div>;
}

export function StatCard({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return <div className="bg-elevated border border-default rounded-md px-3 py-2.5"><div className="text-xs text-secondary uppercase tracking-wider mb-1">{label}</div><div className="text-lg font-semibold font-mono" style={{ color: color || 'var(--text)' }}>{value}{unit && <span className="text-sm text-secondary ml-1 font-normal">{unit}</span>}</div></div>;
}

export function FunctionInput({ value, onChange, error, presets, onPreset }: { value: string; onChange: (v: string) => void; error: string | null; presets?: string[]; onPreset?: (s: string) => void }) {
  return <div><Label>Function s(t)</Label><div className="flex items-center gap-2"><span className="text-secondary font-mono text-sm whitespace-nowrap">s(t) =</span><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. t^3 - 4*t^2 + 2*t" spellCheck={false} /></div>{error && <p className="text-xs mt-1.5" style={{ color: 'var(--error)' }}>{error}</p>}{presets && <div className="flex flex-wrap gap-1.5 mt-2">{presets.map((p) => <button type="button" key={p} onClick={() => onPreset?.(p)} className="text-xs px-2 py-1 rounded border border-default text-secondary hover:text-[var(--text)] hover:border-light transition-colors font-mono">{p}</button>)}</div>}</div>;
}
