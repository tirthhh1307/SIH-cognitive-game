import React, { useState, useEffect } from 'react';
import { X, Sparkles, Droplets, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSuccessSound, playStarSound, playXylophoneNote } from '../../utils/audio';
import { speakText } from '../../utils/speech';

const GARDEN_FLOWERS = [
  { id: 'hibiscus', name: 'Red Hibiscus', emoji: '🌺', fact: 'Sacred flower loved by butterflies!' },
  { id: 'lotus', name: 'Pink Lotus', emoji: '🪷', fact: 'Symbol of peace, purity and wisdom.' },
  { id: 'orchid', name: 'Kopou Orchid', emoji: '🌸', fact: 'Assam’s famous Bihu festive flower.' },
  { id: 'sunflower', name: 'Golden Sunflower', emoji: '🌻', fact: 'Turns its face toward the bright sun.' },
  { id: 'jasmine', name: 'Sweet Jasmine', emoji: '🌼', fact: 'Spreads sweet fragrance in evening breeze.' },
  { id: 'rose', name: 'Velvet Rose', emoji: '🌹', fact: 'Deep colors bringing warmth to the garden.' }
];

export function MemoryGardenModal({ onClose, onEarnStars }) {
  const [activeTab, setActiveTab] = useState('match');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isBusy, setIsBusy] = useState(false);

  const [waterSequence, setWaterSequence] = useState([]);
  const [userWaterStep, setUserWaterStep] = useState(0);
  const [activeWaterPot, setActiveWaterPot] = useState(null);
  const [bloomedPots, setBloomedPots] = useState([]);
  const [isWateringDemo, setIsWateringDemo] = useState(false);

  const initCardMatch = () => {
    const selectedFlowers = GARDEN_FLOWERS.slice(0, 4);
    const deck = [...selectedFlowers, ...selectedFlowers]
      .map((item, idx) => ({ ...item, uniqueId: idx }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setIsBusy(false);
  };

  const initBloomSequence = () => {
    const seq = [0, 2, 1, 3].sort(() => Math.random() - 0.5);
    setWaterSequence(seq);
    setUserWaterStep(0);
    setBloomedPots([]);
    playWaterDemo(seq);
  };

  const playWaterDemo = async (seq) => {
    setIsWateringDemo(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const potIdx = seq[i];
      setActiveWaterPot(potIdx);
      playXylophoneNote(300 + potIdx * 90);
      await new Promise(r => setTimeout(r, 550));
      setActiveWaterPot(null);
    }
    setIsWateringDemo(false);
    speakText("Now tap the garden pots in the same order to water them!");
  };

  useEffect(() => {
    if (activeTab === 'match') {
      initCardMatch();
      speakText("Flip the cards to find matching pairs of flowers!");
    } else {
      initBloomSequence();
    }
  }, [activeTab]);

  const handleCardClick = (card) => {
    if (isBusy || flipped.includes(card.uniqueId) || matched.includes(card.id)) return;
    playClickSound();

    const newFlipped = [...flipped, card.uniqueId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.uniqueId === firstId);
      const secondCard = cards.find(c => c.uniqueId === secondId);

      if (firstCard.id === secondCard.id) {
        playSuccessSound();
        setMatched(prev => [...prev, firstCard.id]);
        setFlipped([]);
        setIsBusy(false);

        if (matched.length + 1 === cards.length / 2) {
          playStarSound();
          confetti({ particleCount: 70, spread: 80 });
          onEarnStars(20, "Cultivated the Memory Garden!");
          speakText("Wonderful! All the beautiful flowers in your garden have bloomed!");
        } else {
          speakText(`You matched the ${firstCard.name}!`);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsBusy(false);
        }, 1000);
      }
    }
  };

  const handleWaterPot = (potIdx) => {
    if (isWateringDemo || bloomedPots.includes(potIdx)) return;
    playClickSound();

    const expected = waterSequence[userWaterStep];
    if (potIdx === expected) {
      const nextStep = userWaterStep + 1;
      setUserWaterStep(nextStep);
      setBloomedPots(prev => [...prev, potIdx]);
      playXylophoneNote(350 + potIdx * 100);

      if (nextStep === waterSequence.length) {
        playSuccessSound();
        playStarSound();
        confetti({ particleCount: 80, spread: 80 });
        onEarnStars(20, "Bloomed the Garden Pots!");
        speakText("Your gentle care made every single flower blossom with radiance!");
      }
    } else {
      speakText("Let's look at the watering order once again together.");
      setTimeout(() => {
        setBloomedPots([]);
        setUserWaterStep(0);
        playWaterDemo(waterSequence);
      }, 1000);
    }
  };

  const isAllMatched = cards.length > 0 && matched.length === cards.length / 2;
  const isAllBloomed = bloomedPots.length === waterSequence.length && waterSequence.length > 0;

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="game-modal-card modal-green" role="dialog" aria-modal="true" aria-labelledby="memory-garden-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">🌱</span>
            <div>
              <h2 className="modal-title" id="memory-garden-title">Memory Garden</h2>
              <p className="modal-subtitle">Nurture plants and bloom peaceful floral memories</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close" autoFocus>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            🌸 Flower Pairs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bloom' ? 'active' : ''}`}
            onClick={() => setActiveTab('bloom')}
          >
            🪴 Watering & Bloom
          </button>
        </div>

        {activeTab === 'match' && (
          <div className="game-content">
            <div className="instruction-box">
              <p>
                {isAllMatched 
                  ? "🌺 Your whole memory garden is in full bloom!" 
                  : "Tap any 2 cards to find matching blossoms"}
              </p>
              <button className="replay-seq-btn" onClick={initCardMatch}>
                <RotateCcw size={18} /> New Shuffle
              </button>
            </div>

            <div className="memory-cards-grid">
              {cards.map((card) => {
                const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.id);
                return (
                  <div
                    key={card.uniqueId}
                    className={`memory-card-tile ${isFlipped ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="card-inner">
                      <div className="card-front">
                        <span className="card-back-pattern">🌿</span>
                      </div>
                      <div className="card-back">
                        <span className="card-flower-emoji">{card.emoji}</span>
                        <span className="card-flower-name">{card.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isAllMatched && (
              <div className="win-action-row">
                <button className="game-primary-btn" onClick={initCardMatch}>
                  <Sparkles size={20} /> Play Another Round
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bloom' && (
          <div className="game-content">
            <div className="instruction-box">
              <p>
                {isWateringDemo 
                  ? "💧 Watch the watering can give life to each pot..."
                  : isAllBloomed
                  ? "🌸 Every flower is radiant and happy!"
                  : `Tap pot ${userWaterStep + 1} of ${waterSequence.length} to water it!`}
              </p>
              <button 
                className="replay-seq-btn" 
                onClick={() => playWaterDemo(waterSequence)}
                disabled={isWateringDemo}
              >
                <Droplets size={18} /> Replay Order
              </button>
            </div>

            <div className="pots-container">
              {[0, 1, 2, 3].map((potIdx) => {
                const isDemoLit = activeWaterPot === potIdx;
                const isBloomed = bloomedPots.includes(potIdx);
                const flower = GARDEN_FLOWERS[potIdx];

                return (
                  <div
                    key={potIdx}
                    className={`garden-pot-item ${isDemoLit ? 'lit-pot' : ''} ${isBloomed ? 'bloomed' : ''}`}
                    onClick={() => handleWaterPot(potIdx)}
                  >
                    <div className="flower-stage">
                      {isBloomed ? (
                        <div className="blooming-flower">
                          <span className="big-flower-emoji">{flower.emoji}</span>
                          <span className="flower-label">{flower.name}</span>
                        </div>
                      ) : (
                        <div className="sprout-stage">
                          <span className="tiny-sprout">🌱</span>
                          <span className="pot-number">Pot {potIdx + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="ceramic-pot">
                      <div className="pot-rim"></div>
                      <div className="pot-body">
                        {isDemoLit && <Droplets className="water-drop-icon" size={24} color="#00BCD4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isAllBloomed && (
              <div className="win-action-row">
                <button className="game-primary-btn" onClick={initBloomSequence}>
                  <Sparkles size={20} /> Bloom More Pots
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
