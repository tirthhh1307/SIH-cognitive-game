import React, { useState } from 'react';
import { playHornbillCall, playSuccessSound } from '../utils/audio';
import { JapiOrnament } from './CulturalPattern';
import { speakText } from '../utils/speech';

export function SceneryInteractive({ onEarnStars }) {
  const [japiSpinning, setJapiSpinning] = useState(false);
  const [hornbillAction, setHornbillAction] = useState(false);
  const [birdDialogue, setBirdDialogue] = useState(null);

  const handleJapiClick = () => {
    playSuccessSound();
    setJapiSpinning(true);
    if (onEarnStars) onEarnStars(2, "Auspicious Japi spin!");
    setTimeout(() => setJapiSpinning(false), 1500);
  };

  const handleHornbillClick = () => {
    playHornbillCall();
    setHornbillAction(true);
    const messages = [
      "Kaa-ork! The morning breeze brings good health!",
      "Chirp! You have a wonderful memory, Apoi!",
      "Kaa-ork! The tea leaves are blossoming today!",
      "What a joyful day in our beautiful hills!"
    ];
    const picked = messages[Math.floor(Math.random() * messages.length)];
    setBirdDialogue(picked);
    speakText(picked);
    if (onEarnStars) onEarnStars(3, "Friendly Hornbill companion!");
    setTimeout(() => {
      setHornbillAction(false);
    }, 1200);
    setTimeout(() => {
      setBirdDialogue(null);
    }, 4500);
  };

  return (
    <div className="scenery-interactive-layer">
      <div className="petals-container" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`petal petal-${(i % 4) + 1}`} 
            style={{
              left: `${(i * 8.5) % 95}%`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${7 + (i % 5) * 2}s`
            }}
          />
        ))}
      </div>

      <div className={`japi-tree-position ${japiSpinning ? 'spinning' : ''}`}>
        <JapiOrnament onClick={handleJapiClick} />
      </div>

      <div 
        className={`hornbill-interactive ${hornbillAction ? 'pecking' : ''}`}
        onClick={handleHornbillClick}
        title="Click Paku the Hornbill to hear a cheerful morning call!"
        role="button"
        tabIndex={0}
      >
        <svg width="100" height="110" viewBox="0 0 100 110" fill="none">
          <path d="M60 22 C78 12, 95 18, 98 32 C92 38, 70 38, 55 35 Z" fill="#FBC02D" stroke="#37474F" strokeWidth="1.5" />
          <path d="M72 17 C85 18, 94 24, 98 32 C88 30, 80 28, 72 26 Z" fill="#F57F17" />
          <path d="M68 18 C78 14, 88 17, 92 23 C85 21, 75 20, 68 18 Z" fill="#D84315" />
          <line x1="62" y1="29" x2="96" y2="33" stroke="#263238" strokeWidth="1.5" />

          <circle cx="50" cy="28" r="4.5" fill="#D32F2F" />
          <circle cx="50" cy="28" r="2.5" fill="#212121" />
          <circle cx="51" cy="27" r="1" fill="#FFFFFF" />

          <path d="M42 20 C52 18, 62 20, 58 35 C54 45, 48 55, 44 65 C38 60, 36 30, 42 20 Z" fill="#FFF9C4" stroke="#37474F" strokeWidth="1.2" />
          <path d="M44 55 C52 65, 54 85, 38 100 C28 98, 22 80, 26 65 C30 55, 38 50, 44 55 Z" fill="#263238" stroke="#102027" strokeWidth="1.5" />

          <path d="M36 68 C42 70, 48 76, 44 85 C40 85, 35 78, 36 68 Z" fill="#FFFFFF" />

          <rect x="30" y="95" width="10" height="25" rx="3" fill="#FFFFFF" stroke="#37474F" strokeWidth="1" />
          <rect x="30" y="102" width="10" height="8" fill="#263238" />

          <ellipse cx="44" cy="92" rx="4" ry="2.5" fill="#FFA000" />
          <ellipse cx="38" cy="94" rx="4" ry="2.5" fill="#FFA000" />
        </svg>

        {birdDialogue && (
          <div className="hornbill-dialogue-bubble">
            <p>{birdDialogue}</p>
          </div>
        )}
      </div>
    </div>
  );
}
