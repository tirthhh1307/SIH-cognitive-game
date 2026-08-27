import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSuccessSound, playStarSound, playXylophoneNote } from '../../utils/audio';
import { speakText } from '../../utils/speech';

const PATTERN_ITEMS = [
  { id: 'lotus', name: 'Lotus', emoji: '🪷', color: '#F48FB1' },
  { id: 'tea', name: 'Tea Leaf', emoji: '🌿', color: '#81C784' },
  { id: 'dhol', name: 'Dhol Drum', emoji: '🪘', color: '#FFB74D' },
  { id: 'peacock', name: 'Peacock', emoji: '🦚', color: '#4DD0E1' },
  { id: 'japi', name: 'Sun Hat', emoji: '👒', color: '#FFD54F' }
];

const ODD_ONE_ROUNDS = [
  {
    question: "Which one is different from the others?",
    items: [
      { id: '1', emoji: '🌺', name: 'Hibiscus Flower', isOdd: false },
      { id: '2', emoji: '🌸', name: 'Cherry Blossom', isOdd: false },
      { id: '3', emoji: '🍵', name: 'Cup of Assam Tea', isOdd: true },
      { id: '4', emoji: '🪷', name: 'Lotus Flower', isOdd: false }
    ],
    hint: "Three of them are flowers that bloom in the garden!"
  },
  {
    question: "Find the one that does not fly in the sky:",
    items: [
      { id: '1', emoji: '🦜', name: 'Parrot', isOdd: false },
      { id: '2', emoji: '🦏', name: 'Kaziranga Rhino', isOdd: true },
      { id: '3', emoji: '🦚', name: 'Peacock', isOdd: false },
      { id: '4', emoji: '🕊️', name: 'Dove', isOdd: false }
    ],
    hint: "Look for our mighty friend who walks on the grass!"
  },
  {
    question: "Which one makes musical sounds?",
    items: [
      { id: '1', emoji: '🪘', name: 'Dhol Drum', isOdd: true },
      { id: '2', emoji: '🏺', name: 'Clay Pot', isOdd: false },
      { id: '3', emoji: '🧺', name: 'Woven Basket', isOdd: false },
      { id: '4', emoji: '🪵', name: 'Wooden Log', isOdd: false }
    ],
    hint: "It plays rhythmic beats during festive dances!"
  }
];

export function MindGamesModal({ onClose, onEarnStars }) {
  const [activeTab, setActiveTab] = useState('pattern');
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [patternLevel, setPatternLevel] = useState(1);
  const [patternWon, setPatternWon] = useState(false);

  const [oddRound, setOddRound] = useState(0);
  const [oddSelected, setOddSelected] = useState(null);
  const [oddSolved, setOddSolved] = useState(false);

  const startNewPattern = (lvl = 1) => {
    const seqLength = Math.min(2 + lvl, 5);
    const newSeq = [];
    for (let i = 0; i < seqLength; i++) {
      const randomIdx = Math.floor(Math.random() * PATTERN_ITEMS.length);
      newSeq.push(PATTERN_ITEMS[randomIdx].id);
    }
    setSequence(newSeq);
    setUserStep(0);
    setPatternWon(false);
    playPatternSequence(newSeq);
  };

  const playPatternSequence = async (seq) => {
    setIsPlayingSeq(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const itemId = seq[i];
      setActiveItem(itemId);
      const item = PATTERN_ITEMS.find(p => p.id === itemId);
      playXylophoneNote(350 + PATTERN_ITEMS.indexOf(item) * 100);
      await new Promise(r => setTimeout(r, 500));
      setActiveItem(null);
    }
    setIsPlayingSeq(false);
    speakText("Now your turn, Apoi! Tap the same items.");
  };

  useEffect(() => {
    if (activeTab === 'pattern') {
      startNewPattern(patternLevel);
    } else {
      speakText(ODD_ONE_ROUNDS[oddRound].question);
    }
  }, [activeTab]);

  const handlePatternClick = (itemId) => {
    if (isPlayingSeq || patternWon) return;
    playClickSound();

    const expected = sequence[userStep];
    if (itemId === expected) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);
      const item = PATTERN_ITEMS.find(p => p.id === itemId);
      playXylophoneNote(400 + PATTERN_ITEMS.indexOf(item) * 80);

      if (nextStep === sequence.length) {
        setPatternWon(true);
        playSuccessSound();
        playStarSound();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onEarnStars(15, "Completed Pattern Boost!");
        speakText("Brilliant job, Apoi! You matched the whole pattern perfectly!");
      }
    } else {
      speakText("Almost! Let's watch the pattern once more together.");
      setTimeout(() => {
        playPatternSequence(sequence);
        setUserStep(0);
      }, 1000);
    }
  };

  const handleOddSelect = (item) => {
    if (oddSolved) return;
    setOddSelected(item.id);
    playClickSound();

    if (item.isOdd) {
      setOddSolved(true);
      playSuccessSound();
      playStarSound();
      confetti({ particleCount: 50, spread: 60 });
      onEarnStars(10, "Solved Odd One Out!");
      speakText(`Wonderful! Yes, ${item.name} is the special one!`);
    } else {
      speakText(`Good try! ${ODD_ONE_ROUNDS[oddRound].hint}`);
    }
  };

  const nextOddRound = () => {
    const nextR = (oddRound + 1) % ODD_ONE_ROUNDS.length;
    setOddRound(nextR);
    setOddSelected(null);
    setOddSolved(false);
    speakText(ODD_ONE_ROUNDS[nextR].question);
  };

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="game-modal-card modal-orange" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">🧠</span>
            <div>
              <h2 className="modal-title">Mind Games</h2>
              <p className="modal-subtitle">Gentle exercises for focus, memory & joy</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pattern' ? 'active' : ''}`}
            onClick={() => setActiveTab('pattern')}
          >
            🌸 Pattern Sequence
          </button>
          <button 
            className={`tab-btn ${activeTab === 'oddOne' ? 'active' : ''}`}
            onClick={() => setActiveTab('oddOne')}
          >
            🔍 Spot the Odd One
          </button>
        </div>

        {activeTab === 'pattern' && (
          <div className="game-content">
            <div className="instruction-box">
              <p>
                {isPlayingSeq 
                  ? "👀 Watch carefully as the items light up..." 
                  : patternWon 
                  ? "🎉 Splendid memory! Level complete!"
                  : `👉 Tap the items in the order shown (Step ${userStep + 1} of ${sequence.length})`}
              </p>
              <button 
                className="replay-seq-btn" 
                onClick={() => playPatternSequence(sequence)}
                disabled={isPlayingSeq}
                title="Watch pattern again"
              >
                <RefreshCw size={18} className={isPlayingSeq ? 'spin' : ''} /> Repeat Pattern
              </button>
            </div>

            <div className="pattern-grid">
              {PATTERN_ITEMS.map((item) => {
                const isLit = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    className={`pattern-card-btn ${isLit ? 'lit' : ''}`}
                    style={{ '--item-color': item.color }}
                    onClick={() => handlePatternClick(item.id)}
                    disabled={isPlayingSeq}
                  >
                    <span className="pattern-emoji">{item.emoji}</span>
                    <span className="pattern-name">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {patternWon && (
              <div className="win-action-row">
                <button 
                  className="game-primary-btn"
                  onClick={() => {
                    setPatternLevel(lvl => lvl + 1);
                    startNewPattern(patternLevel + 1);
                  }}
                >
                  <Sparkles size={20} /> Next Level ({patternLevel + 1})
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'oddOne' && (
          <div className="game-content">
            <div className="instruction-box">
              <p>{ODD_ONE_ROUNDS[oddRound].question}</p>
            </div>

            <div className="odd-grid">
              {ODD_ONE_ROUNDS[oddRound].items.map((item) => {
                const isPicked = oddSelected === item.id;
                const isCorrect = isPicked && item.isOdd;
                return (
                  <button
                    key={item.id}
                    className={`odd-card-btn ${isPicked ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                    onClick={() => handleOddSelect(item)}
                  >
                    <span className="odd-emoji">{item.emoji}</span>
                    <span className="odd-label">{item.name}</span>
                    {isCorrect && <CheckCircle2 className="correct-check" size={24} />}
                  </button>
                );
              })}
            </div>

            {oddSolved && (
              <div className="win-action-row">
                <button className="game-primary-btn" onClick={nextOddRound}>
                  <Sparkles size={20} /> Next Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
