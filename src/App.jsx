import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryCard } from './components/CategoryCard';
import { BottomBanner } from './components/BottomBanner';
import { WeatherWidget } from './components/WeatherWidget';
import { PositiveNewsWidget } from './components/PositiveNewsWidget';
import { SceneryInteractive } from './components/SceneryInteractive';
import { ScenicBackdrop } from './components/ScenicBackdrop';
import { SCENIC_BACKGROUNDS } from './data/scenicBackgrounds';
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
import { addJournalEntry, clearPlatformData, createInitialState, getAdaptiveDifficulty, loadPlatformState, recordAttempt, savePlatformState } from './utils/platform';
import { GameLibrary } from './components/GameLibrary';
import { GameRunner } from './components/games/GameRunner';
import { DailyCheckIn } from './components/DailyCheckIn';
import { MemoryAnchors } from './components/MemoryAnchors';
import { clearAnchors, listAnchors } from './utils/mediaStore';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { ProfileModal } from './components/ProfileModal';
import { getGame } from './data/games';
import { t, LANGUAGES } from './data/i18n';

export default function App() {
  const [platformState, setPlatformState] = useState(() => loadPlatformState(localStorage));
  const [activeView, setActiveView] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [starNotification, setStarNotification] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [togetherMode, setTogetherMode] = useState(false);
  const [anchors, setAnchors] = useState([]);

  const { profile, settings, stars } = platformState;
  const playerName = profile.name;
  const language = profile.language;
  const avatar = profile.avatar || '/avatars/avatar_apoi.jpg';

  useEffect(() => {
    document.documentElement.lang = language === 'as' ? 'as' : 'en';
  }, [language]);

  useEffect(() => {
    savePlatformState(platformState, localStorage);
  }, [platformState]);

  const refreshAnchors = async () => {
    try { setAnchors(await listAnchors()); }
    catch { setAnchors([]); }
  };

  useEffect(() => {
    if (platformState.consent.accepted) refreshAnchors();
  }, [platformState.consent.accepted]);

  useEffect(() => {
    if (!platformState.consent.accepted) return undefined;
    const timer = setTimeout(() => {
      speakText(`Welcome, ${playerName}! Let's have a fun and happy day!`, null, language);
    }, 1200);
    return () => clearTimeout(timer);
  }, [platformState.consent.accepted, language]);

  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key !== 'Escape') return;
      setActiveModal(null);
      setShowSettings(false);
      setSelectedGame(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

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
    if (gameId === 'play' || gameId === 'mind-games') {
      setActiveView('play');
      return;
    }
    setActiveModal(gameId);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSelectLibraryGame = (game, together) => {
    setSelectedGame(game);
    setTogetherMode(together);
  };

  const handleStartGame = gameId => {
    const game = getGame(gameId);
    if (game) {
      setTogetherMode(false);
      setSelectedGame(game);
    }
  };

  const handleDeleteAll = async () => {
    clearPlatformData(localStorage);
    try { await clearAnchors(); } catch {}
    setAnchors([]);
    setSelectedGame(null);
    setActiveView('home');
    setPlatformState(createInitialState());
  };

  const handleLibraryComplete = result => {
    const earnedStars = 5 + Math.round(result.accuracy / 10);
    setPlatformState(prev => recordAttempt(prev, {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${selectedGame.id}`,
      gameId: selectedGame.id,
      category: selectedGame.category,
      stage: profile.stage,
      difficulty: getAdaptiveDifficulty(prev, selectedGame, profile.stage),
      ...result,
      earnedStars,
      together: togetherMode,
      completedAt: new Date().toISOString()
    }));
    playStarSound();
    setStarNotification({ amount: earnedStars, reason: `Completed ${selectedGame.name}!` });
    setTimeout(() => setStarNotification(null), 3000);
  };

  const scenicBgIndex = platformState.settings.scenicBackgroundIndex ?? 0;
  const scenicAutoSlide = platformState.settings.scenicAutoSlide ?? true;

  const handleScenicBgChange = (nextIndex) => {
    const safeIdx = typeof nextIndex === 'function' ? nextIndex(scenicBgIndex) : nextIndex;
    setPlatformState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        scenicBackgroundIndex: safeIdx
      }
    }));
  };

  const handleScenicAutoSlideToggle = (enabled) => {
    setPlatformState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        scenicAutoSlide: enabled
      }
    }));
  };

  // Auto-cycle peaceful scenic backgrounds if auto mode is on (default: ON)
  useEffect(() => {
    if (!scenicAutoSlide) return undefined;
    const interval = setInterval(() => {
      setPlatformState(prev => {
        const total = SCENIC_BACKGROUNDS.length;
        const currentIdx = prev.settings?.scenicBackgroundIndex ?? 0;
        const nextIdx = (currentIdx + 1) % total;
        return {
          ...prev,
          settings: {
            ...prev.settings,
            scenicBackgroundIndex: nextIdx
          }
        };
      });
    }, 16000);
    return () => clearInterval(interval);
  }, [scenicAutoSlide]);

  const languageOptions = [
    { code: 'en', label: 'English', sub: 'English', flag: '🇬🇧' },
    { code: 'as', label: 'অসমীয়া', sub: 'Assamese', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi', flag: '🇮🇳' },
    { code: 'mni', label: 'মৈতৈলোন্', sub: 'Manipuri', flag: '🇮🇳' },
    { code: 'trp', label: 'ককবরক', sub: 'Tripuri', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (newLang) => {
    try {
      playClickSound();
    } catch {}
    setPlatformState(prev => {
      const next = {
        ...prev,
        profile: {
          ...prev.profile,
          language: newLang
        }
      };
      savePlatformState(next, localStorage);
      return next;
    });
    try {
      const welcomeMsg = t(newLang, 'speech.welcome');
      speakText(welcomeMsg, null, newLang);
    } catch {}
  };

  const categoryCards = [
    {
      id: 'play',
      title: t(language, 'card.mindGames.title'),
      description: t(language, 'card.mindGames.desc'),
      icon: BrainSunburstIcon,
      gradientClass: 'card-orange',
      arrowColor: '#FF7A00'
    },
    {
      id: 'memory-garden',
      title: t(language, 'card.memoryGarden.title'),
      description: t(language, 'card.memoryGarden.desc'),
      icon: SproutGardenIcon,
      gradientClass: 'card-green',
      arrowColor: '#558B2F'
    },
    {
      id: 'music-joy',
      title: t(language, 'card.musicJoy.title'),
      description: t(language, 'card.musicJoy.desc'),
      icon: MusicNotesIcon,
      gradientClass: 'card-blue',
      arrowColor: '#0277BD'
    },
    {
      id: 'stories-memories',
      title: t(language, 'card.storiesMemories.title'),
      description: t(language, 'card.storiesMemories.desc'),
      icon: PhotoMemoryIcon,
      gradientClass: 'card-purple',
      arrowColor: '#6A1B9A'
    }
  ];

  return (
    <div className={`app-root font-size-${settings.fontSize} ${settings.highContrast ? 'high-contrast' : ''}`}>
      <ScenicBackdrop activeIndex={scenicBgIndex} />

      {activeView === 'home' && <SceneryInteractive onEarnStars={handleEarnStars} />}

      <div className="main-game-container">
        <Header 
          playerName={playerName}
          avatar={avatar}
          stars={stars}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          isMuted={settings.muted}
          onToggleMute={handleToggleMute}
          language={language}
          onLanguageChange={handleLanguageChange}
        />

        <AppNav activeView={activeView} onNavigate={setActiveView} language={language} />

        {activeView === 'home' ? (
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
        ) : activeView === 'play' ? (
          <main className="platform-view-shell">
            <GameLibrary stage={profile.stage} onSelectGame={handleSelectLibraryGame} language={language} />
          </main>
        ) : activeView === 'check-in' ? (
          <main className="platform-view-shell">
            <DailyCheckIn state={platformState} onStateChange={setPlatformState} language={language} />
          </main>
        ) : activeView === 'anchors' ? (
          <main className="platform-view-shell">
            <MemoryAnchors anchors={anchors} onChanged={refreshAnchors} language={language} />
          </main>
        ) : activeView === 'caregiver' ? (
          <main className="platform-view-shell">
            <CaregiverDashboard
              state={platformState}
              anchors={anchors}
              anchorCount={anchors.length}
              language={language}
              onStateChange={setPlatformState}
              onStartGame={handleStartGame}
              onDeleteAll={handleDeleteAll}
            />
          </main>
        ) : (
          <main className="platform-view placeholder-view">
            <p className="eyebrow">Offline cognitive companion</p>
            <h2>{activeView === 'play' ? 'Game Library' : activeView === 'check-in' ? 'Daily Check-in' : activeView === 'anchors' ? 'Memory Anchors' : 'Caregiver Dashboard'}</h2>
            <p>This section is ready for the next feature.</p>
          </main>
        )}

        <footer className={`footer-banner-section ${activeView === 'home' ? 'footer-home-layout' : ''}`}>
          {activeView === 'home' && (
            <div className="home-footer-left">
              <WeatherWidget language={language} />
            </div>
          )}
          <div className="home-footer-center">
            <BottomBanner />
          </div>
          {activeView === 'home' && (
            <div className="home-footer-right">
              <PositiveNewsWidget language={language} />
            </div>
          )}
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
        <StoriesMemoriesModal
          onClose={handleCloseModal}
          onEarnStars={handleEarnStars}
          playerName={playerName}
          language={language}
          journalEntries={platformState.journalEntries || []}
          onSaveJournal={(entry) => setPlatformState(prev => addJournalEntry(prev, entry))}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          playerName={playerName}
          setPlayerName={(name) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, name } }))}
          currentAvatar={avatar}
          setAvatar={(newAvatar) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, avatar: newAvatar } }))}
          language={language}
        />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          playerName={playerName}
          setPlayerName={(name) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, name } }))}
          avatar={avatar}
          setAvatar={(newAvatar) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, avatar: newAvatar } }))}
          fontSize={settings.fontSize}
          setFontSize={(fontSize) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, fontSize } }))}
          highContrast={settings.highContrast}
          setHighContrast={(highContrast) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, highContrast } }))}
          voiceEnabled={settings.voice}
          setVoiceEnabledState={(voice) => setPlatformState(prev => ({ ...prev, settings: { ...prev.settings, voice } }))}
          stars={stars}
          language={language}
          setLanguage={(language) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, language } }))}
          scenicBackgroundIndex={scenicBgIndex}
          setScenicBackgroundIndex={handleScenicBgChange}
          scenicAutoSlide={scenicAutoSlide}
          setScenicAutoSlide={handleScenicAutoSlideToggle}
        />
      )}

      {selectedGame && (
        <GameRunner
          game={selectedGame}
          stage={profile.stage}
          difficulty={getAdaptiveDifficulty(platformState, selectedGame, profile.stage)}
          playerName={playerName}
          together={togetherMode}
          anchors={anchors}
          language={language}
          onComplete={handleLibraryComplete}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {!platformState.consent.accepted && (
        <ConsentGate language={language} onLanguageChange={(language) => setPlatformState(prev => ({ ...prev, profile: { ...prev.profile, language } }))} onAccept={() => setPlatformState(prev => ({
          ...prev,
          consent: { accepted: true, acceptedAt: new Date().toISOString() }
        }))} />
      )}
    </div>
  );
}
