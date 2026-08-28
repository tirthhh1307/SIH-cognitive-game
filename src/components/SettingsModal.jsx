import React, { useState } from 'react';
import { X, Volume2, Eye, Type, User, Sparkles, Check, Play, Square, Languages, Image as ImageIcon } from 'lucide-react';
import { playClickSound, setSoundVolume, setNatureVolume, startNatureAmbience, stopNatureAmbience } from '../utils/audio';
import { setVoiceEnabled, speakText } from '../utils/speech';
import { LANGUAGES } from '../data/i18n';
import { SCENIC_BACKGROUNDS } from '../data/scenicBackgrounds';
import { AVATAR_OPTIONS, getAvatarSrc } from '../data/avatars';

export function SettingsModal({
  onClose,
  playerName,
  setPlayerName,
  avatar = '/avatars/avatar_apoi.jpg',
  setAvatar,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  voiceEnabled,
  setVoiceEnabledState,
  stars,
  language,
  setLanguage,
  scenicBackgroundIndex = 0,
  setScenicBackgroundIndex,
  scenicAutoSlide = true,
  setScenicAutoSlide
}) {
  const [sfxVol, setSfxVol] = useState(80);
  const [natureVol, setNatureVolState] = useState(50);
  const [isNatureRunning, setIsNatureRunning] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSfxChange = (e) => {
    const val = Number(e.target.value);
    setSfxVol(val);
    setSoundVolume(val / 100);
  };

  const handleNatureChange = (e) => {
    const val = Number(e.target.value);
    setNatureVolState(val);
    setNatureVolume(val / 100);
  };

  const handleToggleNature = () => {
    playClickSound();
    if (isNatureRunning) {
      stopNatureAmbience();
      setIsNatureRunning(false);
    } else {
      startNatureAmbience();
      setIsNatureRunning(true);
    }
  };

  const handleVoiceToggle = () => {
    playClickSound();
    const nextVal = !voiceEnabled;
    setVoiceEnabledState(nextVal);
    setVoiceEnabled(nextVal);
    if (nextVal) {
      speakText("Voice assistance is now turned on. Welcome!", null, language);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      playClickSound();
      speakText(`Welcome, ${tempName.trim()}!`, null, language);
    }
  };

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">⚙️</span>
            <div>
              <h2 className="modal-title" id="settings-title">Settings & Accessibility</h2>
              <p className="modal-subtitle">Customize audio, text size, and preferences</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close" autoFocus>
            <X size={24} />
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <h3 className="section-heading"><Languages size={20} /> Language</h3>
            <div className="font-buttons-group">
              {Object.entries(LANGUAGES).map(([id, label]) => (
                <button key={id} type="button" className={`font-opt-btn ${language === id ? 'selected' : ''}`} onClick={() => setLanguage(id)}>{label}</button>
              ))}
            </div>
            <p className="toggle-desc">Assamese is a pilot pack. On-screen text remains available when an Assamese device voice is not installed.</p>
          </div>

          <div className="settings-section">
            <h3 className="section-heading">
              <User size={20} /> Player Character & Avatar
            </h3>
            <div className="settings-avatar-row">
              <div className="settings-avatar-preview">
                <img src={getAvatarSrc(avatar)} alt={tempName} />
              </div>
              <form onSubmit={handleSaveProfile} className="profile-edit-row">
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)}
                  placeholder="Enter player name"
                  className="name-input"
                  maxLength={20}
                />
                <button type="submit" className="save-name-btn">
                  <Check size={18} /> Update
                </button>
              </form>
            </div>
            
            <div className="settings-avatar-grid">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = avatar === av.src || (av.id === 'apoi' && (!avatar || avatar === '/avatar_apoi.jpg'));
                return (
                  <button
                    key={av.id}
                    type="button"
                    className={`settings-avatar-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playClickSound();
                      if (setAvatar) setAvatar(av.src);
                      if (!tempName || tempName === 'Apoi' || tempName === 'Player') {
                        setTempName(av.defaultName);
                        setPlayerName(av.defaultName);
                      }
                    }}
                    title={av.style}
                  >
                    <img src={av.src} alt={av.name} />
                    <span>{av.defaultName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-heading">
              <Volume2 size={20} /> Sound & Music
            </h3>
            
            <div className="control-row">
              <label>Game Sound Effects ({sfxVol}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sfxVol} 
                onChange={handleSfxChange} 
                className="range-slider"
              />
            </div>

            <div className="control-row">
              <label>Nature River Stream ({natureVol}%)</label>
              <div className="nature-slider-group">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={natureVol} 
                  onChange={handleNatureChange} 
                  className="range-slider"
                />
                <button 
                  type="button" 
                  className={`ambient-toggle-btn ${isNatureRunning ? 'active' : ''}`}
                  onClick={handleToggleNature}
                >
                  {isNatureRunning ? <Square size={16} /> : <Play size={16} />}
                  {isNatureRunning ? "Stop Stream" : "Play Stream"}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-heading">
              <Eye size={20} /> Accessibility
            </h3>

            <div className="toggle-row">
              <div>
                <strong>Voice Assistance (Read Aloud)</strong>
                <p className="toggle-desc">Speaks instructions and stories aloud automatically</p>
              </div>
              <button 
                type="button" 
                className={`switch-toggle ${voiceEnabled ? 'on' : 'off'}`}
                onClick={handleVoiceToggle}
              >
                <div className="toggle-handle"></div>
              </button>
            </div>

            <div className="toggle-row">
              <div>
                <strong>High Contrast Mode</strong>
                <p className="toggle-desc">Enhances text borders and color contrast for easy reading</p>
              </div>
              <button 
                type="button" 
                className={`switch-toggle ${highContrast ? 'on' : 'off'}`}
                onClick={() => {
                  playClickSound();
                  setHighContrast(!highContrast);
                }}
              >
                <div className="toggle-handle"></div>
              </button>
            </div>

            <div className="font-size-row">
              <label><Type size={18} /> Text Size:</label>
              <div className="font-buttons-group">
                <button 
                  className={`font-opt-btn ${fontSize === 'normal' ? 'selected' : ''}`}
                  onClick={() => { playClickSound(); setFontSize('normal'); }}
                >
                  Normal
                </button>
                <button 
                  className={`font-opt-btn ${fontSize === 'large' ? 'selected' : ''}`}
                  onClick={() => { playClickSound(); setFontSize('large'); }}
                >
                  Large (A+)
                </button>
                <button 
                  className={`font-opt-btn ${fontSize === 'xl' ? 'selected' : ''}`}
                  onClick={() => { playClickSound(); setFontSize('xl'); }}
                >
                  Extra Large (A++)
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-heading">
              <ImageIcon size={20} /> {language === 'as' ? 'প্ৰাকৃতিক পটভূমি (Scenic Views)' : 'Scenic Backgrounds'}
            </h3>
            
            <div className="toggle-row" style={{ marginBottom: '14px' }}>
              <div>
                <strong>{language === 'as' ? 'স্বয়ংক্রিয় দৃশ্য সলনি (Auto-Cycle)' : 'Auto-Cycle Peaceful Backgrounds (Default)'}</strong>
                <p className="toggle-desc">
                  {language === 'as' ? 'শান্ত দৃশ্যসমূহ নিজে নিজে মসৃণভাৱে সলনি হৈ থাকিব' : 'Automatically rotates through all 6 scenic views with smooth, peaceful crossfades'}
                </p>
              </div>
              <button 
                type="button" 
                className={`switch-toggle ${scenicAutoSlide ? 'on' : 'off'}`}
                onClick={() => {
                  playClickSound();
                  if (setScenicAutoSlide) setScenicAutoSlide(!scenicAutoSlide);
                }}
                aria-label="Toggle scenic background auto cycle"
              >
                <div className="toggle-handle"></div>
              </button>
            </div>

            <p className="toggle-desc" style={{ marginBottom: '8px' }}>
              {language === 'as' ? 'অথবা এটা নিৰ্দিষ্ট দৃশ্য বাছি লওক:' : 'Or choose a specific scenic view:'}
            </p>
            <div className="scenic-settings-grid">
              {SCENIC_BACKGROUNDS.map((bg, idx) => {
                const isSelected = idx === scenicBackgroundIndex;
                const bgTitle = language === 'as' && bg.nameAs ? bg.nameAs : bg.name;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    className={`scenic-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playClickSound();
                      if (setScenicBackgroundIndex) setScenicBackgroundIndex(idx);
                    }}
                  >
                    <div className="scenic-choice-thumb" style={{ backgroundImage: `url('${bg.url}')` }}>
                      {isSelected && <span className="scenic-choice-check"><Check size={14} /></span>}
                    </div>
                    <span className="scenic-choice-title">{bgTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-heading">
              <Sparkles size={20} /> Star Collection ({stars} Stars)
            </h3>
            <p className="stars-summary">You are doing fantastic! Keep playing daily to grow your garden and mind.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
