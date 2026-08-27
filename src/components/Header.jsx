import React, { useState } from 'react';
import { Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { GoldenDivider } from './CulturalPattern';
import { playClickSound } from '../utils/audio';

export function Header({ 
  playerName = 'Apoi', 
  stars = 120, 
  onOpenSettings, 
  onOpenProfile, 
  isMuted, 
  onToggleMute 
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  return (
    <header className="game-header">
      <button
        type="button"
        className="profile-pill" 
        onClick={() => { playClickSound(); onOpenProfile(); }}
        aria-label={`Profile for ${playerName}`}
      >
        <div className="avatar-circle">
          {avatarFailed ? '👵' : <img
            src="/avatar_apoi.jpg" 
            alt={playerName} 
            onError={() => setAvatarFailed(true)}
          />}
        </div>
        <div className="profile-text">
          <span className="greeting-text">Hello,</span>
          <span className="player-name">{playerName}</span>
        </div>
      </button>

      <div className="welcome-center">
        <h1 className="welcome-title">Welcome!</h1>
        <p className="welcome-subtitle">Let&apos;s have a fun and happy day!</p>
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
              <span className="stars-label">Stars</span>
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
