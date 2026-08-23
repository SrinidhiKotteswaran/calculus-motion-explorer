import { useState } from 'react';
import { Activity, BookOpen, FlaskConical, LineChart, Sigma, Trophy } from 'lucide-react';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useCalculus } from './lib/useCalculus';
import { ExploreMode } from './components/ExploreMode';
import { SecantTangentMode } from './components/SecantTangentMode';
import { NumericsMode } from './components/NumericsMode';
import { AnalyzeMode } from './components/AnalyzeMode';
import { IntegrateMode } from './components/IntegrateMode';
import { ChallengeMode } from './components/ChallengeMode';

type Mode = 'explore' | 'secant' | 'numerics' | 'analyze' | 'integrate' | 'challenge';
const nav = [
  { id: 'explore' as Mode, label: 'Explore', icon: Activity },
  { id: 'secant' as Mode, label: 'Secant → Tangent', icon: LineChart },
  { id: 'numerics' as Mode, label: 'Numerics', icon: FlaskConical },
  { id: 'analyze' as Mode, label: 'Analyze', icon: Sigma },
  { id: 'integrate' as Mode, label: 'Integrate', icon: BookOpen },
  { id: 'challenge' as Mode, label: 'Challenge', icon: Trophy },
];

function AppContent() {
  const [mode, setMode] = useState<Mode>('explore');
  const state = useCalculus();
  const current = nav.find((item) => item.id === mode);
  return <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
    <header className="sticky top-0 z-20 border-b border-default" style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center justify-between gap-5">
        <button aria-label="Go to Motion Explorer" onClick={() => setMode('explore')} className="flex items-center gap-3 text-left"><div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}><Activity size={18} color="white"/></div><div><div className="font-semibold tracking-tight">Motion Explorer</div><div className="text-[10px] uppercase tracking-[0.18em] text-secondary">Calculus laboratory</div></div></button>
        <nav aria-label="Calculus modes" className="hidden lg:flex items-center gap-1">{nav.map(item => { const Icon = item.icon; return <button key={item.id} aria-current={mode === item.id ? 'page' : undefined} onClick={() => setMode(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${mode === item.id ? 'bg-elevated text-[var(--text)]' : 'text-secondary hover:text-[var(--text)]'}`}><Icon size={15}/>{item.label}</button>; })}</nav>
        <ThemeToggle />
      </div>
      <div className="lg:hidden overflow-x-auto border-t border-default"><nav aria-label="Calculus modes" className="flex min-w-max px-4 py-2 gap-1">{nav.map(item => <button key={item.id} aria-current={mode === item.id ? 'page' : undefined} onClick={() => setMode(item.id)} className={`px-3 py-1.5 text-xs rounded-md ${mode === item.id ? 'bg-elevated text-[var(--text)]' : 'text-secondary'}`}>{item.label}</button>)}</nav></div>
    </header>
    <main className="max-w-[1400px] mx-auto px-5 py-8">
      <div className="mb-8"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-secondary mb-3"><span className="w-5 h-px" style={{background:'var(--accent)'}}/>Laboratory / {current?.label}</div><h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{mode==='explore'?'See calculus move.':current?.label}</h1><p className="mt-2 text-secondary max-w-2xl">{mode==='explore'?'Explore the relationship between position, velocity, acceleration, and higher derivatives through synchronized motion.':'A focused workspace for understanding calculus through visual evidence and computation.'}</p></div>
      {mode==='explore'&&<ExploreMode state={state}/>} {mode==='secant'&&<SecantTangentMode/>} {mode==='numerics'&&<NumericsMode/>} {mode==='analyze'&&<AnalyzeMode/>} {mode==='integrate'&&<IntegrateMode/>} {mode==='challenge'&&<ChallengeMode/>}
    </main>
    <footer className="max-w-[1400px] mx-auto px-5 py-8 border-t border-default text-xs text-secondary flex justify-between"><span>Motion Explorer · Computational calculus</span><span>Built for investigation, not memorization.</span></footer>
  </div>;
}

export default function App() { return <ThemeProvider><ErrorBoundary><AppContent /></ErrorBoundary></ThemeProvider>; }
