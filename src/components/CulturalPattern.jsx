import React from 'react';

export function CardTribalHeader({ color = 'rgba(255, 255, 255, 0.4)' }) {
  return (
    <svg 
      className="card-tribal-pattern" 
      viewBox="0 0 300 24" 
      preserveAspectRatio="none"
      width="100%" 
      height="22"
    >
      <defs>
        <pattern id={`tribal-pat-${color.replace(/[^a-zA-Z0-9]/g, '')}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 4 L6 0 L12 4 L18 0 L24 4" fill="none" stroke={color} strokeWidth="1.5" />
          <polygon points="12,7 17,12 12,17 7,12" fill="none" stroke={color} strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <path d="M0 20 L24 20" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
        </pattern>
      </defs>
      <rect width="300" height="24" fill={`url(#tribal-pat-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
    </svg>
  );
}

export function GoldenDivider() {
  return (
    <div className="golden-divider-container">
      <svg width="180" height="20" viewBox="0 0 180 20" fill="none">
        <line x1="10" y1="10" x2="65" y2="10" stroke="#C59B27" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="65" cy="10" r="2" fill="#C59B27" />
        
        <circle cx="90" cy="10" r="3" fill="#D4AF37" />
        <ellipse cx="90" cy="4.5" rx="2" ry="3.5" fill="#C59B27" />
        <ellipse cx="90" cy="15.5" rx="2" ry="3.5" fill="#C59B27" />
        <ellipse cx="84.5" cy="10" rx="3.5" ry="2" fill="#C59B27" />
        <ellipse cx="95.5" cy="10" rx="3.5" ry="2" fill="#C59B27" />
        
        <ellipse cx="86" cy="6" rx="2" ry="1.2" transform="rotate(-45 86 6)" fill="#B8860B" />
        <ellipse cx="94" cy="6" rx="2" ry="1.2" transform="rotate(45 94 6)" fill="#B8860B" />
        <ellipse cx="86" cy="14" rx="2" ry="1.2" transform="rotate(45 86 14)" fill="#B8860B" />
        <ellipse cx="94" cy="14" rx="2" ry="1.2" transform="rotate(-45 94 14)" fill="#B8860B" />
        
        <circle cx="115" cy="10" r="2" fill="#C59B27" />
        <line x1="115" y1="10" x2="170" y2="10" stroke="#C59B27" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function JapiOrnament({ onClick }) {
  return (
    <button type="button" className="japi-ornament-interactive" onClick={onClick} title="Spin the auspicious Japi" aria-label="Spin the auspicious Japi">
      <svg width="84" height="110" viewBox="0 0 84 110" fill="none">
        <line x1="42" y1="0" x2="42" y2="15" stroke="#D32F2F" strokeWidth="2.5" />
        <circle cx="42" cy="45" r="30" fill="#FFF2C6" stroke="#8D6E63" strokeWidth="2" />
        <circle cx="42" cy="45" r="26" fill="none" stroke="#D7CCC8" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="42" cy="45" r="21" fill="none" stroke="#D32F2F" strokeWidth="3" />
        
        <polygon points="42,26 47,38 42,42 37,38" fill="#D32F2F" />
        <polygon points="42,64 47,52 42,48 37,52" fill="#D32F2F" />
        <polygon points="23,45 35,40 39,45 35,50" fill="#D32F2F" />
        <polygon points="61,45 49,40 45,45 49,50" fill="#D32F2F" />
        
        <polygon points="29,32 39,37 36,41 31,37" fill="#2E7D32" />
        <polygon points="55,32 45,37 48,41 53,37" fill="#2E7D32" />
        <polygon points="29,58 39,53 36,49 31,53" fill="#2E7D32" />
        <polygon points="55,58 45,53 48,49 53,53" fill="#2E7D32" />
        
        <circle cx="42" cy="45" r="6" fill="#FBC02D" stroke="#D32F2F" strokeWidth="1.5" />
        <circle cx="42" cy="45" r="2.5" fill="#D32F2F" />
        
        <line x1="36" y1="75" x2="36" y2="105" stroke="#D32F2F" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="36" cy="106" r="2.5" fill="#D32F2F" />
        
        <line x1="42" y1="75" x2="42" y2="110" stroke="#FBC02D" strokeWidth="2.5" strokeDasharray="4 2" />
        <circle cx="42" cy="110" r="3" fill="#FBC02D" />
        
        <line x1="48" y1="75" x2="48" y2="105" stroke="#2E7D32" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="48" cy="106" r="2.5" fill="#2E7D32" />
      </svg>
    </button>
  );
}
