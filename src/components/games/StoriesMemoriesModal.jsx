import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

export function StoriesMemoriesModal({ onClose, onEarnStars }) {
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  const story = NOSTALGIA_STORIES[currentStoryIdx];

  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredCorrectly(false);
    setIsReading(false);
    stopSpeaking();
  }, [currentStoryIdx]);

  const handleReadAloud = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      speakText(`${story.title}. ${story.text}`, () => {
        setIsReading(false);
      });
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
      speakText("Wonderful memory, Apoi! That is exactly right!");
    } else {
      speakText("Take another look, dear Apoi. You can do it!");
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

  return (
    <div className="game-modal-backdrop" onClick={() => { stopSpeaking(); onClose(); }}>
      <div className="game-modal-card modal-purple" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">📖</span>
            <div>
              <h2 className="modal-title">Stories & Memories</h2>
              <p className="modal-subtitle">Heartwarming cultural tales & nostalgic reflections</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => { stopSpeaking(); onClose(); }} aria-label="Close">
            <X size={24} />
          </button>
        </div>

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
                onClick={handleReadAloud}
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
      </div>
    </div>
  );
}
