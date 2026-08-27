import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { CONSENT_COPY } from '../data/shell';

export function ConsentGate({ onAccept }) {
  return (
    <div className="consent-backdrop" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <section className="consent-card">
        <div className="consent-icon" aria-hidden="true"><HeartHandshake size={38} /></div>
        <p className="eyebrow">Welcome to Apon Mon</p>
        <h1 id="consent-title">Your memories. Your device. Your choice.</h1>
        <div className="consent-points">
          <p><ShieldCheck size={22} aria-hidden="true" />{CONSENT_COPY.local}</p>
          <p><ShieldCheck size={22} aria-hidden="true" />{CONSENT_COPY.medical}</p>
        </div>
        <button className="game-primary-btn consent-accept" onClick={onAccept} autoFocus>
          Accept &amp; Continue
        </button>
        <p className="consent-note">Close this page if you do not want information saved locally.</p>
      </section>
    </div>
  );
}
