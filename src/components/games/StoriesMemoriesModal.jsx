import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, ChevronLeft, ChevronRight, Check, PenTool, BookOpen, Heart, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSuccessSound, playStarSound } from '../../utils/audio';
import { speakText, stopSpeaking } from '../../utils/speech';

const NOSTALGIA_STORIES = [
  {
    id: 'tea-garden',
    title: "Morning in the Emerald Tea Hills",
    imageEmoji: "🍵",
    themeColor: "#4CAF50",
    text: "The morning mist gently rises over the rolling green tea gardens. The fresh dew glistens on two delicate leaves and a bud. The comforting aroma of warm ginger tea in a brass cup fills the veranda as the birds begin their joyful morning song.",
    question: "What warm cup is enjoyed on the morning veranda?",
    options: ["Hot Ginger Tea", "Cold Lemonade", "Iced Water"],
    correct: 0,
    moral: "A peaceful morning cup warms the spirit for the day ahead."
  },
  {
    id: 'bihu-sweets',
    title: "The Sweet Fragrance of Festive Pitha",
    imageEmoji: "🥮",
    themeColor: "#FF9800",
    text: "During the harvest festival of Bihu, the kitchen is filled with laughter and the rich scent of roasted sesame, grated coconut, and sweet golden jaggery. Together, hands craft warm Til Pitha and crunchy Ghila Pitha to share with dear neighbors and grandchildren.",
    question: "Which delicious sweet is made with sesame and jaggery?",
    options: ["Til Pitha", "Spicy Curry", "Salty Chips"],
    correct: 0,
    moral: "Shared treats taste twice as sweet when made with love."
  },
  {
    id: 'golden-silk',
    title: "The Golden Threads of Muga Silk",
    imageEmoji: "🧵",
    themeColor: "#AB47BC",
    text: "The rhythmic clatter of the wooden handloom echoes across the courtyard. Golden Muga silk threads shimmer in the afternoon sun, becoming radiant Mekhela Chador adorned with traditional red and green diamond motifs that carry generations of stories.",
    question: "What color does the famous royal Muga silk shimmer with?",
    options: ["Radiant Gold", "Bright Blue", "Dark Charcoal"],
    correct: 0,
    moral: "Handmade heritage weaves love and tradition across generations."
  }
];

const MOOD_OPTIONS = [
  { emoji: '🌸', label: 'Peaceful' },
  { emoji: '🍵', label: 'Nostalgic' },
  { emoji: '💖', label: 'Loving' },
  { emoji: '☀️', label: 'Joyful' },
  { emoji: '🌿', label: 'Grateful' }
];

export function StoriesMemoriesModal({ onClose, onEarnStars, playerName = 'Apoi', language = 'en', journalEntries = [], onSaveJournal }) {
  const [activeTab, setActiveTab] = useState('stories');
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  // Journal state
  const [journalText, setJournalText] = useState('');
  const [journalAbout, setJournalAbout] = useState('');
  const [selectedMood, setSelectedMood] = useState('🌸');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const story = NOSTALGIA_STORIES[currentStoryIdx];

  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredCorrectly(false);
    setIsReading(false);
    stopSpeaking();
  }, [currentStoryIdx, activeTab]);

  const handleReadAloud = (textToRead) => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      speakText(textToRead, () => {
        setIsReading(false);
      }, language);
    }
  };

  const handleSelectOption = (idx) => {
    if (answeredCorrectly) return;
    setSelectedAnswer(idx);
    playClickSound();

    if (idx === story.correct) {
      setAnsweredCorrectly(true);
      playSuccessSound();
      playStarSound();
      confetti({ particleCount: 65, spread: 70 });
      onEarnStars(15, "Completed Heartwarming Story!");
      speakText("Wonderful memory! That is exactly right!", null, language);
    } else {
      speakText("Take another look, dear. You can do it!", null, language);
    }
  };

  const nextStory = () => {
    playClickSound();
    setCurrentStoryIdx((prev) => (prev + 1) % NOSTALGIA_STORIES.length);
  };

  const prevStory = () => {
    playClickSound();
    setCurrentStoryIdx((prev) => (prev - 1 + NOSTALGIA_STORIES.length) % NOSTALGIA_STORIES.length);
  };

  const handleSaveJournal = (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const newEntry = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      text: journalText.trim(),
      about: journalAbout.trim(),
      mood: selectedMood,
      createdAt: new Date().toISOString()
    };

    if (onSaveJournal) {
      onSaveJournal(newEntry);
    }
    playSuccessSound();
    playStarSound();
    confetti({ particleCount: 50, spread: 60 });
    onEarnStars(15, "Journaled a Beautiful Memory!");
    setSavedSuccessMsg("Memory note saved to your diary! ⭐ +15 Stars");
    setJournalText('');
    setJournalAbout('');
    setTimeout(() => setSavedSuccessMsg(''), 4000);
  };

  return (
    <div className="game-modal-backdrop" onClick={() => { stopSpeaking(); onClose(); }}>
      <div className="game-modal-card modal-purple" role="dialog" aria-modal="true" aria-labelledby="stories-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">📖</span>
            <div>
              <h2 className="modal-title" id="stories-title">Stories & Memories</h2>
              <p className="modal-subtitle">Heartwarming cultural tales & personal memory journal</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => { stopSpeaking(); onClose(); }} aria-label="Close" autoFocus>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('stories');
              speakText("Enjoy gentle stories of our heritage.", null, language);
            }}
          >
            <BookOpen size={18} /> Nostalgic Stories
          </button>
          <button 
            className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('journal');
              speakText("Write what you felt today, any memory, or about someone special.", null, language);
            }}
          >
            <PenTool size={18} /> Memory & Feelings Journal
          </button>
        </div>

        <div className="game-content">
          {activeTab === 'stories' ? (
            <div className="story-book-view">
              <div className="story-nav-bar">
                <button className="story-nav-btn" onClick={prevStory} title="Previous Story">
                  <ChevronLeft size={22} />
                </button>
                <span className="story-page-indicator">Story {currentStoryIdx + 1} of {NOSTALGIA_STORIES.length}</span>
                <button className="story-nav-btn" onClick={nextStory} title="Next Story">
                  <ChevronRight size={22} />
                </button>
              </div>

              <div className="story-card-body">
                <div className="story-illustration-banner" style={{ background: story.themeColor }}>
                  <span className="story-big-emoji">{story.imageEmoji}</span>
                  <h3 className="story-card-title">{story.title}</h3>
                </div>

                <div className="story-audio-control">
                  <button 
                    className={`read-aloud-btn ${isReading ? 'reading' : ''}`}
                    onClick={() => handleReadAloud(`${story.title}. ${story.text}`)}
                  >
                    <Volume2 size={20} className={isReading ? 'pulse-audio' : ''} />
                    {isReading ? "Reading to you..." : "Listen / Read Aloud"}
                  </button>
                </div>

                <p className="story-narrative-text">
                  {story.text}
                </p>

                <div className="story-quiz-box">
                  <h4 className="quiz-question-title">💭 Memory Check: {story.question}</h4>
                  <div className="quiz-options-list">
                    {story.options.map((opt, idx) => {
                      const isChosen = selectedAnswer === idx;
                      const isRight = isChosen && idx === story.correct;
                      const isWrong = isChosen && idx !== story.correct;

                      return (
                        <button
                          key={idx}
                          className={`quiz-option-btn ${isRight ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                          onClick={() => handleSelectOption(idx)}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                          <span className="option-text">{opt}</span>
                          {isRight && <Check size={20} className="check-icon" />}
                        </button>
                      );
                    })}
                  </div>

                  {answeredCorrectly && (
                    <div className="story-moral-banner">
                      <Sparkles size={20} color="#FFD700" />
                      <span>{story.moral}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="journal-view-container">
              <form className="journal-editor-card" onSubmit={handleSaveJournal}>
                <div className="journal-header-row">
                  <div>
                    <h3 className="journal-prompt-title">✍️ Write Your Thoughts & Memories</h3>
                    <p className="journal-prompt-sub">What did you feel today, a fond memory from the past, or about someone dear to you?</p>
                  </div>
                  <Heart className="journal-heart-icon" size={26} color="#E91E63" />
                </div>

                <div className="mood-picker-row">
                  <span className="mood-label">How are you feeling:</span>
                  <div className="mood-chips">
                    {MOOD_OPTIONS.map(m => (
                      <button
                        type="button"
                        key={m.label}
                        className={`mood-chip ${selectedMood === m.emoji ? 'selected' : ''}`}
                        onClick={() => setSelectedMood(m.emoji)}
                      >
                        <span>{m.emoji}</span>
                        <small>{m.label}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="journal-field-group">
                  <label className="journal-field-label">About Someone or Something (Optional)</label>
                  <input
                    type="text"
                    className="journal-input-about"
                    placeholder="e.g. My daughter, Morning garden walk, Grandmother's recipes"
                    maxLength={70}
                    value={journalAbout}
                    onChange={(e) => setJournalAbout(e.target.value)}
                  />
                </div>

                <div className="journal-field-group">
                  <label className="journal-field-label">Your Words & Memories</label>
                  <textarea
                    className="journal-textarea"
                    rows={4}
                    required
                    placeholder="Write anything you felt today or remember warmly... (e.g. Today the morning sun was so pleasant, I remember making sweet pitha with my loved ones.)"
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                  />
                </div>

                <div className="journal-actions-row">
                  {journalText.trim() && (
                    <button
                      type="button"
                      className={`icon-text-btn ${isReading ? 'reading' : ''}`}
                      onClick={() => handleReadAloud(journalText)}
                    >
                      <Volume2 size={18} />
                      {isReading ? "Reading..." : "Read My Words Aloud"}
                    </button>
                  )}
                  <button type="submit" className="game-primary-btn journal-save-btn">
                    <Send size={18} /> Save to My Memory Diary
                  </button>
                </div>

                {savedSuccessMsg && (
                  <div className="journal-success-banner">
                    <Sparkles size={20} color="#2E7D32" />
                    <span>{savedSuccessMsg}</span>
                  </div>
                )}
              </form>

              <div className="past-journal-entries">
                <h4 className="past-entries-title">📖 Your Cherished Memory Diary ({journalEntries.length})</h4>
                {journalEntries.length > 0 ? (
                  <div className="journal-entries-list">
                    {journalEntries.map(entry => (
                      <div key={entry.id} className="journal-entry-card">
                        <div className="entry-top-bar">
                          <span className="entry-mood">{entry.mood || '🌸'}</span>
                          {entry.about && <strong className="entry-about">About: {entry.about}</strong>}
                          <span className="entry-date">{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <p className="entry-text">{entry.text}</p>
                        <button
                          type="button"
                          className="entry-listen-btn"
                          onClick={() => handleReadAloud(entry.text)}
                        >
                          <Volume2 size={16} /> Listen
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="journal-empty-copy">No diary notes written yet. Your words and feelings will be warmly saved here!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

