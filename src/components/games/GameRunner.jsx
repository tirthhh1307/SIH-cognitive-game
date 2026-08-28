import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Check, Eye, Lightbulb, Play, RotateCcw, Users, X, Sparkles, 
  Upload, Share2, Heart, Award, Star, MessageSquare, Image, 
  ChevronRight, Plus, CheckCircle2, AlertCircle, Copy, Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  createMatchDeck, createSequence, evaluateOrder, getStageLimit, 
  scoreRound, shuffle, MOTIVATIONAL_QUOTES, RETRY_ENCOURAGEMENT_QUOTES, 
  getRandomQuote 
} from '../../utils/gameEngine';
import { 
  playClickSound, playDrumBeat, playSuccessSound, playStarSound, 
  playXylophoneNote 
} from '../../utils/audio';
import { speakText, stopSpeaking } from '../../utils/speech';
import { gameInstructions, gameName, t } from '../../data/i18n';

const labelsFor = options => options.map((entry, index) => typeof entry === 'string'
  ? { id: index, label: entry, symbol: '' }
  : entry);

function playSynthTone(frequency = 440, duration = 0.4) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    playXylophoneNote(frequency);
  }
}

// -------------------------------------------------------------
// 1. PRE-GAME DIFFICULTY SELECTOR SCREEN
// -------------------------------------------------------------
function DifficultySelector({ game, onSelect }) {
  return (
    <div className="difficulty-screen-wrap">
      <div className="difficulty-header-text">
        <span className="diff-eyebrow">Select Difficulty</span>
        <h2>How would you like to play today?</h2>
        <p>Choose a level that feels comfortable and joyful for you.</p>
      </div>

      <div className="difficulty-cards-grid">
        <button 
          type="button"
          className="difficulty-card diff-easy"
          onClick={() => { playClickSound(); onSelect(1); }}
        >
          <div className="diff-card-badge">🟢 EASY</div>
          <h3>Gentle &amp; Relaxing</h3>
          <p>Fewer items, gentle pace, and extra helpful cues.</p>
          <div className="diff-stars-preview">
            <Star size={18} fill="#2E7D32" color="#2E7D32" />
            <span>Bonus Stars</span>
          </div>
          <span className="diff-play-tag">Start Easy &rarr;</span>
        </button>

        <button 
          type="button"
          className="difficulty-card diff-medium"
          onClick={() => { playClickSound(); onSelect(2); }}
        >
          <div className="diff-card-badge">🟠 MEDIUM</div>
          <h3>Balanced Challenge</h3>
          <p>Standard pace with delightful memory exercise.</p>
          <div className="diff-stars-preview">
            <Star size={18} fill="#E65100" color="#E65100" />
            <Star size={18} fill="#E65100" color="#E65100" />
            <span>More Stars</span>
          </div>
          <span className="diff-play-tag">Start Medium &rarr;</span>
        </button>

        <button 
          type="button"
          className="difficulty-card diff-hard"
          onClick={() => { playClickSound(); onSelect(3); }}
        >
          <div className="diff-card-badge">🔴 HARD</div>
          <h3>Mastery Challenge</h3>
          <p>More pieces, faster tempo, and deeper cognitive focus.</p>
          <div className="diff-stars-preview">
            <Star size={18} fill="#C62828" color="#C62828" />
            <Star size={18} fill="#C62828" color="#C62828" />
            <Star size={18} fill="#C62828" color="#C62828" />
            <span>Max Stars</span>
          </div>
          <span className="diff-play-tag">Start Hard &rarr;</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. CARD MATCH / MEMORY FLIP
// -------------------------------------------------------------
function MatchGame({ game, stage, difficulty = 2, onFinish, language }) {
  const pairLimit = difficulty === 1 ? 3 : difficulty === 2 ? 6 : Math.min(8, game.content.pairs.length);
  const [deck, setDeck] = useState(() => createMatchDeck(game.content.pairs, pairLimit));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [turns, setTurns] = useState(0);
  const busy = open.length === 2;

  const select = card => {
    if (busy || open.includes(card.key) || matched.includes(card.id)) return;
    playClickSound();
    const nextOpen = [...open, card.key];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;
    const first = deck.find(item => item.key === nextOpen[0]);
    const nextTurns = turns + 1;
    setTurns(nextTurns);
    if (first.id === card.id) {
      const nextMatched = [...matched, card.id];
      setMatched(nextMatched);
      playSuccessSound();
      setTimeout(() => setOpen([]), 350);
      if (nextMatched.length === pairLimit) {
        setTimeout(() => onFinish(pairLimit, nextTurns, 0), 450);
      }
    } else {
      setTimeout(() => setOpen([]), 850);
    }
  };

  const reset = () => {
    setDeck(createMatchDeck(game.content.pairs, pairLimit));
    setOpen([]);
    setMatched([]);
    setTurns(0);
  };

  return (
    <div className="match-game-suite">
      <div className="runner-toolbar">
        <p className="toolbar-info">
          <span>Pairs found: <strong>{matched.length} / {pairLimit}</strong></span>
          <span>Turns: <strong>{turns}</strong></span>
        </p>
        <button className="icon-text-btn" onClick={reset}>
          <RotateCcw size={17} /> {t(language, 'actions.repeat')}
        </button>
      </div>

      <div className={`runner-match-grid grid-count-${pairLimit} ${stage === 'severe' ? 'runner-large-targets' : ''}`}>
        {deck.map(card => {
          const isFlipped = open.includes(card.key) || matched.includes(card.id);
          const isDone = matched.includes(card.id);
          return (
            <button
              key={card.key}
              type="button"
              className={`runner-match-card ${isFlipped ? 'shown' : ''} ${isDone ? 'matched-card' : ''}`}
              onClick={() => select(card)}
              aria-label={isFlipped ? card.label : 'Hidden card'}
            >
              {isFlipped ? (
                <div className="card-face-content">
                  {card.photoUrl ? (
                    <img src={card.photoUrl} alt="" className="match-card-photo" />
                  ) : (
                    <span className="match-card-symbol">{card.symbol}</span>
                  )}
                  <span className="match-card-label">{card.label}</span>
                </div>
              ) : (
                <span className="match-card-back" aria-hidden="true">🪷</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. SEQUENCE REPEAT
// -------------------------------------------------------------
function SequenceGame({ game, stage, difficulty = 2, onFinish, language }) {
  const seqLength = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  const items = game.content.items.slice(0, difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6);

  const [sequence, setSequence] = useState(() => Array.from({ length: seqLength }, () => items[Math.floor(Math.random() * items.length)].id));
  const [activeStep, setActiveStep] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [retryQuote, setRetryQuote] = useState('');

  const playSequence = async (seqToPlay) => {
    setIsPlaying(true);
    setUserAnswer([]);
    setRetryQuote('');
    const toneDuration = difficulty === 1 ? 0.6 : difficulty === 2 ? 0.45 : 0.35;
    const pauseTime = difficulty === 1 ? 650 : difficulty === 2 ? 500 : 400;

    for (let i = 0; i < seqToPlay.length; i++) {
      await new Promise(r => setTimeout(r, 250));
      const id = seqToPlay[i];
      const item = items.find(it => it.id === id);
      setActiveStep(id);
      playSynthTone(item?.freq || 380, toneDuration);
      await new Promise(r => setTimeout(r, pauseTime));
      setActiveStep(null);
    }
    setIsPlaying(false);
    speakText("Now your turn! Tap the colors in the same order.", null, language);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playSequence(sequence);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleUserTap = (id) => {
    if (isPlaying) return;
    const item = items.find(it => it.id === id);
    playSynthTone(item?.freq || 400, 0.3);
    playClickSound();

    const expectedId = sequence[userAnswer.length];
    if (id === expectedId) {
      const nextAnswer = [...userAnswer, id];
      setUserAnswer(nextAnswer);
      if (nextAnswer.length === sequence.length) {
        playSuccessSound();
        onFinish(sequence.length, sequence.length + mistakes, mistakes);
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      const encQuote = getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES);
      setRetryQuote(encQuote);
      speakText(encQuote, null, language);
      setTimeout(() => {
        playSequence(sequence);
      }, 1400);
    }
  };

  return (
    <div className="sequence-game-suite">
      <div className="sequence-prompt-banner">
        <h3>{isPlaying ? "👀 Watch & Listen Carefully..." : "👉 Your Turn! Tap the matching pattern"}</h3>
        <p className="sequence-step-counter">Step: <strong>{userAnswer.length} / {sequence.length}</strong></p>
      </div>

      {retryQuote && (
        <div className="encouragement-toast">
          <AlertCircle size={20} />
          <span>{retryQuote}</span>
        </div>
      )}

      <div className="simon-buttons-grid">
        {items.map(item => {
          const isLit = activeStep === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`simon-pad-btn ${isLit ? 'lit-pad' : ''}`}
              style={{ '--pad-color': item.color || '#2E7D32' }}
              onClick={() => handleUserTap(item.id)}
              disabled={isPlaying}
              aria-label={item.label}
            >
              <span className="simon-symbol">{item.symbol}</span>
              <span className="simon-name">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sequence-footer-controls">
        <button
          type="button"
          className="game-secondary-btn"
          onClick={() => playSequence(sequence)}
          disabled={isPlaying}
        >
          <RotateCcw size={18} /> Repeat Pattern
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. FAMILIAR ROUTE PUZZLE (Auto-Randomized Landmark Jigsaw)
// -------------------------------------------------------------
function JigsawRouteGame({ game, stage, difficulty = 2, anchors = [], onFinish, language }) {
  const landmarks = game.content.landmarks || [];
  // Auto-randomize landmark on load
  const [randomLandmark] = useState(() => {
    const pool = landmarks.length > 0 ? landmarks : [
      { id: 'kaziranga', title: 'Kaziranga National Park', imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=700&auto=format&fit=crop&q=80' }
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const selectedImage = randomLandmark.imageUrl;
  const selectedTitle = randomLandmark.title;
  const [showPreview, setShowPreview] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);

  const rows = difficulty === 1 ? 2 : difficulty === 2 ? 2 : 3;
  const cols = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 3;
  const totalPieces = rows * cols;

  const [pieces, setPieces] = useState(() => initShuffledPieces(rows, cols));
  const [selectedPieceIdx, setSelectedPieceIdx] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  function initShuffledPieces(r, c) {
    const arr = Array.from({ length: r * c }, (_, i) => i);
    let shuffled = shuffle([...arr]);
    if (shuffled.every((val, idx) => val === idx)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  }

  const handleTileClick = (index) => {
    if (isSolved) return;
    playClickSound();

    if (selectedPieceIdx === null) {
      setSelectedPieceIdx(index);
    } else {
      const nextPieces = [...pieces];
      const temp = nextPieces[selectedPieceIdx];
      nextPieces[selectedPieceIdx] = nextPieces[index];
      nextPieces[index] = temp;
      setPieces(nextPieces);
      setSelectedPieceIdx(null);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      if (nextPieces.every((val, idx) => val === idx)) {
        setIsSolved(true);
        playSuccessSound();
        onFinish(totalPieces, nextMoves, 0);
      }
    }
  };

  return (
    <div className="jigsaw-game-suite">
      <div className="jigsaw-board-header">
        <div>
          <h4>🌟 Destination: {selectedTitle}</h4>
          <p className="jigsaw-instructions-note">
            Tap a piece then tap another to swap them into place. (Moves: {moves})
          </p>
        </div>
        <div className="jigsaw-toggles">
          <button 
            type="button" 
            className={`toggle-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={16} /> {showPreview ? 'Hide Guide' : 'Show Guide'}
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${showNumbers ? 'active' : ''}`}
            onClick={() => setShowNumbers(!showNumbers)}
          >
            # Numbers {showNumbers ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="jigsaw-preview-box">
          <img src={selectedImage} alt={selectedTitle} />
          <span>Full Landmark Guide</span>
        </div>
      )}

      <div 
        className={`jigsaw-board-grid rows-${rows} cols-${cols}`}
        style={{
          '--grid-rows': rows,
          '--grid-cols': cols
        }}
      >
        {pieces.map((pieceId, currentPosition) => {
          const originRow = Math.floor(pieceId / cols);
          const originCol = pieceId % cols;
          const bgX = (originCol / (cols - 1 || 1)) * 100;
          const bgY = (originRow / (rows - 1 || 1)) * 100;
          const isSelected = selectedPieceIdx === currentPosition;
          const isInCorrectSlot = pieceId === currentPosition;

          return (
            <button
              key={`${pieceId}-${currentPosition}`}
              type="button"
              className={`jigsaw-tile ${isSelected ? 'selected-tile' : ''} ${isInCorrectSlot ? 'correct-slot' : ''}`}
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundPosition: `${bgX}% ${bgY}%`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`
              }}
              onClick={() => handleTileClick(currentPosition)}
              aria-label={`Tile at slot ${currentPosition + 1}`}
            >
              {showNumbers && (
                <span className={`tile-num-badge ${isInCorrectSlot ? 'correct-num' : ''}`}>
                  {pieceId + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. FAMILY TREE BUILDER (No difficulty, 5s preview, descramble)
// -------------------------------------------------------------
function FamilyTreeGame({ game, anchors = [], onFinish, language }) {
  const defaultMembers = game.content.items || [];
  const [familyMembers, setFamilyMembers] = useState(() => {
    if (anchors.length >= 2) {
      return anchors.map(a => ({
        id: a.id,
        label: a.name,
        role: a.relationship,
        relation: mapRelationToTarget(a.relationship),
        target: mapRelationToTarget(a.relationship),
        symbol: '👤',
        photoUrl: a.photoBlob ? URL.createObjectURL(a.photoBlob) : null
      }));
    }
    return defaultMembers;
  });

  function mapRelationToTarget(rel = '') {
    const low = rel.toLowerCase();
    if (low.includes('grandparent') || low.includes('koka') || low.includes('aita') || low.includes('grandfather') || low.includes('grandmother')) return 'grandparent';
    if (low.includes('parent') || low.includes('father') || low.includes('mother') || low.includes('deuta') || low.includes('maa')) return 'parent';
    if (low.includes('grandchild') || low.includes('grandson') || low.includes('granddaughter') || low.includes('tara')) return 'grandchild';
    return 'child';
  }

  const [phase, setPhase] = useState('preview');
  const [countdown, setCountdown] = useState(5);
  const [placedSlots, setPlacedSlots] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('child');
  const [encouragementMessage, setEncouragementMessage] = useState('Take a loving look at your wonderful family!');

  const branches = [
    { id: 'grandparent', label: 'Grandparents (ককা / আইতা)', subtitle: 'Roots of Wisdom' },
    { id: 'parent', label: 'Parents (দেউতা / মা)', subtitle: 'Pillars of Love' },
    { id: 'child', label: 'Children (ল’ৰা / ছোৱালী)', subtitle: 'Joy & Laughter' },
    { id: 'grandchild', label: 'Grandchildren (নাতি / নাতিনী)', subtitle: 'Little Blessings' }
  ];

  useEffect(() => {
    if (phase !== 'preview') return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setPhase('assemble');
          setEncouragementMessage("Let's gently arrange your family back to their loving branches! ❤️");
          speakText("Now arrange your loving family members back to their branches.", null, language);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember = {
      id: `custom-${Date.now()}`,
      label: newMemberName.trim(),
      role: newMemberRole,
      relation: newMemberRole,
      target: newMemberRole,
      symbol: newMemberRole === 'grandparent' ? '👵' : newMemberRole === 'parent' ? '👨' : '👧'
    };
    setFamilyMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setShowAddModal(false);
  };

  const handleSelectMember = (member) => {
    playClickSound();
    setSelectedMember(member);
    setEncouragementMessage(`Where does ${member.label} belong on our family tree?`);
  };

  const handlePlaceOnBranch = (branchId) => {
    if (!selectedMember) return;
    playClickSound();

    if (selectedMember.target === branchId) {
      playSuccessSound();
      const nextPlaced = { ...placedSlots, [selectedMember.id]: branchId };
      setPlacedSlots(nextPlaced);
      setSelectedMember(null);
      setEncouragementMessage(`Wonderful! ${selectedMember.label} is in the right place! 🌸`);

      if (Object.keys(nextPlaced).length === familyMembers.length) {
        onFinish(familyMembers.length, familyMembers.length, 0);
      }
    } else {
      const retryQuote = getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES);
      setEncouragementMessage(`Almost! Think about which branch ${selectedMember.label} is on. ${retryQuote}`);
      speakText(retryQuote, null, language);
    }
  };

  const unplacedMembers = familyMembers.filter(m => !placedSlots[m.id]);

  return (
    <div className="family-tree-suite">
      <div className="family-tree-header">
        <div className="tree-msg-box">
          <Heart size={22} className="heart-pulse-icon" />
          <p>{encouragementMessage}</p>
        </div>

        <button 
          type="button" 
          className="icon-text-btn add-member-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Family Member
        </button>
      </div>

      {phase === 'preview' && (
        <div className="tree-preview-overlay">
          <div className="preview-countdown-badge">
            <span>Remembering tree in: <strong>{countdown}s</strong></span>
          </div>

          <div className="family-branches-container preview-mode">
            {branches.map(branch => {
              const members = familyMembers.filter(m => m.target === branch.id);
              return (
                <div key={branch.id} className="family-branch-level">
                  <div className="branch-label-tag">
                    <h4>{branch.label}</h4>
                    <span>{branch.subtitle}</span>
                  </div>
                  <div className="branch-members-row">
                    {members.map(member => (
                      <div key={member.id} className="family-node-card">
                        <span className="node-avatar">{member.symbol}</span>
                        <span className="node-name">{member.label}</span>
                        <small className="node-role">{member.role}</small>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === 'assemble' && (
        <div className="tree-assemble-view">
          <div className="unplaced-tray-card">
            <h4>Family Members ({unplacedMembers.length} remaining)</h4>
            <p className="tray-instruction">Tap a family member, then tap their tree branch below:</p>
            <div className="unplaced-nodes-list">
              {unplacedMembers.map(member => {
                const isSelected = selectedMember?.id === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    className={`unplaced-member-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectMember(member)}
                  >
                    <span className="node-avatar">{member.symbol}</span>
                    <div className="node-text">
                      <strong>{member.label}</strong>
                      <small>{member.role}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="family-branches-container active-rebuild">
            {branches.map(branch => {
              const placedHere = familyMembers.filter(m => placedSlots[m.id] === branch.id);
              return (
                <div 
                  key={branch.id} 
                  className={`family-branch-level drop-target-branch ${selectedMember ? 'ready-to-drop' : ''}`}
                  onClick={() => handlePlaceOnBranch(branch.id)}
                >
                  <div className="branch-label-tag">
                    <h4>{branch.label}</h4>
                    <span className="branch-placed-count">{placedHere.length} placed &bull; Tap to place here</span>
                  </div>
                  <div className="branch-members-row">
                    {placedHere.length > 0 ? (
                      placedHere.map(m => (
                        <div key={m.id} className="family-node-card placed-node">
                          <span className="node-avatar">{m.symbol}</span>
                          <span className="node-name">{m.label}</span>
                          <small className="node-role">{m.role}</small>
                        </div>
                      ))
                    ) : (
                      <div className="empty-branch-slot">
                        <span>Place {branch.label} here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-backdrop-mini">
          <div className="modal-card-mini">
            <header className="mini-header">
              <h3>Add Family Member</h3>
              <button className="close-mini-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </header>
            <form onSubmit={handleAddMember} className="mini-form">
              <label className="stacked-field">
                <span>Name of Family Member</span>
                <input 
                  value={newMemberName} 
                  onChange={e => setNewMemberName(e.target.value)} 
                  placeholder="e.g. Mina, Raju, Anil..." 
                  required 
                  autoFocus 
                />
              </label>
              <label className="stacked-field">
                <span>Relation</span>
                <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)}>
                  <option value="grandparent">Grandparent (ককা / আইতা)</option>
                  <option value="parent">Parent (দেউতা / মা)</option>
                  <option value="child">Child (ল’ৰা / ছোৱালী)</option>
                  <option value="grandchild">Grandchild (নাতি / নাতিনী)</option>
                </select>
              </label>
              <div className="mini-actions">
                <button type="button" className="game-secondary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="game-primary-btn">Save to Tree</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 6. PHOTO DIARY RECALL (Pure Photo Journal & Reflections - No Quiz, No Difficulty)
// -------------------------------------------------------------
function PhotoDiaryGame({ game, stage, onFinish, language }) {
  const defaultMoments = game.content.diaryMoments || [];
  const [diaryMoments, setDiaryMoments] = useState(defaultMoments);
  const [activeTab, setActiveTab] = useState('diary'); // 'diary' | 'upload'

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Morning (8:00 AM)');
  const [newLoveText, setNewLoveText] = useState('');
  const [newThinkText, setNewThinkText] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoUrl(URL.createObjectURL(file));
  };

  const handleSaveDiary = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const entry = {
      id: `diary-${Date.now()}`,
      title: newTitle.trim(),
      timeOfDay: newTime,
      imageUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      whatILove: newLoveText.trim() || 'A heartwarming moment spent with cherished family.',
      whatItMakesMeThink: newThinkText.trim() || 'Reminds me of love, smiles, and peaceful moments.',
      date: 'Today'
    };
    setDiaryMoments(prev => [entry, ...prev]);
    setActiveTab('diary');
    setNewTitle('');
    setNewLoveText('');
    setNewThinkText('');
    setNewPhotoUrl(null);
    playSuccessSound();
    onFinish(diaryMoments.length + 1, diaryMoments.length + 1, 0);
  };

  return (
    <div className="photo-diary-suite">
      <div className="diary-tab-switcher">
        <button 
          type="button" 
          className={`diary-tab-btn ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          📖 Cherished Memories ({diaryMoments.length})
        </button>
        <button 
          type="button" 
          className={`diary-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📸 Add New Photo &amp; Reflection
        </button>
      </div>

      {activeTab === 'diary' && (
        <div className="diary-gallery-view">
          <div className="diary-cards-grid">
            {diaryMoments.map(moment => (
              <article key={moment.id} className="diary-moment-card">
                <img src={moment.imageUrl} alt={moment.title} className="moment-photo" />
                <div className="moment-details">
                  <span className="moment-date-tag">{moment.date} &bull; {moment.timeOfDay}</span>
                  <h4>{moment.title}</h4>
                  <div className="reflection-block">
                    <p className="reflect-love">
                      <strong>💖 What I love:</strong> {moment.whatILove}
                    </p>
                    <p className="reflect-think">
                      <strong>💭 Thoughts &amp; Memories:</strong> {moment.whatItMakesMeThink}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <form onSubmit={handleSaveDiary} className="diary-upload-form">
          <div className="upload-form-header">
            <h3>Add a Photo &amp; Loving Thoughts</h3>
            <p>Reflect on what makes this picture special to your heart.</p>
          </div>

          <label className="stacked-field">
            <span>Choose Photo from Device</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          {newPhotoUrl && (
            <div className="photo-preview-wrap">
              <img src={newPhotoUrl} alt="Preview" />
            </div>
          )}

          <label className="stacked-field">
            <span>Title / What is happening in this picture?</span>
            <input 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="e.g. Morning tea on the sunny verandah" 
              required 
            />
          </label>

          <label className="stacked-field">
            <span>When was this taken?</span>
            <select value={newTime} onChange={e => setNewTime(e.target.value)}>
              <option value="Morning (8:00 AM)">Morning</option>
              <option value="Afternoon (2:00 PM)">Afternoon</option>
              <option value="Evening (6:30 PM)">Evening</option>
              <option value="Special Festival Day">Special Festival Day</option>
            </select>
          </label>

          <label className="stacked-field">
            <span>💖 What do you love about this picture?</span>
            <textarea 
              value={newLoveText} 
              onChange={e => setNewLoveText(e.target.value)} 
              placeholder="e.g. I love the cheerful smiles and morning mountain breeze..." 
              rows={2} 
            />
          </label>

          <label className="stacked-field">
            <span>💭 What does this picture make you think about?</span>
            <textarea 
              value={newThinkText} 
              onChange={e => setNewThinkText(e.target.value)} 
              placeholder="e.g. It reminds me of peaceful family conversations and joy..." 
              rows={2} 
            />
          </label>

          <button type="submit" className="game-primary-btn">
            <Heart size={18} /> Save &amp; Cherish Photo
          </button>
        </form>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 7. NEW GAME: TABLETOP OBJECT PICKUP
// -------------------------------------------------------------
function TableObjectGame({ game, stage, difficulty = 2, onFinish, language }) {
  const rounds = game.content.rounds || [];
  const [roundIdx, setRoundIdx] = useState(0);
  const currentRound = rounds[roundIdx % rounds.length];

  const [collectedIds, setCollectedIds] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [encouragement, setEncouragement] = useState('');

  const targetCount = difficulty === 1 ? Math.min(2, currentRound.targetCount) : currentRound.targetCount;
  const targetItems = currentRound.items.filter(it => it.type === currentRound.targetId);
  const distractorItems = currentRound.items.filter(it => it.type !== currentRound.targetId);
  
  // Scale items count by difficulty
  const activeItems = useMemo(() => {
    const needed = targetItems.slice(0, targetCount);
    const distCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : distractorItems.length;
    return shuffle([...needed, ...distractorItems.slice(0, distCount)]);
  }, [roundIdx, difficulty]);

  const handlePickItem = (item) => {
    playClickSound();

    if (item.type === currentRound.targetId) {
      if (collectedIds.includes(item.id)) return;
      const nextCollected = [...collectedIds, item.id];
      setCollectedIds(nextCollected);
      playSuccessSound();

      if (nextCollected.length >= targetCount) {
        if (roundIdx >= rounds.length - 1) {
          onFinish(rounds.length, rounds.length + mistakes, mistakes);
        } else {
          setTimeout(() => {
            setRoundIdx(r => r + 1);
            setCollectedIds([]);
            setEncouragement('');
          }, 600);
        }
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      const encQuote = getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES);
      setEncouragement(encQuote);
      speakText(encQuote, null, language);
    }
  };

  return (
    <div className="tabletop-game-suite">
      <div className="tabletop-prompt-banner">
        <span className="prompt-badge">Round {roundIdx + 1} of {rounds.length}</span>
        <h2>{currentRound.prompt}</h2>
        <p className="collection-status">
          Collected: <strong>{collectedIds.length} / {targetCount}</strong>
        </p>
      </div>

      {encouragement && (
        <div className="encouragement-toast">
          <AlertCircle size={20} />
          <span>{encouragement}</span>
        </div>
      )}

      <div className="tabletop-wooden-surface">
        <div className="table-cloth-pattern"></div>
        {activeItems.map((item) => {
          const isCollected = collectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`tabletop-item-btn ${isCollected ? 'collected-pop' : ''}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rot}deg) scale(${item.size})`
              }}
              onClick={() => handlePickItem(item)}
              disabled={isCollected}
              title={item.label}
              aria-label={item.label}
            >
              <span className="table-item-symbol">{item.symbol}</span>
              <span className="table-item-tooltip">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. NEW GAME: STICKY NOTE NUMBER ORDER
// -------------------------------------------------------------
function StickyNoteGame({ game, stage, difficulty = 2, onFinish, language }) {
  const rounds = game.content.rounds || [];
  const [roundIdx, setRoundIdx] = useState(0);
  const currentRound = rounds[roundIdx % rounds.length];

  // Scale notes count by difficulty
  const maxNotes = difficulty === 1 ? 4 : difficulty === 2 ? 5 : currentRound.notes.length;
  const activeNotes = useMemo(() => {
    return currentRound.notes.slice(0, maxNotes);
  }, [roundIdx, difficulty]);

  const sortedNumbers = useMemo(() => {
    return activeNotes.map(n => n.number).sort((a, b) => a - b);
  }, [activeNotes]);

  const [peeledNumbers, setPeeledNumbers] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleTapSticky = (note) => {
    if (peeledNumbers.includes(note.number)) return;
    playClickSound();

    const nextExpected = sortedNumbers[peeledNumbers.length];
    if (note.number === nextExpected) {
      playSuccessSound();
      const nextPeeled = [...peeledNumbers, note.number];
      setPeeledNumbers(nextPeeled);

      if (nextPeeled.length === sortedNumbers.length) {
        if (roundIdx >= rounds.length - 1) {
          onFinish(rounds.length, rounds.length + mistakes, mistakes);
        } else {
          setTimeout(() => {
            setRoundIdx(r => r + 1);
            setPeeledNumbers([]);
            setFeedback('');
          }, 700);
        }
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      const enc = `Look for the lowest remaining number! ${getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES)}`;
      setFeedback(enc);
      speakText(enc, null, language);
    }
  };

  return (
    <div className="sticky-game-suite">
      <div className="sticky-prompt-banner">
        <span className="prompt-badge">Round {roundIdx + 1} of {rounds.length}</span>
        <h2>Remove Sticky Notes: Lowest &rarr; Largest Number</h2>
        <p className="sticky-target-hint">
          Peeled: <strong>{peeledNumbers.length} / {sortedNumbers.length}</strong> &bull; Next smallest needed: <strong>{sortedNumbers[peeledNumbers.length]}</strong>
        </p>
      </div>

      {feedback && (
        <div className="encouragement-toast">
          <AlertCircle size={20} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="corkboard-wall">
        <div className="cork-texture-bg"></div>
        <div className="sticky-notes-grid">
          {activeNotes.map((note) => {
            const isPeeled = peeledNumbers.includes(note.number);
            return (
              <button
                key={note.id}
                type="button"
                className={`sticky-note-pad ${isPeeled ? 'peeled-off' : ''}`}
                style={{
                  '--note-bg': note.color,
                  transform: `rotate(${note.tilt}deg)`
                }}
                onClick={() => handleTapSticky(note)}
                disabled={isPeeled}
                aria-label={`Sticky note ${note.number}`}
              >
                <div className="pin-dot">📌</div>
                <span className="sticky-number-text">{note.number}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. WORD ASSOCIATION (Multi-Language)
// -------------------------------------------------------------
function WordAssociationGame({ game, stage, difficulty = 2, onFinish, language = 'en' }) {
  const [selectedLang, setSelectedLang] = useState(language === 'as' ? 'as' : 'en');
  const availableLangs = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'as', label: '🇮🇳 অসমীয়া' },
    { code: 'bn', label: '🇮🇳 বাংলা' },
    { code: 'hi', label: '🇮🇳 हिन्दी' },
    { code: 'brx', label: '🇮🇳 बड़ो' }
  ];

  const langRounds = game.content.languages?.[selectedLang] || game.content.rounds;
  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState('');

  const currentRound = langRounds[roundIdx % langRounds.length];
  const maxChoices = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  const shownOptions = currentRound.options.slice(0, maxChoices);
  const correctOptionId = currentRound.correct;

  const handleSelectWord = (optionId) => {
    const nextTries = tries + 1;
    setTries(nextTries);

    if (optionId === correctOptionId) {
      playSuccessSound();
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setFeedback(currentRound.explanation || 'Perfect match!');

      setTimeout(() => {
        if (roundIdx >= Math.min(4, langRounds.length - 1)) {
          onFinish(nextCorrect, nextTries, nextTries - nextCorrect);
        } else {
          setRoundIdx(r => r + 1);
          setFeedback('');
        }
      }, 700);
    } else {
      const encQuote = getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES);
      setFeedback(encQuote);
      speakText(encQuote, null, selectedLang);
    }
  };

  return (
    <div className="word-assoc-suite">
      <div className="lang-selector-strip">
        <span className="lang-strip-title">Language:</span>
        <div className="lang-pill-buttons">
          {availableLangs.map(l => (
            <button
              key={l.code}
              type="button"
              className={`lang-pill ${selectedLang === l.code ? 'active' : ''}`}
              onClick={() => { setSelectedLang(l.code); setRoundIdx(0); setFeedback(''); }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="word-prompt-card">
        <span className="word-step-badge">Round {roundIdx + 1}</span>
        <h2 className="prompt-word-large">{currentRound.prompt}</h2>
        <p className="prompt-instruction">Which word is warmly connected to this?</p>
      </div>

      <div className="assoc-choices-grid">
        {shownOptions.map(opt => (
          <button
            key={opt.id}
            type="button"
            className="assoc-choice-btn"
            onClick={() => handleSelectWord(opt.id)}
          >
            <span className="assoc-choice-text">{opt.label}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="assoc-feedback-box">
          <Lightbulb size={20} />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 10. STANDARD ENGINES (Recall, Choice, Sorting, Action)
// -------------------------------------------------------------
function RecallGame({ game, stage, onFinish, language }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [studying, setStudying] = useState(true);
  const [correct, setCorrect] = useState(0);
  const [tries, setTries] = useState(0);
  const round = game.content.rounds[roundIndex];
  const choices = stage === 'severe' ? round.choices.slice(0, 2) : round.choices;

  const choose = index => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (index !== round.correct) {
      speakText(getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES), null, language);
      setStudying(true);
      return;
    }
    const nextCorrect = correct + 1;
    setCorrect(nextCorrect);
    if (roundIndex === game.content.rounds.length - 1) onFinish(nextCorrect, nextTries, nextTries - nextCorrect);
    else { setRoundIndex(value => value + 1); setStudying(true); }
  };

  return (
    <div className="recall-runner">
      {studying ? (
        <div className="study-card">
          <Eye size={28} />
          <h3>Take your time to remember</h3>
          <div className="study-items">
            {round.shown.map((item, index) => typeof item === 'string' ? (
              <span key={item}>{item}</span>
            ) : (
              <span key={index}>{item.photoUrl && <img src={item.photoUrl} alt="" />}{item.label}</span>
            ))}
          </div>
          <button className="game-primary-btn" onClick={() => setStudying(false)}>I&apos;m ready</button>
        </div>
      ) : (
        <div className="runner-prompt">
          <h3>{round.prompt}</h3>
          <div className="runner-choice-grid">
            {choices.map((label, index) => (
              <button key={label} onClick={() => choose(index)}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceGame({ game, stage, onFinish, audio = false, language }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState('');
  const round = game.content.rounds[roundIndex];
  const options = labelsFor(round.options ?? round.choices);
  const shownOptions = stage === 'severe' ? options.slice(0, 2) : options;
  const correctIndex = typeof round.correct === 'number' ? round.correct : options.findIndex(({ id }) => id === round.correct);

  const playSound = () => {
    if (round.soundUrl) new Audio(round.soundUrl).play().catch(() => speakText(round.prompt));
    else if (round.sound === 'dhol-low') playDrumBeat('low');
    else if (round.sound === 'dhol-high') playDrumBeat('high');
    else if (round.sound === 'xylophone') [261.63, 329.63, 392].forEach((note, index) => setTimeout(() => playXylophoneNote(note), index * 180));
    else speakText(round.prompt, null, language);
  };

  const choose = index => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (index !== correctIndex) {
      setFeedback(round.explanation ?? getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES));
      speakText(getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES), null, language);
      return;
    }
    const nextCorrect = correct + 1;
    setCorrect(nextCorrect);
    setFeedback(round.explanation ?? 'Well done!');
    setTimeout(() => {
      if (roundIndex === game.content.rounds.length - 1) onFinish(nextCorrect, nextTries, nextTries - nextCorrect);
      else { setRoundIndex(value => value + 1); setFeedback(''); }
    }, 550);
  };

  return (
    <div className="choice-runner">
      <div className="runner-prompt">
        <h3>{round.prompt}</h3>
        {audio && (
          <button className="sound-play-btn" onClick={playSound}>
            <Play size={20} /> Play sound
          </button>
        )}
      </div>
      <div className={`runner-choice-grid ${stage === 'severe' ? 'runner-large-targets' : ''}`}>
        {shownOptions.map((entry, index) => (
          <button key={`${entry.id}-${index}`} onClick={() => choose(index)}>
            <span>{entry.symbol}</span>{entry.label}
          </button>
        ))}
      </div>
      {feedback && <p className="runner-feedback" aria-live="polite"><Lightbulb size={18} /> {feedback}</p>}
    </div>
  );
}

function SortingGame({ game, onFinish, language }) {
  const [selected, setSelected] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [mistakes, setMistakes] = useState(0);

  const place = targetId => {
    if (!selected) return;
    const item = game.content.items.find(entry => entry.id === selected);
    if (item.target !== targetId) {
      setMistakes(value => value + 1);
      speakText(getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES), null, language);
      return;
    }
    const next = [...placed, selected];
    setPlaced(next);
    setSelected(null);
    if (next.length === game.content.items.length) onFinish(next.length, next.length + mistakes, mistakes);
  };

  return (
    <div className="sorting-runner">
      <p>Choose an item, then choose its group.</p>
      <div className="sort-items">
        {game.content.items.filter(item => !placed.includes(item.id)).map(item => (
          <button className={selected === item.id ? 'selected' : ''} key={item.id} onClick={() => setSelected(item.id)}>
            <span>{item.symbol}</span>{item.label}
          </button>
        ))}
      </div>
      <div className="sort-targets">
        {game.content.targets.map(target => (
          <button key={target.id} onClick={() => place(target.id)}>
            {target.label}
            <small>{game.content.items.filter(item => placed.includes(item.id) && item.target === target.id).length} placed</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionGame({ game, stage, onFinish, language }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [tries, setTries] = useState(0);
  const round = game.content.rounds[roundIndex];

  const advance = success => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (!success) {
      speakText(getRandomQuote(RETRY_ENCOURAGEMENT_QUOTES), null, language);
      return;
    }
    if (roundIndex === game.content.rounds.length - 1) onFinish(game.content.rounds.length, nextTries, nextTries - game.content.rounds.length);
    else setRoundIndex(value => value + 1);
  };

  if (game.content.mode === 'difference') return (
    <div className="difference-runner">
      <h3>{round.prompt}</h3>
      <div className="scene-row">{round.sceneA.map((symbol, index) => <span key={index}>{symbol}</span>)}</div>
      <div className="scene-row">{round.sceneB.map((symbol, index) => <button key={index} onClick={() => advance(index === round.target)}>{symbol}</button>)}</div>
    </div>
  );

  if (game.content.mode === 'color') return (
    <div className="color-runner">
      <h3>{round.prompt}</h3>
      <div className="color-buttons">
        {round.colors.map(color => (
          <button key={color.id} style={{ background: color.value }} onClick={() => advance(color.id === round.target)}>{color.label}</button>
        ))}
      </div>
    </div>
  );

  const position = (roundIndex * 3 + tries) % 9;
  return (
    <div className={`target-runner ${stage === 'severe' ? 'runner-large-targets' : ''}`}>
      <h3>{round.prompt}</h3>
      <div className="target-grid">
        {Array.from({ length: 9 }, (_, index) => (
          <button key={index} onClick={() => advance(index === position)}>
            {index === position ? round.target : round.distractors[index % round.distractors.length]}
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 11. PROGRESS REPORT & SHARE MODAL
// -------------------------------------------------------------
function ProgressReportModal({ result, game, playerName, anchors = [], motivationalQuote, onClose }) {
  const [selectedRecipient, setSelectedRecipient] = useState(anchors[0]?.name || 'Family Member');
  const [sharedToast, setSharedToast] = useState('');

  const starsEarned = result.earnedStars || 15;
  const accuracy = result.accuracy || 100;

  const shareText = `🌟 Sanjibani Progress Update for ${playerName}!\nGame: ${game.name}\nStars Earned: ⭐ +${starsEarned}\nAccuracy: ${accuracy}%\nEncouragement: "${motivationalQuote}"\nShared with loving care from Sanjibani Cognitive Companion.`;

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sanjibani Progress: ${playerName}`,
          text: shareText
        });
        setSharedToast('Progress report shared successfully!');
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      setSharedToast('Report copied to clipboard to share!');
      setTimeout(() => setSharedToast(''), 3000);
    }
  };

  return (
    <div className="runner-complete-report">
      <div className="report-confetti-header">
        <div className="star-burst-badge">
          <Star size={44} fill="#FFC107" color="#FFA000" />
          <span className="stars-earned-num">+{starsEarned} Stars!</span>
        </div>
        <h2>Outstanding Work, {playerName}!</h2>
        <p className="motivational-quote-text">&ldquo;{motivationalQuote}&rdquo;</p>
      </div>

      <div className="report-stats-grid">
        <div className="report-stat-card">
          <Award size={24} color="#2E7D32" />
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>
        <div className="report-stat-card">
          <Star size={24} color="#FF9800" />
          <strong>{starsEarned}</strong>
          <span>Stars Earned</span>
        </div>
        <div className="report-stat-card">
          <Lightbulb size={24} color="#0288D1" />
          <strong>{result.hints || 0}</strong>
          <span>Hints Used</span>
        </div>
      </div>

      <div className="share-report-section">
        <div className="share-header-row">
          <Share2 size={20} color="#2E7D32" />
          <h4>Share Progress with Family</h4>
        </div>
        <p className="share-desc">Keep your loving family updated with your achievements!</p>

        {anchors.length > 0 && (
          <div className="recipient-selector-row">
            <span>Send to:</span>
            <select value={selectedRecipient} onChange={e => setSelectedRecipient(e.target.value)}>
              {anchors.map(a => (
                <option key={a.id} value={a.name}>{a.name} ({a.relationship})</option>
              ))}
            </select>
          </div>
        )}

        <div className="share-buttons-row">
          <button type="button" className="whatsapp-share-btn" onClick={handleShareWhatsApp}>
            <MessageSquare size={18} /> Share via WhatsApp
          </button>
          <button type="button" className="web-share-btn" onClick={handleWebShare}>
            <Copy size={18} /> Copy / Share Report
          </button>
        </div>

        {sharedToast && <p className="shared-toast-msg">{sharedToast}</p>}
      </div>

      <div className="report-footer-actions">
        <button type="button" className="game-primary-btn" onClick={onClose}>
          Back to Game Library
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 12. MAIN GAME RUNNER COMPONENT
// -------------------------------------------------------------
export function GameRunner({ 
  game, 
  stage, 
  difficulty: initialDifficulty = 2, 
  playerName, 
  together, 
  anchors = [], 
  language = 'en', 
  onComplete, 
  onClose 
}) {
  const startedAt = useRef(Date.now());
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  // Family Tree and Photo Diary skip the difficulty selection screen
  const [difficultyChosen, setDifficultyChosen] = useState(
    game.id === 'family-tree' || game.id === 'photo-diary'
  );
  const [result, setResult] = useState(null);
  const [completionQuote, setCompletionQuote] = useState('');

  const mediaUrls = useMemo(() => anchors.flatMap(anchor => [
    anchor.photoBlob ? { id: `${anchor.id}-photo`, url: URL.createObjectURL(anchor.photoBlob) } : null,
    anchor.audioBlob ? { id: `${anchor.id}-audio`, url: URL.createObjectURL(anchor.audioBlob) } : null
  ].filter(Boolean)), [anchors]);

  useEffect(() => {
    speakText(gameInstructions(language, game), null, language);
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { window.removeEventListener('keydown', closeOnEscape); stopSpeaking(); };
  }, [game.id, onClose]);

  useEffect(() => () => mediaUrls.forEach(({ url }) => URL.revokeObjectURL(url)), [mediaUrls]);

  const finish = (correct, total, hints) => {
    if (result) return;
    const scored = scoreRound(correct, total);
    const diffBonus = selectedDifficulty === 1 ? 5 : selectedDifficulty === 2 ? 10 : 15;
    const earnedStars = Math.max(10, Math.round(scored.accuracy / 10) + diffBonus);
    
    const completed = { 
      ...scored, 
      hints, 
      earnedStars, 
      difficulty: selectedDifficulty,
      durationMs: Date.now() - startedAt.current 
    };

    const quote = getRandomQuote(MOTIVATIONAL_QUOTES);
    setCompletionQuote(quote);
    setResult(completed);

    playSuccessSound();
    playStarSound();
    
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      confetti({ 
        particleCount: 80, 
        spread: 80, 
        origin: { y: 0.6 },
        colors: ['#2E7D32', '#FFC107', '#FF5722', '#03A9F4', '#9C27B0']
      });
    }

    speakText(`Wonderful work, ${playerName}! ${quote}`, null, language);
    onComplete(completed);
  };

  const handleDifficultySelected = (diff) => {
    setSelectedDifficulty(diff);
    setDifficultyChosen(true);
  };

  const engineProps = { 
    game, 
    stage, 
    difficulty: selectedDifficulty, 
    anchors, 
    language, 
    onFinish: finish 
  };

  const renderEngine = () => {
    if (game.id === 'card-match') return <MatchGame {...engineProps} />;
    if (game.id === 'sequence-repeat') return <SequenceGame {...engineProps} />;
    if (game.id === 'route-puzzle') return <JigsawRouteGame {...engineProps} />;
    if (game.id === 'family-tree') return <FamilyTreeGame {...engineProps} />;
    if (game.id === 'photo-diary') return <PhotoDiaryGame {...engineProps} />;
    if (game.id === 'word-association') return <WordAssociationGame {...engineProps} />;
    if (game.id === 'table-object-pickup') return <TableObjectGame {...engineProps} />;
    if (game.id === 'sticky-number-order') return <StickyNoteGame {...engineProps} />;

    if (game.engine === 'match') return <MatchGame {...engineProps} />;
    if (game.engine === 'sequence') return <SequenceGame {...engineProps} />;
    if (game.engine === 'recall') return <RecallGame {...engineProps} />;
    if (game.engine === 'choice') return <ChoiceGame {...engineProps} />;
    if (game.engine === 'sorting') return <SortingGame {...engineProps} />;
    if (game.engine === 'audio') return <ChoiceGame {...engineProps} audio />;
    if (game.engine === 'action') return <ActionGame {...engineProps} />;

    return <div className="empty-state"><h3>This game mode is loading.</h3></div>;
  };

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <section 
        className="game-modal-card runner-modal" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="runner-title" 
        onClick={event => event.stopPropagation()}
      >
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">🧠</span>
            <div>
              <h2 className="modal-title" id="runner-title">{gameName(language, game)}</h2>
              <p className="modal-subtitle">
                {together && <><Users size={15} /> Together mode &bull; </>}
                {CATEGORY_LABELS_FOR_TITLE(game.category)}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t(language, 'actions.close')} autoFocus>
            <X size={24} />
          </button>
        </header>

        {!difficultyChosen ? (
          <DifficultySelector game={game} onSelect={handleDifficultySelected} />
        ) : result ? (
          <ProgressReportModal 
            result={result} 
            game={game} 
            playerName={playerName} 
            anchors={anchors} 
            motivationalQuote={completionQuote}
            onClose={onClose} 
          />
        ) : (
          <>
            <div className="runner-instructions">
              {gameInstructions(language, game)}
            </div>
            <div className="game-content runner-content">
              {renderEngine()}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function CATEGORY_LABELS_FOR_TITLE(category) {
  const map = {
    'working-memory': 'Short-Term / Working Memory',
    'long-term-memory': 'Long-Term Memory',
    'semantic-memory': 'Semantic Memory',
    'recognition-memory': 'Facial / Recognition Memory',
    'cultural-long-term': 'Cultural / Long-Term Memory',
    'cultural-episodic': 'Cultural / Episodic-Semantic',
    'sensory': 'Sensory Stimulation',
    'language-memory': 'Language / Long-Term Memory',
    'attention-focus': 'Attention / Focus'
  };
  return map[category] || category;
}
