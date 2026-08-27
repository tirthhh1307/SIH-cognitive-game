import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryCard } from './components/CategoryCard';
import { BottomBanner } from './components/BottomBanner';
import { SceneryInteractive } from './components/SceneryInteractive';
import { SettingsModal } from './components/SettingsModal';
import { BrainSunburstIcon, SproutGardenIcon, MusicNotesIcon, PhotoMemoryIcon } from './components/CardIcons';
import { MindGamesModal } from './components/games/MindGamesModal';
import { MemoryGardenModal } from './components/games/MemoryGardenModal';
import { MusicJoyModal } from './components/games/MusicJoyModal';
import { StoriesMemoriesModal } from './components/games/StoriesMemoriesModal';
import { toggleMute, playStarSound } from './utils/audio';
import { speakText } from './utils/speech';
import { AppNav } from './components/AppNav';
import { ConsentGate } from './components/ConsentGate';
import { loadPlatformState, savePlatformState } from './utils/platform';

export default function App() {
  const [platformState, setPlatformState] = useState(() => loadPlatformState(localStorage));
  const [activeView, setActiveView] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [starNotification, setStarNotification] = useState(null);

  const { profile, settings, stars } = platformState;
  const playerName = profile.name;

  useEffect(() => {
    savePlatformState(platformState, localStorage);
  }, [platformState]);

  useEffect(() => {
    if (!platformState.consent.accepted) return undefined;
    const timer = setTimeout(() => {
      speakText(`Welcome, ${playerName}! Let's have a fun and happy day!`);
    }, 1200);
    return () => clearTimeout(timer);
  }, [platformState.consent.accepted]);

  const handleEarnStars = (amount, reason) => {
    setPlatformState(prev => ({ ...prev, stars: prev.stars + amount }));
    playStarSound();
    setStarNotification({ amount, reason });
    setTimeout(() => {
      setStarNotification(null);
    }, 3000);
  };

  const handleToggleMute = () => {
    const nextMuted = !settings.muted;
    setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, muted: nextMuted } }));
    toggleMute(nextMuted);
  };

  const handleOpenGame = (gameId) => {
    setActiveModal(gameId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const categoryCards = [
    {
      id: 'mind-games',
      title: 'Mind Games',
      description: 'Fun games to exercise your mind',
      icon: BrainSunburstIcon,
      gradientClass: 'card-orange',
      arrowColor: '#FF7A00'
    },
    {
      id: 'memory-garden',
      title: 'Memory Garden',
      description: 'Activities to help your memory',
      icon: SproutGardenIcon,
      gradientClass: 'card-green',
      arrowColor: '#558B2F'
    },
    {
      id: 'music-joy',
      title: 'Music & Joy',
      description: 'Songs and sounds to lift your spirit',
      icon: MusicNotesIcon,
      gradientClass: 'card-blue',
      arrowColor: '#0277BD'
    },
    {
      id: 'stories-memories',
      title: 'Stories & Memories',
      description: 'Revisit beautiful moments',
      icon: PhotoMemoryIcon,
      gradientClass: 'card-purple',
      arrowColor: '#6A1B9A'
    }
  ];

  return (
    <div className={`app-root font-size-${settings.fontSize} ${settings.highContrast ? 'high-contrast' : ''}`}>
      <div className="scenic-backdrop" style={{ backgroundImage: "url('/scenic_bg.jpg')" }}>
        <div className="scenic-lighting-overlay" />
      </div>

      {activeView === 'home' && <SceneryInteractive onEarnStars={handleEarnStars} />}

      <div className="main-game-container">
        <Header 
          playerName={playerName}
          stars={stars}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => setShowSettings(true)}
          isMuted={settings.muted}
          onToggleMute={handleToggleMute}
        />

        <AppNav activeView={activeView} onNavigate={setActiveView} />

        {activeView === 'home' ? <main className="categories-grid-section">
          <div className="categories-grid">
            {categoryCards.map((card) => (
              <CategoryCard 
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                gradientClass={card.gradientClass}
                arrowColor={card.arrowColor}
                onClick={handleOpenGame}
              />
            ))}
          </div>
        </main> : (
          <main className="platform-view placeholder-view">
            <p className="eyebrow">Offline cognitive companion</p>
            <h2>{activeView === 'play' ? 'Game Library' : activeView === 'check-in' ? 'Daily Check-in' : activeView === 'anchors' ? 'Memory Anchors' : 'Caregiver Dashboard'}</h2>
            <p>This section is ready for the next feature.</p>
          </main>
        )}

        <footer className="footer-banner-section">
          <BottomBanner />
        </footer>
      </div>

      {starNotification && (
        <div className="star-toast">
          <span className="toast-star-icon">⭐</span>
          <span className="toast-amount">+{starNotification.amount} Stars!</span>
          <span className="toast-reason">{starNotification.reason}</span>
        </div>
      )}

      {activeModal === 'mind-games' && (
        <MindGamesModal onClose={handleCloseModal} onEarnStars={handleEarnStars} />
      )}

      {activeModal === 'memory-garden' && (
        <MemoryGardenModal onClose={handleCloseModal} onEarnStars={handleEarnStars} />
      )}

      {activeModal === 'music-joy' && (
        <MusicJoyModal onClose={handleCloseModal} onEarnStars={handleEarnStars} />
      )}

      {activeModal === 'stories-memories' && (
        <StoriesMemoriesModal onClose={handleCloseModal} onEarnStars={handleEarnStars} />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          playerName={playerName}
          setPlayerName={(name) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, name } }))}
          fontSize={settings.fontSize}
          setFontSize={(fontSize) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, fontSize } }))}
          highContrast={settings.highContrast}
          setHighContrast={(highContrast) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, highContrast } }))}
          voiceEnabled={settings.voice}
          setVoiceEnabledState={(voice) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, voice } }))}
          stars={stars}
        />
      )}

      {!platformState.consent.accepted && (
        <ConsentGate onAccept={() => setPlatformState(prev => ({
          ...prev,
          consent: { accepted: true, acceptedAt: new Date().toISOString() }
        }))} />
      )}
    </div>
  );
}
