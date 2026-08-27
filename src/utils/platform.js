export const STORAGE_KEY = 'cognitive-platform-state-v1';

export function createInitialState() {
  return {
    schemaVersion: 1,
    consent: { accepted: false, acceptedAt: null },
    profile: {
      name: 'Apoi',
      stage: 'mild',
      language: 'en',
      emergencyName: '',
      emergencyPhone: ''
    },
    stars: 120,
    attempts: [],
    baseline: {},
    checkIns: [],
    reminders: [],
    settings: {
      muted: false,
      voice: true,
      fontSize: 'normal',
      highContrast: false
    },
    difficultyByGame: {}
  };
}

export function loadPlatformState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || saved.schemaVersion !== 1) return createInitialState();
    const initial = createInitialState();
    return {
      ...initial,
      ...saved,
      consent: { ...initial.consent, ...(saved.consent ?? {}) },
      profile: { ...initial.profile, ...(saved.profile ?? {}) },
      settings: { ...initial.settings, ...(saved.settings ?? {}) },
      baseline: saved.baseline && typeof saved.baseline === 'object' ? saved.baseline : {},
      difficultyByGame: saved.difficultyByGame && typeof saved.difficultyByGame === 'object' ? saved.difficultyByGame : {},
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      checkIns: Array.isArray(saved.checkIns) ? saved.checkIns : [],
      reminders: Array.isArray(saved.reminders) ? saved.reminders : []
    };
  } catch {
    return createInitialState();
  }
}

export function savePlatformState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function validAttempt(attempt) {
  return Boolean(
    attempt &&
    attempt.gameId &&
    attempt.category &&
    Number.isFinite(attempt.accuracy) &&
    Number.isFinite(Date.parse(attempt.completedAt))
  );
}

export function recordAttempt(state, attempt) {
  if (!validAttempt(attempt)) return state;
  return {
    ...state,
    attempts: [...state.attempts, attempt].slice(-500),
    stars: state.stars + (Number.isFinite(attempt.earnedStars) ? attempt.earnedStars : 0),
    difficultyByGame: {
      ...state.difficultyByGame,
      [attempt.gameId]: attempt.difficulty
    }
  };
}

export function getAdaptiveDifficulty(state, game, stage = state.profile.stage) {
  const range = game.difficulty[stage];
  if (!range) return 1;
  const current = state.difficultyByGame[game.id] ?? range.initial;
  const recent = state.attempts
    .filter(attempt => attempt.gameId === game.id && attempt.stage === stage)
    .slice(-2);
  if (recent.length < 2) return Math.max(range.min, Math.min(range.max, current));
  const strong = recent.every(attempt => attempt.accuracy >= 80 && attempt.hints <= 1);
  const struggling = recent.every(attempt => attempt.accuracy < 50 || attempt.hints >= 2);
  const next = current + (strong ? 1 : struggling ? -1 : 0);
  return Math.max(range.min, Math.min(range.max, next));
}

const average = values => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export function getCategorySummaries(state) {
  const categories = [...new Set([
    ...Object.keys(state.baseline),
    ...state.attempts.map(({ category }) => category)
  ])];
  return categories.map(category => {
    const attempts = state.attempts.filter(attempt => attempt.category === category);
    const scores = attempts.slice(-5).map(attempt => Number.isFinite(attempt.score) ? attempt.score : attempt.accuracy);
    const recentScore = scores.length ? average(scores) : null;
    const baselineScore = Number.isFinite(state.baseline[category]) ? state.baseline[category] : null;
    return {
      category,
      baselineScore,
      recentScore,
      change: baselineScore === null || recentScore === null ? null : recentScore - baselineScore,
      attempts: attempts.length
    };
  });
}

export function getReviewFlags(state) {
  return getCategorySummaries(state).filter(summary => summary.attempts >= 3 && summary.change <= -20);
}

export function exportPlatformData(state) {
  return JSON.stringify(state, null, 2);
}

export function clearPlatformData(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
