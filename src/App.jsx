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

export default function App() {
  const [playerName, setPlayerName] = useState('Apoi');
  const [stars, setStars] = useState(120);
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabledState] = useState(true);
  const [starNotification, setStarNotification] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(`Welcome, ${playerName}! Let's have a fun and happy day!`);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleEarnStars = (amount, reason) => {
    setStars(prev => prev + amount);
    playStarSound();
    setStarNotification({ amount, reason });
    setTimeout(() => {
      setStarNotification(null);
    }, 3000);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
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
    <div className={`app-root font-size-${fontSize} ${highContrast ? 'high-contrast' : ''}`}>
      <div className="scenic-backdrop" style={{ backgroundImage: "url('/scenic_bg.jpg')" }}>
        <div className="scenic-lighting-overlay" />
      </div>

      <SceneryInteractive onEarnStars={handleEarnStars} />

      <div className="main-game-container">
        <Header 
          playerName={playerName}
          stars={stars}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => setShowSettings(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        <main className="categories-grid-section">
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
        </main>

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
          setPlayerName={setPlayerName}
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          voiceEnabled={voiceEnabled}
          setVoiceEnabledState={setVoiceEnabledState}
          stars={stars}
        />
      )}
    </div>
  );
}
