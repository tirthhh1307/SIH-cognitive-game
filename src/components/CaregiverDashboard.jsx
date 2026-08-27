import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, FileText, MapPin, MessageSquareText, PhoneCall, Printer, ShieldCheck, Sparkles, Trash2, UserRoundCog } from 'lucide-react';
import { CATEGORY_LABELS, GAME_CATEGORIES, getGame } from '../data/games';
import { exportPlatformData, getCategorySummaries, getReviewFlags, setBaselineFromAttempts } from '../utils/platform';
import { t } from '../data/i18n';

const BASELINE_GAMES = ['sequence-repeat', 'odd-one-out', 'tap-target', 'routine-sequence', 'family-face-match'];

function MemoryGapMap({ summaries }) {
  const values = GAME_CATEGORIES.map(category => summaries.find(summary => summary.category === category)?.recentScore ?? 0);
  const points = values.map((score, index) => {
    const angle = (Math.PI * 2 * index / values.length) - Math.PI / 2;
    const radius = 88 * score / 100;
    return `${120 + Math.cos(angle) * radius},${120 + Math.sin(angle) * radius}`;
  }).join(' ');
  return <div className="memory-map-wrap">
    <svg className="memory-map" viewBox="0 0 240 240" role="img" aria-label="Memory category scores shown as a radar map">
      {[22, 44, 66, 88].map(radius => <circle key={radius} cx="120" cy="120" r={radius} fill="none" stroke="#cbd5e1" />)}
      {values.map((_, index) => { const angle = (Math.PI * 2 * index / values.length) - Math.PI / 2; return <line key={index} x1="120" y1="120" x2={120 + Math.cos(angle) * 88} y2={120 + Math.sin(angle) * 88} stroke="#d9e2e8" />; })}
      <polygon points={points} fill="rgba(46,125,50,.28)" stroke="#2e7d32" strokeWidth="3" />
    </svg>
    <div className="memory-map-list">{GAME_CATEGORIES.map((category, index) => <div key={category}><span>{CATEGORY_LABELS[category]}</span><strong>{values[index]}%</strong></div>)}</div>
  </div>;
}

export function CaregiverDashboard({ state, anchorCount, language = 'en', onStateChange, onStartGame, onDeleteAll }) {
  const [audience, setAudience] = useState('family');
  const [deleteText, setDeleteText] = useState('');
  const summaries = useMemo(() => getCategorySummaries(state), [state]);
  const flags = useMemo(() => getReviewFlags(state), [state]);
  const completedBaseline = BASELINE_GAMES.filter(id => state.attempts.some(attempt => attempt.gameId === id));
  const activeDays = new Set(state.attempts.map(attempt => attempt.completedAt.slice(0, 10))).size;
  const recentAttempts = [...state.attempts].slice(-10).reverse();
  const updateProfile = patch => onStateChange(previous => ({ ...previous, profile: { ...previous.profile, ...patch } }));
  const saveBaseline = () => onStateChange(previous => setBaselineFromAttempts(previous, BASELINE_GAMES));

  const downloadReport = () => {
    const blob = new Blob([exportPlatformData(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apon-mon-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onStateChange(previous => ({ ...previous, reportsExported: (previous.reportsExported ?? 0) + 1 }));
  };

  return <section className="platform-view support-view caregiver-view" aria-labelledby="caregiver-title">
    <div className="view-heading"><div><p className="eyebrow">Explainable local insights</p><h2 id="caregiver-title">{t(language, 'caregiver.title')}</h2><p>{audience === 'family' ? 'A calm family view of daily activity and changes.' : 'A concise field-support view for community follow-up.'}</p></div><div className="audience-switch"><button className={audience === 'family' ? 'active' : ''} onClick={() => setAudience('family')}>Family</button><button className={audience === 'asha' ? 'active' : ''} onClick={() => setAudience('asha')}>ASHA Worker</button></div></div>
    <div className="care-metrics">{[['Sessions', state.attempts.length], ['Active days', activeDays], ['Check-ins', state.checkIns.length], ['Memory anchors', anchorCount], ['Review flags', flags.length], ['Reports', state.reportsExported ?? 0]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>

    <div className="dashboard-grid">
      <section className="support-card patient-card"><div className="card-heading-row"><div><p className="eyebrow">Patient context</p><h3>Profile</h3></div><UserRoundCog size={28} /></div><label className="stacked-field"><span>Name</span><input value={state.profile.name} maxLength="60" onChange={event => updateProfile({ name: event.target.value })} /></label><label className="stacked-field"><span>Caregiver-selected stage</span><select value={state.profile.stage} onChange={event => updateProfile({ stage: event.target.value })}><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></label><p className="medical-boundary">Stage is context selected by a caregiver. This app never infers or changes a diagnosis.</p></section>
      <section className="support-card baseline-card"><div className="card-heading-row"><div><p className="eyebrow">Five short activities</p><h3>Baseline assessment</h3></div><span className="progress-ring">{completedBaseline.length}/5</span></div><div className="baseline-list">{BASELINE_GAMES.map(id => { const game = getGame(id); const done = completedBaseline.includes(id); return <button key={id} className={done ? 'done' : ''} onClick={() => onStartGame(id)}><span>{done ? '✓' : '○'}</span>{game.name}</button>; })}</div><button className="game-primary-btn" disabled={completedBaseline.length < 5} onClick={saveBaseline}>Save baseline</button></section>
      <section className="support-card map-card"><div className="card-heading-row"><div><p className="eyebrow">Compared with personal baseline</p><h3>Memory Gap Map</h3></div><Sparkles size={27} /></div><MemoryGapMap summaries={summaries} /></section>
      <section className="support-card trends-card"><div className="card-heading-row"><div><p className="eyebrow">Latest five results</p><h3>Category trends</h3></div><FileText size={26} /></div><div className="trend-list">{summaries.length ? summaries.map(summary => <div key={summary.category}><span>{CATEGORY_LABELS[summary.category] ?? summary.category}<small>{summary.attempts} sessions</small></span><strong className={summary.change < 0 ? 'down' : 'up'}>{summary.recentScore}%{summary.change === null ? '' : ` (${summary.change >= 0 ? '+' : ''}${summary.change})`}</strong></div>) : <p className="muted-copy">Play games to build personal trends.</p>}</div></section>
    </div>

    {flags.length > 0 && <section className="review-alert"><AlertTriangle size={26} /><div><h3>Consider checking in</h3><p>Recent results changed from this person’s baseline. Consider checking in or sharing the report with a qualified clinician.</p><small>{flags.map(flag => CATEGORY_LABELS[flag.category]).join(', ')}</small></div></section>}

    <div className="dashboard-grid lower-dashboard">
      <section className="support-card"><p className="eyebrow">Recent activity</p><h3>Last sessions</h3><div className="activity-list">{recentAttempts.length ? recentAttempts.map(attempt => <div key={attempt.id}><span>{getGame(attempt.gameId)?.name ?? attempt.gameId}<small>{new Date(attempt.completedAt).toLocaleDateString()}</small></span><strong>{attempt.score}%</strong></div>) : <p className="muted-copy">No completed sessions yet.</p>}</div></section>
      <section className="support-card"><p className="eyebrow">Care circle</p><h3>Shared support progress</h3><div className="care-progress"><label>Memory anchors <progress max="3" value={Math.min(anchorCount, 3)} /></label><label>Daily check-ins <progress max="7" value={Math.min(state.checkIns.length, 7)} /></label></div><p className="medical-boundary">Progress celebrates participation. No leaderboard or penalty.</p></section>
      <section className="support-card report-card"><p className="eyebrow">Portable &amp; readable</p><h3>Reports</h3><button className="icon-text-btn report-btn" onClick={() => window.print()}><Printer size={19} />Print report</button><button className="icon-text-btn report-btn" onClick={downloadReport}><Download size={19} />Export local JSON</button><p className="medical-boundary">Reports support conversations; they are not clinical diagnoses.</p></section>
    </div>

    <section className="demo-services"><h3>Connected-care roadmap</h3><div className="demo-grid">{[[MessageSquareText, 'SMS / IVR updates', 'Missed reminder summaries'], [MapPin, 'Wandering geofence', 'Wearable or phone boundary alert'], [PhoneCall, 'Telehealth bridge', 'Connect with a qualified clinician']].map(([Icon, title, copy]) => <article key={title}><span className="demo-badge">Demo — no live service connected</span><Icon size={28} /><h4>{title}</h4><p>{copy}</p></article>)}</div></section>

    <section className="privacy-danger support-card"><div><p className="eyebrow">Local privacy controls</p><h3><ShieldCheck size={22} />Your device owns this data</h3><p>Export first if you want a copy. Deletion cannot be undone.</p></div><div><label className="stacked-field"><span>Type DELETE to erase local records and media</span><input value={deleteText} onChange={event => setDeleteText(event.target.value)} /></label><button className="danger-btn" disabled={deleteText !== 'DELETE'} onClick={onDeleteAll}><Trash2 size={19} />Delete all local data</button></div></section>
  </section>;
}
