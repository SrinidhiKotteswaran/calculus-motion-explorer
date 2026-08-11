import { useState } from 'react';
import { RefreshCw, Check, Lightbulb } from 'lucide-react';
import { Panel, SectionTitle, Button } from './ui';
import { generateProblem, type Problem } from '../lib/analysis';

export function ChallengeMode() {
  const [problem, setProblem] = useState<Problem>(() => generateProblem());
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const submit = () => setSubmitted(true);
  const correct = submitted && Math.abs(parseFloat(answer) - problem.answer) <= problem.tolerance;
  const next = () => { setProblem(generateProblem()); setAnswer(''); setSubmitted(false); setShowHint(false); };
  return <div className="max-w-3xl space-y-6"><Panel><SectionTitle subtitle="Procedurally generated questions connect symbolic derivatives to motion reasoning.">Challenge Laboratory</SectionTitle><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-secondary">Motion problem</span><Button size="sm" onClick={next}><RefreshCw size={14}/> New problem</Button></div><div className="mt-5 p-5 bg-elevated border border-default rounded-md"><p className="text-base leading-7">{problem.question}</p></div><div className="mt-5 flex gap-2"><input aria-label="Your answer" type="number" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Enter t"/><Button variant="primary" onClick={submit}><Check size={14}/> Check answer</Button></div>{submitted && <div className={`mt-4 p-4 rounded-md border ${correct?'border-emerald-500/40 bg-emerald-500/10':'border-red-500/40 bg-red-500/10'}`}><p className="font-medium">{correct?'Correct.':'Not quite.'}</p><p className="text-sm text-secondary mt-1">{correct?'The velocity changes sign at this time.':`The answer is approximately t = ${problem.answer.toFixed(2)}. Check where velocity changes sign.`}</p></div>}<div className="mt-4"><Button size="sm" onClick={()=>setShowHint(!showHint)}><Lightbulb size={14}/> {showHint?'Hide hint':'Show hint'}</Button>{showHint&&<p className="text-sm text-secondary mt-3 p-3 bg-elevated rounded-md">{problem.hint}</p>}</div></Panel></div>;
}
