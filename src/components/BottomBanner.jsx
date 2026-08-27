import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { speakText } from '../utils/speech';
import { playSuccessSound } from '../utils/audio';

const AFFIRMATIONS = [
  { line1: "Take your time. Enjoy every moment.", line2: "You are doing great!" },
  { line1: "Every step is a victory.", line2: "Your smile brings joy to the whole world!" },
  { line1: "A calm mind is a happy mind.", line2: "Breathe deeply and enjoy the sunshine!" },
  { line1: "Learning and playing have no age.", line2: "You are making wonderful progress!" }
];

export function BottomBanner() {
  const [index, setIndex] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);

  const currentAffirmation = AFFIRMATIONS[index];

  const handleAffirmationClick = () => {
    playSuccessSound();
    setIsSparkling(true);
    const nextIdx = (index + 1) % AFFIRMATIONS.length;
    setIndex(nextIdx);
    speakText(`${AFFIRMATIONS[nextIdx].line1} ${AFFIRMATIONS[nextIdx].line2}`);
    setTimeout(() => setIsSparkling(false), 1200);
  };

  return (
    <div 
      className={`bottom-banner ${isSparkling ? 'banner-sparkle' : ''}`}
      onClick={handleAffirmationClick}
      role="button"
      tabIndex={0}
      title="Click for a heartwarming thought!"
    >
      <div className="banner-heart-badge">
        <Heart size={24} fill="#FFFFFF" color="#FFFFFF" />
      </div>

      <div className="banner-text">
        <span className="banner-primary">{currentAffirmation.line1}</span>
        <span className="banner-secondary">{currentAffirmation.line2}</span>
      </div>

      <div className="banner-tribal-accent">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0,0 L40,0 L40,40 Z" fill="rgba(197, 155, 39, 0.12)" />
          <path d="M10,0 L40,30" stroke="#C59B27" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M20,0 L40,20" stroke="#C59B27" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M30,0 L40,10" stroke="#C59B27" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      {isSparkling && (
        <div className="sparkle-popup">
          <Sparkles size={20} color="#FFC107" />
        </div>
      )}
    </div>
  );
}
