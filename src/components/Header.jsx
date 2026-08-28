import React, { useState } from 'react';
import { Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { GoldenDivider } from './CulturalPattern';
import { playClickSound } from '../utils/audio';
import { t } from '../data/i18n';
import { getAvatarSrc } from '../data/avatars';

export function Header({ 
  playerName = 'Apoi', 
  avatar = '/avatars/avatar_apoi.jpg',
  stars = 120, 
  onOpenSettings, 
  onOpenProfile, 
  isMuted, 
  onToggleMute,
  language = 'en',
  onLanguageChange
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarImageSrc = getAvatarSrc(avatar);

  return (
    <header className="game-header">
      <div className="header-left-cluster">
        <button
          type="button"
          className="profile-pill" 
          onClick={() => { playClickSound(); onOpenProfile(); }}
          aria-label={`Profile for ${playerName}`}
          title="Click to customize character and avatar"
        >
          <div className="avatar-circle">
            {avatarFailed ? '👵' : <img
              src={avatarImageSrc} 
              alt={playerName} 
              onError={() => setAvatarFailed(true)}
            />}
          </div>
          <div className="profile-text">
            <span className="greeting-text">{t(language, 'header.hello')}</span>
            <span className="player-name">{playerName}</span>
          </div>
        </button>

        {onLanguageChange && (
          <div className="header-lang-selector-box" aria-label={t(language, 'header.language')}>
            <div className="header-lang-title">
              <span className="lang-icon">🌐</span>
              <span className="lang-header-label">{t(language, 'header.language')}</span>
            </div>
            <div className="header-lang-pills">
              <button
                type="button"
                className={`lang-badge-btn ${language === 'en' ? 'active-lang' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLanguageChange('en'); }}
                title="English"
              >
                English
              </button>
              <button
                type="button"
                className={`lang-badge-btn ${language === 'as' ? 'active-lang' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLanguageChange('as'); }}
                title="অসমীয়া (Assamese)"
              >
                অসমীয়া
              </button>
              <button
                type="button"
                className={`lang-badge-btn ${language === 'hi' ? 'active-lang' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLanguageChange('hi'); }}
                title="हिन्दी (Hindi)"
              >
                हिन्दी
              </button>
              <button
                type="button"
                className={`lang-badge-btn ${language === 'mni' ? 'active-lang' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLanguageChange('mni'); }}
                title="মৈতৈলোন্ (Manipuri)"
              >
                মৈতৈলোন্
              </button>
              <button
                type="button"
                className={`lang-badge-btn ${language === 'trp' ? 'active-lang' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLanguageChange('trp'); }}
                title="ককবরক (Tripuri)"
              >
                ককবরক
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="welcome-center">
        <div className="app-brand-pill">
          <span className="brand-dot">🌱</span>
          <span className="brand-name-tag">Sanjibani</span>
          <span className="brand-badge-sub">Cognitive Companion</span>
        </div>
        <h1 className="welcome-title">{t(language, 'header.welcome')}</h1>
        <p className="welcome-subtitle">{t(language, 'header.subtitle')}</p>
        <GoldenDivider />
      </div>

      <div className="header-actions">
        <button 
          className={`quick-mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={() => { playClickSound(); onToggleMute(); }}
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="stars-settings-pill">
          <div className="stars-info">
            <div className="star-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFC107">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
            <div className="stars-text-block">
              <span className="stars-count">{stars}</span>
              <span className="stars-label">{t(language, 'header.stars')}</span>
            </div>
          </div>

          <button 
            className="settings-btn"
            onClick={() => { playClickSound(); onOpenSettings(); }}
            title="Settings & Accessibility"
            aria-label="Open Settings"
          >
            <Settings size={22} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </header>
  );
}
