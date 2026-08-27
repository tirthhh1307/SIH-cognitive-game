import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playStarSound, playXylophoneNote, playDrumBeat } from '../../utils/audio';
import { speakText } from '../../utils/speech';

const XYLOPHONE_KEYS = [
  { note: 'Sa', letter: 'C4', freq: 261.63, color: '#EF5350', height: 160 },
  { note: 'Re', letter: 'D4', freq: 293.66, color: '#FFA726', height: 148 },
  { note: 'Ga', letter: 'E4', freq: 329.63, color: '#FFEE58', height: 136 },
  { note: 'Ma', letter: 'F4', freq: 349.23, color: '#66BB6A', height: 124 },
  { note: 'Pa', letter: 'G4', freq: 392.00, color: '#26C6DA', height: 112 },
  { note: 'Dha', letter: 'A4', freq: 440.00, color: '#42A5F5', height: 100 },
  { note: 'Ni', letter: 'B4', freq: 493.88, color: '#AB47BC', height: 88 },
  { note: 'Sȧ', letter: 'C5', freq: 523.25, color: '#EC407A', height: 76 }
];

const GUIDED_TUNES = [
  {
    title: "Majuli River Melody",
    notes: [0, 1, 2, 4, 4, 2, 1, 0],
    description: "A peaceful morning tune echoing over the gentle river."
  },
  {
    title: "Bihu Joyous Greeting",
    notes: [2, 4, 5, 7, 5, 4, 2, 0],
    description: "A cheerful celebratory beat to bring a smile to your heart."
  }
];

export function MusicJoyModal({ onClose, onEarnStars }) {
  const [activeTab, setActiveTab] = useState('xylophone');
  const [activeKey, setActiveKey] = useState(null);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedSuccess, setGuidedSuccess] = useState(false);

  const handleKeyClick = (key, idx) => {
    setActiveKey(idx);
    playXylophoneNote(key.freq);
    setTimeout(() => setActiveKey(null), 250);

    if (activeTab === 'guided' && !guidedSuccess) {
      const currentTune = GUIDED_TUNES[guidedIndex];
      const expectedKeyIdx = currentTune.notes[guidedStep];

      if (idx === expectedKeyIdx) {
        const nextStep = guidedStep + 1;
        setGuidedStep(nextStep);

        if (nextStep === currentTune.notes.length) {
          setGuidedSuccess(true);
          playSuccessSound();
          playStarSound();
          confetti({ particleCount: 70, spread: 70 });
          onEarnStars(25, "Mastered Traditional Folk Melody!");
          speakText("Exquisite melody, Apoi! Your musical harmony brings such joy!");
        }
      } else {
        speakText("Follow the glowing bamboo bar!");
      }
    }
  };

  const currentTune = GUIDED_TUNES[guidedIndex];
  const targetKeyForGuided = !guidedSuccess ? currentTune.notes[guidedStep] : null;

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="game-modal-card modal-blue" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">🎵</span>
            <div>
              <h2 className="modal-title">Music & Joy</h2>
              <p className="modal-subtitle">Bamboo chimes, folk rhythms & peaceful harmony</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'xylophone' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('xylophone');
              speakText("Tap any bamboo bar to create your own peaceful chime melodies!");
            }}
          >
            🎋 Bamboo Xylophone
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guided' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('guided');
              setGuidedStep(0);
              setGuidedSuccess(false);
              speakText(`Let's play ${GUIDED_TUNES[guidedIndex].title}! Tap the glowing keys.`);
            }}
          >
            🎶 Follow the Song
          </button>
        </div>

        <div className="game-content">
          {activeTab === 'guided' && (
            <div className="instruction-box">
              <p>
                {guidedSuccess 
                  ? `🌟 You completed "${currentTune.title}"!`
                  : `🎼 Song: ${currentTune.title} (Step ${guidedStep + 1} of ${currentTune.notes.length})`}
              </p>
              <span className="song-desc">{currentTune.description}</span>
            </div>
          )}

          <div className="xylophone-wood-frame">
            <div className="xylophone-keys-row">
              {XYLOPHONE_KEYS.map((k, idx) => {
                const isTarget = activeTab === 'guided' && targetKeyForGuided === idx;
                const isPressed = activeKey === idx;

                return (
                  <button
                    key={k.note}
                    className={`xylophone-bar ${isPressed ? 'pressed' : ''} ${isTarget ? 'target-pulse' : ''}`}
                    style={{ 
                      height: `${k.height}px`,
                      '--bar-accent': k.color
                    }}
                    onClick={() => handleKeyClick(k, idx)}
                  >
                    <div className="bar-top-peg"></div>
                    <span className="bar-swara">{k.note}</span>
                    <span className="bar-letter">{k.letter}</span>
                    <div className="bar-bottom-peg"></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="folk-drums-section">
            <h4 className="section-mini-title">Traditional Rhythms & Beats</h4>
            <div className="drum-pads-row">
              <button className="drum-pad-btn dhol-bass" onClick={() => playDrumBeat('low')}>
                <span className="drum-icon">🪘</span>
                <div className="drum-info">
                  <strong>Dhol Deep Beat</strong>
                  <span>Low resonance</span>
                </div>
              </button>
              <button className="drum-pad-btn dhol-treble" onClick={() => playDrumBeat('high')}>
                <span className="drum-icon">🥁</span>
                <div className="drum-info">
                  <strong>Dhol High Chime</strong>
                  <span>Brisk snap</span>
                </div>
              </button>
            </div>
          </div>

          {activeTab === 'guided' && guidedSuccess && (
            <div className="win-action-row">
              <button 
                className="game-primary-btn"
                onClick={() => {
                  const nextIndex = (guidedIndex + 1) % GUIDED_TUNES.length;
                  setGuidedIndex(nextIndex);
                  setGuidedStep(0);
                  setGuidedSuccess(false);
                }}
              >
                <Sparkles size={20} /> Next Folk Song
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
