import React, { useState } from 'react';
import { X, Check, User, Sparkles, Heart } from 'lucide-react';
import { AVATAR_OPTIONS, getAvatarSrc } from '../data/avatars';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { speakText } from '../utils/speech';
import { t } from '../data/i18n';

export function ProfileModal({
  onClose,
  playerName,
  setPlayerName,
  currentAvatar,
  setAvatar,
  language = 'en'
}) {
  const [tempName, setTempName] = useState(playerName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '/avatars/avatar_apoi.jpg');
  const [filterGender, setFilterGender] = useState('all');

  const filteredAvatars = AVATAR_OPTIONS.filter(av => {
    if (filterGender === 'all') return true;
    return av.gender === filterGender;
  });

  const handleSelectAvatar = (av) => {
    playClickSound();
    setSelectedAvatar(av.src);
    setAvatar(av.src);
    if (!tempName || tempName === 'Apoi' || tempName === 'Player') {
      setTempName(av.defaultName);
      setPlayerName(av.defaultName);
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    playSuccessSound();
    const finalName = tempName.trim() || 'Apoi';
    setPlayerName(finalName);
    setAvatar(selectedAvatar);
    const compliments = [
      `Looking wonderful, ${finalName}!`,
      `Nice to see you, ${finalName}!`,
      `You look very lovely today, ${finalName}!`
    ];
    const greeting = compliments[Math.floor(Math.random() * compliments.length)];
    speakText(greeting, null, language);
    onClose();
  };

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="profile-modal-card" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">👵👴</span>
            <div>
              <h2 className="modal-title">Choose Your Character & Avatar</h2>
              <p className="modal-subtitle">Pick a friendly companion that looks like you or makes you happy</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close" autoFocus>
            <X size={24} />
          </button>
        </div>

        <div className="profile-modal-body">
          {/* Active Preview */}
          <div className="current-avatar-preview-banner">
            <div className="preview-avatar-circle">
              <img src={getAvatarSrc(selectedAvatar)} alt={tempName} />
            </div>
            <div className="preview-details">
              <span className="preview-greeting">Hello,</span>
              <h3 className="preview-name">{tempName || 'Player'}</h3>
              <p className="preview-status">✨ Ready to play and learn</p>
            </div>
          </div>

          {/* Name Editor */}
          <div className="profile-name-section">
            <label htmlFor="player-name-input" className="name-field-label">
              <User size={18} /> What should we call you?
            </label>
            <div className="name-input-wrapper">
              <input
                id="player-name-input"
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="profile-name-field"
                maxLength={24}
              />
              <button 
                type="button" 
                className="quick-save-name-btn"
                onClick={handleSave}
              >
                <Check size={18} /> Save
              </button>
            </div>
          </div>

          {/* Gender Filter Tabs */}
          <div className="avatar-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${filterGender === 'all' ? 'active' : ''}`}
              onClick={() => { playClickSound(); setFilterGender('all'); }}
            >
              🌸 All Characters ({AVATAR_OPTIONS.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterGender === 'female' ? 'active' : ''}`}
              onClick={() => { playClickSound(); setFilterGender('female'); }}
            >
              👵 Grandmothers & Aunties
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterGender === 'male' ? 'active' : ''}`}
              onClick={() => { playClickSound(); setFilterGender('male'); }}
            >
              👴 Grandfathers & Uncles
            </button>
          </div>

          {/* Avatar Gallery */}
          <div className="avatar-gallery-grid">
            {filteredAvatars.map((av) => {
              const isSelected = selectedAvatar === av.src || (av.id === 'apoi' && selectedAvatar === '/avatar_apoi.jpg');
              return (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectAvatar(av)}
                  aria-pressed={isSelected}
                >
                  <div className="avatar-card-image-box">
                    <img src={av.src} alt={av.name} />
                    {isSelected && (
                      <span className="avatar-selected-badge">
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="avatar-card-info">
                    <h4>{av.defaultName}</h4>
                    <span className="avatar-style-tag">{av.style}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="profile-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="profile-confirm-btn" onClick={handleSave}>
            <Heart size={18} /> Apply Character
          </button>
        </div>
      </div>
    </div>
  );
}
