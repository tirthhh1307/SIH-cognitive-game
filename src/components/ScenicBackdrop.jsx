import React from 'react';
import { SCENIC_BACKGROUNDS } from '../data/scenicBackgrounds';

export function ScenicBackdrop({ activeIndex = 0 }) {
  const safeIndex = (activeIndex >= 0 && activeIndex < SCENIC_BACKGROUNDS.length) ? activeIndex : 0;
  const currentBg = SCENIC_BACKGROUNDS[safeIndex];

  return (
    <div className="scenic-backdrop-viewport" aria-hidden="true">
      {SCENIC_BACKGROUNDS.map((bg, idx) => {
        const isActive = idx === safeIndex;
        return (
          <div
            key={bg.id}
            className={`scenic-bg-layer ${isActive ? 'is-active' : 'is-inactive'}`}
            style={{
              backgroundImage: `url('${bg.url}')`
            }}
          />
        );
      })}
      <div 
        className="scenic-lighting-overlay" 
        style={{
          background: currentBg.overlay || 'radial-gradient(circle at 50% 25%, rgba(255, 248, 220, 0.2) 0%, rgba(0, 0, 0, 0.06) 100%)'
        }}
      />
      <div className="scenic-vignette" />
    </div>
  );
}
