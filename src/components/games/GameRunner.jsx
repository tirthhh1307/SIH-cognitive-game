import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, Lightbulb, Play, RotateCcw, Users, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createMatchDeck, evaluateOrder, getStageLimit, scoreRound, shuffle } from '../../utils/gameEngine';
import { playClickSound, playDrumBeat, playSuccessSound, playXylophoneNote } from '../../utils/audio';
import { speakText, stopSpeaking } from '../../utils/speech';

const labelsFor = options => options.map((entry, index) => typeof entry === 'string'
  ? { id: index, label: entry, symbol: '' }
  : entry);

function MatchGame({ game, stage, difficulty, onFinish }) {
  const limit = getStageLimit(stage, difficulty, game.content.pairs.length);
  const [deck, setDeck] = useState(() => createMatchDeck(game.content.pairs, limit));
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
      setTimeout(() => setOpen([]), 350);
      if (nextMatched.length === limit) setTimeout(() => onFinish(limit, nextTurns, 0), 450);
    } else {
      setTimeout(() => setOpen([]), 850);
    }
  };

  const reset = () => {
    setDeck(createMatchDeck(game.content.pairs, limit));
    setOpen([]);
    setMatched([]);
    setTurns(0);
  };

  return <>
    <div className="runner-toolbar"><p>Find {limit} matching pairs.</p><button onClick={reset}><RotateCcw size={18} /> Shuffle</button></div>
    <div className={`runner-match-grid ${stage === 'severe' ? 'runner-large-targets' : ''}`}>
      {deck.map(card => {
        const shown = open.includes(card.key) || matched.includes(card.id);
        return <button key={card.key} className={`runner-match-card ${shown ? 'shown' : ''}`} onClick={() => select(card)} aria-label={shown ? card.label : 'Hidden card'}>
          {shown ? <>{card.photoUrl ? <img src={card.photoUrl} alt="" /> : <span>{card.symbol}</span>}<small>{card.label}</small></> : <span aria-hidden="true">?</span>}
        </button>;
      })}
    </div>
  </>;
}

function SequenceGame({ game, stage, difficulty, onFinish }) {
  const repeatMode = game.content.mode === 'repeat';
  const rounds = game.content.rounds ?? [];
  const [roundIndex, setRoundIndex] = useState(0);
  const [watching, setWatching] = useState(repeatMode);
  const [answer, setAnswer] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const items = repeatMode
    ? game.content.items.slice(0, getStageLimit(stage, difficulty, game.content.items.length))
    : rounds[roundIndex].steps;
  const expected = repeatMode ? items.map(({ id }) => id) : items.map(({ id }) => id);
  const choices = useMemo(() => repeatMode ? items : shuffle(items), [game.id, roundIndex, watching]);

  const select = id => {
    if (watching || answer.length >= expected.length) return;
    if (repeatMode) {
      const nextPosition = answer.length;
      if (id !== expected[nextPosition]) {
        setMistakes(value => value + 1);
        setAnswer([]);
        setWatching(true);
        speakText('Let us watch once more.');
        return;
      }
    }
    const next = [...answer, id];
    setAnswer(next);
    if (repeatMode && next.length === expected.length) onFinish(expected.length, expected.length + mistakes, mistakes);
  };

  const checkOrder = () => {
    if (answer.length !== expected.length) return;
    if (evaluateOrder(answer, expected)) {
      if (roundIndex === rounds.length - 1) onFinish(rounds.length, rounds.length + mistakes, mistakes);
      else { setRoundIndex(index => index + 1); setAnswer([]); }
    } else {
      setMistakes(value => value + 1);
      setAnswer([]);
      speakText('Good try. Let us arrange those steps again.');
    }
  };

  return <div className="sequence-runner">
    <div className="runner-prompt">
      <h3>{repeatMode ? (watching ? 'Watch this order' : 'Your turn') : rounds[roundIndex].prompt}</h3>
      {watching && <div className="watch-sequence">{items.map(item => <span key={item.id}>{item.symbol}</span>)}</div>}
      {repeatMode && <button className="game-primary-btn" onClick={() => { setWatching(!watching); setAnswer([]); }}>{watching ? 'Hide pattern & start' : 'Watch again'}</button>}
    </div>
    {!watching && <div className="runner-choice-grid">
      {choices.map(item => <button key={item.id} onClick={() => select(item.id)} disabled={answer.includes(item.id) && !repeatMode}><span>{item.symbol}</span>{item.label}</button>)}
    </div>}
    {!repeatMode && <>
      <div className="answer-strip">{answer.map(id => { const item = items.find(entry => entry.id === id); return <span key={id}>{item.symbol} {item.label}</span>; })}</div>
      <button className="game-primary-btn" disabled={answer.length !== expected.length} onClick={checkOrder}><Check size={18} /> Check order</button>
    </>}
  </div>;
}

function RecallGame({ game, stage, onFinish }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [studying, setStudying] = useState(true);
  const [correct, setCorrect] = useState(0);
  const [tries, setTries] = useState(0);
  const round = game.content.rounds[roundIndex];
  const choices = stage === 'severe' ? round.choices.slice(0, 2) : round.choices;
  const choose = index => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (index !== round.correct) { speakText('Good try. Look once more.'); setStudying(true); return; }
    const nextCorrect = correct + 1;
    setCorrect(nextCorrect);
    if (roundIndex === game.content.rounds.length - 1) onFinish(nextCorrect, nextTries, nextTries - nextCorrect);
    else { setRoundIndex(value => value + 1); setStudying(true); }
  };
  return <div className="recall-runner">
    {studying ? <div className="study-card"><Eye size={28} /><h3>Take your time</h3><div className="study-items">{round.shown.map((item, index) => typeof item === 'string' ? <span key={item}>{item}</span> : <span key={index}>{item.photoUrl && <img src={item.photoUrl} alt="" />}{item.label}</span>)}</div><button className="game-primary-btn" onClick={() => setStudying(false)}>I&apos;m ready</button></div>
      : <div className="runner-prompt"><h3>{round.prompt}</h3><div className="runner-choice-grid">{choices.map((label, index) => <button key={label} onClick={() => choose(index)}>{label}</button>)}</div></div>}
  </div>;
}

function ChoiceGame({ game, stage, onFinish, audio = false }) {
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
    else speakText(round.prompt);
  };
  const choose = index => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (index !== correctIndex) { setFeedback(round.explanation ?? 'Take another look.'); speakText('Good try. Take another look.'); return; }
    const nextCorrect = correct + 1;
    setCorrect(nextCorrect);
    setFeedback(round.explanation ?? 'Well done!');
    setTimeout(() => {
      if (roundIndex === game.content.rounds.length - 1) onFinish(nextCorrect, nextTries, nextTries - nextCorrect);
      else { setRoundIndex(value => value + 1); setFeedback(''); }
    }, 550);
  };
  return <div className="choice-runner">
    <div className="runner-prompt"><h3>{round.prompt}</h3>{audio && <button className="sound-play-btn" onClick={playSound}><Play size={20} /> Play sound</button>}</div>
    <div className={`runner-choice-grid ${stage === 'severe' ? 'runner-large-targets' : ''}`}>
      {shownOptions.map((entry, index) => <button key={`${entry.id}-${index}`} onClick={() => choose(index)}><span>{entry.symbol}</span>{entry.label}</button>)}
    </div>
    {feedback && <p className="runner-feedback" aria-live="polite"><Lightbulb size={18} /> {feedback}</p>}
  </div>;
}

function SortingGame({ game, onFinish }) {
  const [selected, setSelected] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const place = targetId => {
    if (!selected) return;
    const item = game.content.items.find(entry => entry.id === selected);
    if (item.target !== targetId) { setMistakes(value => value + 1); speakText('Try the other group.'); return; }
    const next = [...placed, selected];
    setPlaced(next);
    setSelected(null);
    if (next.length === game.content.items.length) onFinish(next.length, next.length + mistakes, mistakes);
  };
  return <div className="sorting-runner">
    <p>Choose an item, then its group.</p>
    <div className="sort-items">{game.content.items.filter(item => !placed.includes(item.id)).map(item => <button className={selected === item.id ? 'selected' : ''} key={item.id} onClick={() => setSelected(item.id)}><span>{item.symbol}</span>{item.label}</button>)}</div>
    <div className="sort-targets">{game.content.targets.map(target => <button key={target.id} onClick={() => place(target.id)}>{target.label}<small>{game.content.items.filter(item => placed.includes(item.id) && item.target === target.id).length} placed</small></button>)}</div>
  </div>;
}

function ActionGame({ game, stage, onFinish }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [tries, setTries] = useState(0);
  const round = game.content.rounds[roundIndex];
  const advance = success => {
    const nextTries = tries + 1;
    setTries(nextTries);
    if (!success) { speakText('Almost. Try once more.'); return; }
    if (roundIndex === game.content.rounds.length - 1) onFinish(game.content.rounds.length, nextTries, nextTries - game.content.rounds.length);
    else setRoundIndex(value => value + 1);
  };
  if (game.content.mode === 'difference') return <div className="difference-runner"><h3>{round.prompt}</h3><div className="scene-row">{round.sceneA.map((symbol, index) => <span key={index}>{symbol}</span>)}</div><div className="scene-row">{round.sceneB.map((symbol, index) => <button key={index} onClick={() => advance(index === round.target)}>{symbol}</button>)}</div></div>;
  if (game.content.mode === 'color') return <div className="color-runner"><h3>{round.prompt}</h3><div className="color-buttons">{round.colors.map(color => <button key={color.id} style={{ background: color.value }} onClick={() => advance(color.id === round.target)}>{color.label}</button>)}</div></div>;
  const position = (roundIndex * 3 + tries) % 9;
  return <div className={`target-runner ${stage === 'severe' ? 'runner-large-targets' : ''}`}><h3>{round.prompt}</h3><div className="target-grid">{Array.from({ length: 9 }, (_, index) => <button key={index} onClick={() => advance(index === position)}>{index === position ? round.target : round.distractors[index % round.distractors.length]}</button>)}</div></div>;
}

export function GameRunner({ game, stage, difficulty, playerName, together, anchors = [], onComplete, onClose }) {
  const startedAt = useRef(Date.now());
  const [result, setResult] = useState(null);
  const mediaUrls = useMemo(() => anchors.flatMap(anchor => [
    anchor.photoBlob ? { id: `${anchor.id}-photo`, url: URL.createObjectURL(anchor.photoBlob) } : null,
    anchor.audioBlob ? { id: `${anchor.id}-audio`, url: URL.createObjectURL(anchor.audioBlob) } : null
  ].filter(Boolean)), [anchors]);
  const personalizedGame = useMemo(() => {
    const photoAnchors = anchors.filter(anchor => anchor.photoBlob);
    const audioAnchors = anchors.filter(anchor => anchor.audioBlob);
    if (game.id === 'family-face-match' && photoAnchors.length >= 2) return {
      ...game,
      content: { ...game.content, pairs: photoAnchors.map(anchor => ({ id: anchor.id, label: `${anchor.name} — ${anchor.relationship}`, symbol: '', photoUrl: mediaUrls.find(url => url.id === `${anchor.id}-photo`)?.url })) }
    };
    if (game.id === 'voice-recognition' && audioAnchors.length >= 2) return {
      ...game,
      content: { ...game.content, rounds: audioAnchors.map(anchor => ({ prompt: 'Who is speaking?', soundUrl: mediaUrls.find(url => url.id === `${anchor.id}-audio`)?.url, choices: audioAnchors.slice(0, 3).map(({ name, relationship }) => `${name} — ${relationship}`), correct: audioAnchors.slice(0, 3).findIndex(({ id }) => id === anchor.id) })).filter(round => round.correct >= 0) }
    };
    if (game.id === 'family-tree' && anchors.length >= 3) return {
      ...game,
      content: {
        ...game.content,
        items: anchors.map(anchor => {
          const relation = anchor.relationship.toLowerCase();
          const target = relation.includes('grand') ? 'grandchild'
            : /mother|father|parent|maa|deuta/.test(relation) ? 'parent'
            : 'child';
          return { id: anchor.id, label: anchor.name, symbol: '👤', target };
        })
      }
    };
    if (game.id === 'photo-diary' && photoAnchors.length >= 1) return {
      ...game,
      content: { ...game.content, rounds: photoAnchors.slice(0, 3).map(anchor => ({ shown: [{ label: `${anchor.name} — ${anchor.relationship}`, photoUrl: mediaUrls.find(url => url.id === `${anchor.id}-photo`)?.url }], prompt: 'Who is shown in this memory?', choices: photoAnchors.slice(0, 3).map(({ name }) => name), correct: photoAnchors.slice(0, 3).findIndex(({ id }) => id === anchor.id) })).filter(round => round.correct >= 0) }
    };
    return game;
  }, [anchors, game, mediaUrls]);
  const usingDemo = Boolean(game.content.source) && personalizedGame === game;

  useEffect(() => {
    speakText(personalizedGame.instructions);
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { window.removeEventListener('keydown', closeOnEscape); stopSpeaking(); };
  }, [personalizedGame.id, onClose, mediaUrls]);

  useEffect(() => () => mediaUrls.forEach(({ url }) => URL.revokeObjectURL(url)), [mediaUrls]);

  const finish = (correct, total, hints) => {
    if (result) return;
    const scored = scoreRound(correct, total);
    const completed = { ...scored, hints, durationMs: Date.now() - startedAt.current };
    setResult(completed);
    playSuccessSound();
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) confetti({ particleCount: 60, spread: 70 });
    speakText(together ? `Wonderful teamwork, ${playerName}!` : `Wonderful work, ${playerName}!`);
    onComplete(completed);
  };

  const props = { game: personalizedGame, stage, difficulty, onFinish: finish };
  const engine = personalizedGame.engine === 'match' ? <MatchGame {...props} />
    : personalizedGame.engine === 'sequence' ? <SequenceGame {...props} />
    : personalizedGame.engine === 'recall' ? <RecallGame {...props} />
    : personalizedGame.engine === 'choice' ? <ChoiceGame {...props} />
    : personalizedGame.engine === 'sorting' ? <SortingGame {...props} />
    : personalizedGame.engine === 'audio' ? <ChoiceGame {...props} audio />
    : personalizedGame.engine === 'action' ? <ActionGame {...props} />
    : <div className="empty-state"><h3>This game mode is unavailable.</h3></div>;

  return <div className="game-modal-backdrop" onClick={onClose}>
    <section className="game-modal-card runner-modal" role="dialog" aria-modal="true" aria-labelledby="runner-title" onClick={event => event.stopPropagation()}>
      <header className="modal-header">
        <div className="modal-title-group"><span className="modal-badge-icon">🧠</span><div><h2 className="modal-title" id="runner-title">{game.name}</h2><p className="modal-subtitle">{together && <><Users size={15} /> Together mode · </>}{stage} · level {difficulty}</p></div></div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close game"><X size={24} /></button>
      </header>
      <div className="runner-instructions">{personalizedGame.instructions}</div>
      {usingDemo && <div className="demo-content-note">Using demo family memories—add your own in Memory Anchors.</div>}
      <div className="game-content runner-content">
        {result ? <div className="runner-complete"><span>⭐</span><h3>{together ? 'Wonderful teamwork!' : 'Round complete!'}</h3><p>{result.accuracy}% accuracy · {result.hints} hints</p><button className="game-primary-btn" onClick={onClose}>Back to library</button></div> : engine}
      </div>
    </section>
  </div>;
}
