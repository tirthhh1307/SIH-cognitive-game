import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  PhoneCall,
  Printer,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  UserRoundCog,
  Users
} from 'lucide-react';
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

function PracticeTrendGraph({ attempts = [] }) {
  const recentAttempts = useMemo(() => {
    return [...attempts].slice(-15);
  }, [attempts]);

  if (!recentAttempts.length) {
    return (
      <div className="practice-graph-empty">
        <Activity size={32} />
        <p>No practice sessions recorded yet. Play games to track longitudinal progress.</p>
      </div>
    );
  }

  const scores = recentAttempts.map(a => Number.isFinite(a.score) ? a.score : (a.accuracy || 0));
  const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const maxScore = 100;

  // Chart dimensions
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = recentAttempts.map((att, idx) => {
    const x = paddingX + (idx / Math.max(1, recentAttempts.length - 1)) * chartW;
    const scoreVal = Number.isFinite(att.score) ? att.score : (att.accuracy || 0);
    const y = paddingY + chartH - (scoreVal / maxScore) * chartH;
    return { x, y, score: scoreVal, gameId: att.gameId, date: att.completedAt.slice(5, 10) };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${paddingY + chartH} ${polylinePoints} ${points[points.length - 1].x},${paddingY + chartH}`;

  return (
    <div className="practice-graph-wrapper">
      <div className="graph-meta-header">
        <div className="graph-stat-badge">
          <span>Overall Accuracy</span>
          <strong>{avgScore}%</strong>
        </div>
        <div className="graph-stat-badge">
          <span>Recent Sessions</span>
          <strong>{recentAttempts.length}</strong>
        </div>
        <div className="graph-stat-badge">
          <span>Practice Trend</span>
          <strong className={avgScore >= 70 ? 'trend-up' : 'trend-steady'}>
            {avgScore >= 70 ? '🌟 High Engagement' : '🌿 Steady Practice'}
          </strong>
        </div>
      </div>

      <div className="practice-svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="practice-progress-svg" role="img" aria-label="Line graph of game practice accuracy over time">
          <defs>
            <linearGradient id="practiceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid horizontal lines */}
          {[0, 25, 50, 75, 100].map(level => {
            const y = paddingY + chartH - (level / 100) * chartH;
            return (
              <g key={level}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                <text x={paddingX - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{level}%</text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#practiceGrad)" />

          {/* Stroke line */}
          <polyline points={polylinePoints} fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="graph-point-group">
              <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#2e7d32" strokeWidth="2.5" />
              <text x={p.x} y={paddingY + chartH + 16} textAnchor="middle" fontSize="9" fill="#64748b">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="graph-caption">Visual progression across the last {recentAttempts.length} game practice sessions.</p>
    </div>
  );
}

export function CaregiverDashboard({ state, anchors = [], anchorCount = 0, language = 'en', onStateChange, onStartGame, onDeleteAll }) {
  const [audience, setAudience] = useState('family');
  const [deleteText, setDeleteText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedAnchorId, setSelectedAnchorId] = useState(anchors[0]?.id || '');

  const summaries = useMemo(() => getCategorySummaries(state), [state]);
  const flags = useMemo(() => getReviewFlags(state), [state]);
  const completedBaseline = BASELINE_GAMES.filter(id => state.attempts.some(attempt => attempt.gameId === id));
  const activeDays = new Set(state.attempts.map(attempt => attempt.completedAt.slice(0, 10))).size;
  const recentAttempts = [...state.attempts].slice(-10).reverse();
  const updateProfile = patch => onStateChange(previous => ({ ...previous, profile: { ...previous.profile, ...patch } }));
  const saveBaseline = () => onStateChange(previous => setBaselineFromAttempts(previous, BASELINE_GAMES));

  const totalSessions = state.attempts.length;
  const overallAvg = totalSessions > 0
    ? Math.round(state.attempts.reduce((sum, a) => sum + (Number.isFinite(a.score) ? a.score : (a.accuracy || 0)), 0) / totalSessions)
    : 0;

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

  const generateReportSummary = (targetAnchor) => {
    const patientName = state.profile.name || 'Loved One';
    const recentSummaryList = summaries.slice(0, 3).map(s => `${CATEGORY_LABELS[s.category] || s.category}: ${s.recentScore}%`).join('\n• ');

    return `🌿 *Apon Mon Cognitive Progress Report*\n\n` +
      `👤 *Patient:* ${patientName}\n` +
      `📅 *Report Date:* ${new Date().toLocaleDateString()}\n` +
      `🎮 *Practice Sessions:* ${totalSessions} sessions\n` +
      `⭐ *Overall Practice Accuracy:* ${overallAvg}%\n` +
      `🗓️ *Active Days:* ${activeDays} days\n` +
      `🌱 *Familiar Memory Anchors:* ${anchorCount}\n` +
      `🎯 *Baseline Completed:* ${completedBaseline.length}/5 activities\n\n` +
      `📊 *Category Highlights:*\n• ${recentSummaryList || 'Practice underway'}\n\n` +
      `❤️ _Shared with care from Apon Mon Cognitive Companion._`;
  };

  const handleCopyReport = (targetAnchor) => {
    const text = generateReportSummary(targetAnchor);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleShareWhatsApp = (anchor) => {
    const text = generateReportSummary(anchor);
    const cleanPhone = (anchor?.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = (anchor) => {
    const text = generateReportSummary(anchor);
    const cleanPhone = (anchor?.phone || '').replace(/[^0-9+]/g, '');
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  return <section className="platform-view support-view caregiver-view" aria-labelledby="caregiver-title">
    <div className="view-heading">
      <div>
        <p className="eyebrow">Explainable local insights</p>
        <h2 id="caregiver-title">{t(language, 'caregiver.title')}</h2>
        <p>{audience === 'family' ? 'A calm family view of daily activity, game progress, and memory sharing.' : 'A concise field-support view for community follow-up.'}</p>
      </div>
      <div className="audience-switch">
        <button className={audience === 'family' ? 'active' : ''} onClick={() => setAudience('family')}>Family</button>
        <button className={audience === 'asha' ? 'active' : ''} onClick={() => setAudience('asha')}>ASHA Worker</button>
      </div>
    </div>

    <div className="care-metrics">
      {[
        ['Sessions', state.attempts.length],
        ['Active days', activeDays],
        ['Accuracy Rate', `${overallAvg}%`],
        ['Memory anchors', anchorCount],
        ['Review flags', flags.length],
        ['Reports', state.reportsExported ?? 0]
      ].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
    </div>

    {/* Longitudinal Practice Progress Graph Section */}
    <section className="support-card practice-trend-card">
      <div className="card-heading-row">
        <div>
          <p className="eyebrow">Longitudinal Gameplay Progression</p>
          <h3><TrendingUp size={22} className="card-title-icon" /> Game Practice Progress &amp; Accuracy Trajectory</h3>
        </div>
      </div>
      <PracticeTrendGraph attempts={state.attempts} />
    </section>

    {/* Share Progress Report to Familiar Person Section */}
    <section className="support-card share-report-section">
      <div className="card-heading-row">
        <div>
          <p className="eyebrow">Care Circle Sharing</p>
          <h3><Share2 size={22} className="card-title-icon" /> Send Progress Report to Familiar People</h3>
        </div>
      </div>
      
      {anchors.length > 0 ? (
        <div className="share-contacts-grid">
          {anchors.map(person => (
            <div key={person.id} className="share-contact-card">
              <div className="contact-card-top">
                <div className="contact-avatar-badge">
                  <Heart size={18} color="#e91e63" />
                </div>
                <div className="contact-details">
                  <strong>{person.name}</strong>
                  <span>{person.relationship}</span>
                  {person.phone ? (
                    <small className="contact-phone"><Phone size={12} /> {person.phone}</small>
                  ) : (
                    <small className="contact-phone no-phone">No phone added</small>
                  )}
                </div>
              </div>

              <div className="contact-share-actions">
                <button
                  type="button"
                  className="share-btn whatsapp-share"
                  onClick={() => handleShareWhatsApp(person)}
                  title={`Send WhatsApp report to ${person.name}`}
                >
                  <MessageCircle size={16} /> WhatsApp Report
                </button>
                {person.phone && (
                  <button
                    type="button"
                    className="share-btn sms-share"
                    onClick={() => handleShareSMS(person)}
                    title={`Send SMS to ${person.name}`}
                  >
                    <Send size={15} /> SMS
                  </button>
                )}
                <button
                  type="button"
                  className="share-btn copy-share"
                  onClick={() => handleCopyReport(person)}
                  title="Copy formatted summary to clipboard"
                >
                  {copySuccess ? <Check size={15} color="#2e7d32" /> : <Copy size={15} />}
                  {copySuccess ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="share-empty-box">
          <Users size={32} />
          <div>
            <strong>No familiar people added yet</strong>
            <p>Go to the <strong>Memory</strong> tab to add a family member or caregiver with their phone number to send them one-click progress updates!</p>
          </div>
        </div>
      )}
    </section>

    <div className="dashboard-grid">
      <section className="support-card patient-card">
        <div className="card-heading-row">
          <div><p className="eyebrow">Patient context</p><h3>Profile</h3></div>
          <UserRoundCog size={28} />
        </div>
        <label className="stacked-field">
          <span>Name</span>
          <input value={state.profile.name} maxLength="60" onChange={event => updateProfile({ name: event.target.value })} />
        </label>
        <label className="stacked-field">
          <span>Caregiver-selected stage</span>
          <select value={state.profile.stage} onChange={event => updateProfile({ stage: event.target.value })}>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </label>
        <p className="medical-boundary">Stage is context selected by a caregiver. This app never infers or changes a diagnosis.</p>
      </section>

      <section className="support-card baseline-card">
        <div className="card-heading-row">
          <div><p className="eyebrow">Five short activities</p><h3>Baseline assessment</h3></div>
          <span className="progress-ring">{completedBaseline.length}/5</span>
        </div>
        <div className="baseline-list">
          {BASELINE_GAMES.map(id => {
            const game = getGame(id);
            const done = completedBaseline.includes(id);
            return <button key={id} className={done ? 'done' : ''} onClick={() => onStartGame(id)}>
              <span>{done ? '✓' : '○'}</span>{game.name}
            </button>;
          })}
        </div>
        <button className="game-primary-btn" disabled={completedBaseline.length < 5} onClick={saveBaseline}>
          Save baseline
        </button>
      </section>

      <section className="support-card map-card">
        <div className="card-heading-row">
          <div><p className="eyebrow">Compared with personal baseline</p><h3>Memory Gap Map</h3></div>
          <Sparkles size={27} />
        </div>
        <MemoryGapMap summaries={summaries} />
      </section>

      <section className="support-card trends-card">
        <div className="card-heading-row">
          <div><p className="eyebrow">Latest five results</p><h3>Category trends</h3></div>
          <FileText size={26} />
        </div>
        <div className="trend-list">
          {summaries.length ? summaries.map(summary => (
            <div key={summary.category}>
              <span>{CATEGORY_LABELS[summary.category] ?? summary.category}<small>{summary.attempts} sessions</small></span>
              <strong className={summary.change < 0 ? 'down' : 'up'}>
                {summary.recentScore}%{summary.change === null ? '' : ` (${summary.change >= 0 ? '+' : ''}${summary.change})`}
              </strong>
            </div>
          )) : <p className="muted-copy">Play games to build personal trends.</p>}
        </div>
      </section>
    </div>

    {flags.length > 0 && (
      <section className="review-alert">
        <AlertTriangle size={26} />
        <div>
          <h3>Consider checking in</h3>
          <p>Recent results changed from this person’s baseline. Consider checking in or sharing the report with a qualified clinician.</p>
          <small>{flags.map(flag => CATEGORY_LABELS[flag.category]).join(', ')}</small>
        </div>
      </section>
    )}

    <div className="dashboard-grid lower-dashboard">
      <section className="support-card">
        <p className="eyebrow">Recent activity</p>
        <h3>Last sessions</h3>
        <div className="activity-list">
          {recentAttempts.length ? recentAttempts.map(attempt => (
            <div key={attempt.id}>
              <span>{getGame(attempt.gameId)?.name ?? attempt.gameId}<small>{new Date(attempt.completedAt).toLocaleDateString()}</small></span>
              <strong>{attempt.score}%</strong>
            </div>
          )) : <p className="muted-copy">No completed sessions yet.</p>}
        </div>
      </section>

      <section className="support-card">
        <p className="eyebrow">Care circle</p>
        <h3>Shared support progress</h3>
        <div className="care-progress">
          <label>Memory anchors <progress max="3" value={Math.min(anchorCount, 3)} /></label>
          <label>Daily check-ins <progress max="7" value={Math.min(state.checkIns.length, 7)} /></label>
        </div>
        <p className="medical-boundary">Progress celebrates participation. No leaderboard or penalty.</p>
      </section>

      <section className="support-card report-card">
        <p className="eyebrow">Portable &amp; readable</p>
        <h3>Reports</h3>
        <button className="icon-text-btn report-btn" onClick={() => window.print()}>
          <Printer size={19} />Print report
        </button>
        <button className="icon-text-btn report-btn" onClick={downloadReport}>
          <Download size={19} />Export local JSON
        </button>
        <p className="medical-boundary">Reports support conversations; they are not clinical diagnoses.</p>
      </section>
    </div>

    <section className="demo-services">
      <h3>Connected-care roadmap</h3>
      <div className="demo-grid">
        {[[MessageSquareText, 'SMS / IVR updates', 'Missed reminder summaries'], [MapPin, 'Wandering geofence', 'Wearable or phone boundary alert'], [PhoneCall, 'Telehealth bridge', 'Connect with a qualified clinician']].map(([Icon, title, copy]) => (
          <article key={title}>
            <span className="demo-badge">Demo — no live service connected</span>
            <Icon size={28} />
            <h4>{title}</h4>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="privacy-danger support-card">
      <div>
        <p className="eyebrow">Local privacy controls</p>
        <h3><ShieldCheck size={22} />Your device owns this data</h3>
        <p>Export first if you want a copy. Deletion cannot be undone.</p>
      </div>
      <div>
        <label className="stacked-field">
          <span>Type DELETE to erase local records and media</span>
          <input value={deleteText} onChange={event => setDeleteText(event.target.value)} />
        </label>
        <button className="danger-btn" disabled={deleteText !== 'DELETE'} onClick={onDeleteAll}>
          <Trash2 size={19} />Delete all local data
        </button>
      </div>
    </section>
  </section>;
}

