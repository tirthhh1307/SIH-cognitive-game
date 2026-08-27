import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CardTribalHeader } from './CulturalPattern';
import { playClickSound, playHoverSound } from '../utils/audio';

export function CategoryCard({
  id,
  title,
  description,
  icon: IconComponent,
  gradientClass,
  arrowColor,
  onClick
}) {
  return (
    <div 
      className={`category-card ${gradientClass}`}
      onClick={() => {
        playClickSound();
        onClick(id);
      }}
      onMouseEnter={playHoverSound}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${description}`}
    >
      <div className="card-top-pattern">
        <CardTribalHeader color="rgba(255, 255, 255, 0.45)" />
      </div>

      <div className="card-body">
        <div className="card-icon-container">
          <IconComponent />
        </div>

        <div className="card-text-block">
          <h2 className="card-title">{title}</h2>
          <p className="card-description">{description}</p>
        </div>

        <div className="card-action-btn-wrapper">
          <div className="card-action-circle" style={{ color: arrowColor }}>
            <ArrowRight size={26} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
