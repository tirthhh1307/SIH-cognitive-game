import React from 'react';
import { Home, Gamepad2, ClipboardCheck, Images, HeartPulse } from 'lucide-react';
import { NAV_ITEMS } from '../data/shell';
import { playClickSound } from '../utils/audio';

const ICONS = {
  home: Home,
  play: Gamepad2,
  check: ClipboardCheck,
  memory: Images,
  care: HeartPulse
};

export function AppNav({ activeView, onNavigate }) {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const Icon = ICONS[item.icon];
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            className={`app-nav-btn ${active ? 'active' : ''}`}
            onClick={() => { playClickSound(); onNavigate(item.id); }}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
