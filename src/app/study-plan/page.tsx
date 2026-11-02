"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./study-plan.module.css";
import { RenderQuizMath } from "../../lib/renderQuizMath";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../firebase";
import { DEFAULT_PREFERENCES, GOALS, type StudyPlan, type StudyPreferences } from "../../lib/studyPlan";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const panel = styles.panel;
export default function StudyPlanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [preferences, setPreferences] = useState<StudyPreferences>(DEFAULT_PREFERENCES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  useEffect(() => onAuthStateChanged(auth, current => {
    requestId.current++;
    setUser(current); setAuthReady(true); setPlan(null); setError(""); setBusy(false);
  }), []);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const id = ++requestId.current;
    async function load() {
      setBusy(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/study-plan", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!cancelled && id === requestId.current) { setPlan(data); setPreferences(data.preferences); }
      } catch (e) {
        if (!cancelled && id === requestId.current) setError(e instanceof Error ? e.message : "Unable to load your plan.");
      } finally { if (!cancelled && id === requestId.current) setBusy(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [user]);
  async function update(body: object) {
    if (!user || busy) return;
    const id = ++requestId.current;
    setBusy(true); setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/study-plan", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (id === requestId.current) { setPlan(data); setPreferences(data.preferences); }
    } catch (e) { if (id === requestId.current) setError(e instanceof Error ? e.message : "Unable to save your plan."); }
    finally { if (id === requestId.current) setBusy(false); }
  }
  if (!authReady) return <main className={styles.page} aria-busy="true">Loading…</main>;
  if (!user) return <main className={styles.page}><div className={`${panel} max-w-xl mx-auto`}><h1 className="text-3xl font-bold mb-4">Your study plan</h1><p className="mb-5">Sign in to build a plan from your quizzes and save your progress.</p><Link className="tg-btn inline-block" href="/auth">Sign in</Link></div></main>;
  const next = plan?.sessions.find(s => !s.completed);
  return <main className={styles.page}><div className={styles.container}>
    <div className="mb-8"><p className="text-[#4f8ef7] text-sm mb-2">YOUR NEXT STEP</p><h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Your physics study plan</h1><p className="text-zinc-400">A week of focused sessions, built from your quiz results and available time.</p></div>
    {error && <div role="alert" className="mb-6 border border-red-900 rounded-xl p-4 text-red-300">{error} <button className="underline ml-2" onClick={() => void update({})} disabled={busy}>Retry</button></div>}
    <form className={`${panel} mb-7`} onSubmit={e => { e.preventDefault(); void update({ preferences }); }}>
      <h2 className="text-xl text-white font-semibold mb-5">Make room for studying</h2>
      <fieldset disabled={busy} className="grid sm:grid-cols-3 gap-5 disabled:opacity-60">
        <label className="flex flex-col gap-2">Goal<select className="bg-zinc-900 border border-zinc-700 rounded-lg p-3" value={preferences.goal} onChange={e => setPreferences(p => ({ ...p, goal: e.target.value as StudyPreferences["goal"] }))}>{GOALS.map(goal => <option key={goal}>{goal}</option>)}</select></label>
        <label className="flex flex-col gap-2">Minutes per session<input className="bg-zinc-900 border border-zinc-700 rounded-lg p-3" type="number" min={15} max={120} required value={preferences.minutes} onChange={e => setPreferences(p => ({ ...p, minutes: Number(e.target.value) }))}/></label>
        <label className="flex flex-col gap-2">Timezone<input className="bg-zinc-900 border border-zinc-700 rounded-lg p-3" required value={preferences.timezone} onChange={e => setPreferences(p => ({ ...p, timezone: e.target.value }))}/></label>
        <div className="sm:col-span-3"><p className="mb-3">Study days</p><div className="flex flex-wrap gap-3">{weekdays.map((day, index) => <label key={day} className="flex gap-2 items-center border border-zinc-700 rounded-lg px-3 py-2"><input type="checkbox" checked={preferences.days.includes(index)} onChange={e => setPreferences(p => ({ ...p, days: e.target.checked ? [...p.days, index].sort() : p.days.filter(d => d !== index) }))}/>{day}</label>)}</div></div>
        <button className="tg-btn justify-self-start sm:col-span-3" type="submit" disabled={!preferences.days.length}>{busy ? "Updating…" : "Save and update plan"}</button>
      </fieldset>
    </form>
    {busy && !plan && <p role="status">Building your study sessions…</p>}
    {plan && <>
      <section className={`${panel} mb-7 border-[#4f8ef7]/40`}>
        <p className="text-sm text-[#4f8ef7] mb-2">{plan.provisional ? "PROVISIONAL PLAN" : "YOUR CURRENT FOCUS"}</p>
        <h2 className="text-2xl text-white font-semibold mb-3">{next ? next.title : "Your scheduled sessions are complete"}</h2>
        <p className="text-zinc-400 mb-4">{plan.matchedCount ? `Based on ${plan.matchedCount} usable quiz attempt(s) for your selected goal.` : "No usable quiz evidence for this goal yet. Start with a diagnostic; untested topics are not weaknesses."} {plan.provisional && "More quizzes will help refine your plan."}</p>
        {next && <Link href={next.lessonId} className="tg-btn inline-block">Open next lesson →</Link>}
        <p className="text-xs text-zinc-500 mt-4">Updated {new Date(plan.generatedAt).toLocaleString()} · Dates in {plan.preferences.timezone}. Uses up to 200 recent saved attempts and 200 legacy records per older storage format. New quizzes update future sessions when you return.</p>
        {plan.historyCount > plan.matchedCount && <p className="text-xs text-zinc-500 mt-2">Some history belongs to other goals or lacks a recognizable topic or complete score; it is kept in your history.</p>}
      </section>
      <div className="flex items-center justify-between mb-5"><h2 className="text-xl text-white font-semibold">Your sessions</h2><Link href="/quiz-history" className="text-[#4f8ef7] underline">Quiz evidence</Link></div>
      {!plan.sessions.length && <p className={panel}>No eligible lessons found. <Link href="/rout" className="underline">Explore the training hub</Link> to take a diagnostic.</p>}
      <div className="grid gap-5">{plan.sessions.map(session => <article key={session.id} className={panel}>
        <div className="flex flex-wrap justify-between gap-3 mb-3"><p className="text-sm text-[#4f8ef7]">{session.date} · {session.kind} · {session.blocks.reduce((n,b) => n+b.minutes,0)} min</p><label className="flex gap-2 items-center text-sm"><input disabled={busy} type="checkbox" checked={session.completed} onChange={e => void update({ sessionId: session.id, completed: e.target.checked })}/>Completed</label></div>
        <h3 className="text-xl text-white font-semibold mb-3">{session.title}</h3><p className="text-zinc-400 mb-5">{session.reason}</p>
        <ol className="space-y-3 mb-5">{session.blocks.map((block, i) => <li key={i} className="flex gap-3"><span className="shrink-0 text-[#4f8ef7] text-sm w-14">{block.minutes} min</span><span className="min-w-0 overflow-x-auto"><RenderQuizMath text={block.activity}/></span></li>)}</ol>
        <p className="text-sm border-t border-zinc-800 pt-4 mb-4"><strong>Checkpoint: </strong>{session.checkpoint}</p>
        <div className="flex flex-wrap gap-5 text-[#4f8ef7]"><Link href={session.lessonId} className="underline">Lesson and focused quiz →</Link>{session.resource && <a href={session.resource.url} target="_blank" rel="noopener noreferrer" className="underline">{session.resource.title} ↗</a>}</div>
      </article>)}</div>
    </>}
  </div></main>;
}
