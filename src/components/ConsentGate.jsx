import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { LANGUAGES, t } from '../data/i18n';

export function ConsentGate({ onAccept, language = 'en', onLanguageChange }) {
  return (
    <div className="consent-backdrop" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <section className="consent-card">
        <div className="consent-icon" aria-hidden="true"><HeartHandshake size={38} /></div>
        <div className="language-switch" aria-label="Language">{Object.entries(LANGUAGES).map(([id, label]) => <button key={id} className={language === id ? 'active' : ''} onClick={() => onLanguageChange(id)}>{label}</button>)}</div>
        <p className="eyebrow">{t(language, 'consent.eyebrow')}</p>
        <h1 id="consent-title">{t(language, 'consent.title')}</h1>
        <div className="consent-points">
          <p><ShieldCheck size={22} aria-hidden="true" />{t(language, 'consent.local')}</p>
          <p><ShieldCheck size={22} aria-hidden="true" />{t(language, 'consent.medical')}</p>
        </div>
        <button className="game-primary-btn consent-accept" onClick={onAccept} autoFocus>
          {t(language, 'consent.accept')}
        </button>
        <p className="consent-note">Close this page if you do not want information saved locally.</p>
      </section>
    </div>
  );
}
