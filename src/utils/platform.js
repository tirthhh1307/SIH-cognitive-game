import { enqueueSyncAction, SYNC_ACTION_TYPES } from './syncQueue.js';

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
      highContrast: false,
      scenicBackgroundIndex: 0,
      scenicAutoSlide: true
    },
    garden: {
      pots: [
        // Row 1 (Top Tier)
        { id: 1, plantId: 'orchid', stage: 3, waterLevel: 75, starsToCollect: 8, lastCared: Date.now(), needs: 'water' },
        { id: 2, plantId: 'tea', stage: 2, waterLevel: 60, starsToCollect: 4, lastCared: Date.now(), needs: null },
        { id: 3, plantId: 'lotus', stage: 4, waterLevel: 90, starsToCollect: 14, lastCared: Date.now(), needs: null },
        { id: 4, plantId: 'hibiscus', stage: 1, waterLevel: 40, starsToCollect: 0, lastCared: Date.now(), needs: 'water' },
        // Row 2
        { id: 5, plantId: 'bamboo', stage: 2, waterLevel: 80, starsToCollect: 6, lastCared: Date.now(), needs: null },
        { id: 6, plantId: 'jasmine', stage: 3, waterLevel: 50, starsToCollect: 9, lastCared: Date.now(), needs: 'fertilizer' },
        { id: 7, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 8, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        // Row 3
        { id: 9, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 10, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 11, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 12, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        // Row 4 (Bottom Tier)
        { id: 13, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 14, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 15, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null },
        { id: 16, plantId: null, stage: 0, waterLevel: 0, starsToCollect: 0, lastCared: null, needs: null }
      ],
      inventory: {
        seeds: { orchid: 2, tea: 2, hibiscus: 2, lotus: 1, bamboo: 1, jasmine: 2, marigold: 2, brahma_kamal: 0 },
        water: 25,
        fertilizer: 6,
        sunlight: 3,
        music: 3
      },
      bgmEnabled: true
    },
    patients: [
      {
        id: 'patient-1',
        name: 'Biren Das',
        age: 72,
        gender: 'Male',
        village: 'Kamalabari, Majuli',
        district: 'Majuli',
        state: 'Assam',
        stage: 'mild',
        language: 'as',
        emergencyName: 'Ramen Das (Son)',
        emergencyPhone: '9864012345',
        notes: 'Enjoys traditional Bihu rhythms and tea estate memory recall. Shows mild short-term retrieval delay.',
        createdAt: Date.now() - 86400000 * 30
      },
      {
        id: 'patient-2',
        name: 'Memi Devi / Chanu',
        age: 68,
        gender: 'Female',
        village: 'Moirang, Loktak',
        district: 'Bishnupur',
        state: 'Manipur',
        stage: 'early',
        language: 'en',
        emergencyName: 'Ibomcha Singh (Nephew)',
        emergencyPhone: '9436054321',
        notes: 'Responsive to visual Loktak fishing and weaving anchors. Excellent orientation scores.',
        createdAt: Date.now() - 86400000 * 14
      }
    ],
    activePatientId: 'patient-1',
    caregiverPin: '1234',
    difficultyByGame: {},
    reportsExported: 0,
    journalEntries: []
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
      garden: saved.garden && typeof saved.garden === 'object' ? {
        ...initial.garden,
        ...saved.garden,
        pots: Array.isArray(saved.garden.pots) && saved.garden.pots.length >= 6
          ? (saved.garden.pots.length < initial.garden.pots.length
              ? [...saved.garden.pots, ...initial.garden.pots.slice(saved.garden.pots.length)]
              : saved.garden.pots)
          : initial.garden.pots,
        inventory: {
          ...initial.garden.inventory,
          ...(saved.garden.inventory ?? {}),
          seeds: {
            ...initial.garden.inventory.seeds,
            ...(saved.garden.inventory?.seeds ?? {})
          }
        }
      } : initial.garden,
      patients: Array.isArray(saved.patients) && saved.patients.length > 0 ? saved.patients : initial.patients,
      activePatientId: saved.activePatientId || initial.activePatientId,
      caregiverPin: saved.caregiverPin || initial.caregiverPin,
      baseline: saved.baseline && typeof saved.baseline === 'object' ? saved.baseline : {},
      difficultyByGame: saved.difficultyByGame && typeof saved.difficultyByGame === 'object' ? saved.difficultyByGame : {},
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      checkIns: Array.isArray(saved.checkIns) ? saved.checkIns : [],
      reminders: Array.isArray(saved.reminders) ? saved.reminders : [],
      journalEntries: Array.isArray(saved.journalEntries) ? saved.journalEntries : []
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

  // Automatically enqueue offline sync action for caregiver portal
  try {
    enqueueSyncAction(
      SYNC_ACTION_TYPES.ASSESSMENT_COMPLETED,
      attempt,
      state.activePatientId || 'patient-1'
    );
  } catch (err) {
    console.error('Failed to enqueue sync attempt', err);
  }

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

export function addCheckIn(state, checkIn) {
  if (!checkIn?.id || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn.date) || !['great', 'calm', 'tired', 'worried', 'sad'].includes(checkIn.mood)) {
    return state;
  }
  const previous = state.checkIns.filter(entry => entry.date !== checkIn.date);
  return { ...state, checkIns: [...previous, checkIn].slice(-90) };
}

export function upsertReminder(state, reminder) {
  if (!reminder?.id || !reminder.label?.trim() || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time)) return state;
  const normalized = { ...reminder, label: reminder.label.trim(), enabled: Boolean(reminder.enabled) };
  const index = state.reminders.findIndex(entry => entry.id === reminder.id);
  const reminders = [...state.reminders];
  if (index === -1) reminders.push(normalized);
  else reminders[index] = normalized;
  return { ...state, reminders };
}

export function removeReminder(state, reminderId) {
  return { ...state, reminders: state.reminders.filter(reminder => reminder.id !== reminderId) };
}

export function getDueReminders(state, now = new Date()) {
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return state.reminders.filter(reminder => reminder.enabled && reminder.time === time && reminder.lastShownDate !== date);
}

export function setBaselineFromAttempts(state, gameIds) {
  const allowed = new Set(gameIds);
  const grouped = state.attempts
    .filter(attempt => allowed.has(attempt.gameId))
    .reduce((groups, attempt) => {
      (groups[attempt.category] ??= []).push(Number.isFinite(attempt.score) ? attempt.score : attempt.accuracy);
      return groups;
    }, {});
  const entries = Object.entries(grouped);
  if (!entries.length) return state;
  return {
    ...state,
    baseline: {
      ...state.baseline,
      ...Object.fromEntries(entries.map(([category, scores]) => [category, average(scores)]))
    }
  };
}

export function addJournalEntry(state, entry) {
  if (!entry?.id || !entry.text?.trim()) return state;
  const normalized = {
    ...entry,
    text: entry.text.trim(),
    createdAt: entry.createdAt || new Date().toISOString()
  };
  return {
    ...state,
    journalEntries: [normalized, ...(state.journalEntries || [])].slice(0, 100)
  };
}

export function plantSeedInPot(state, potId, plantId) {
  const currentSeeds = state.garden?.inventory?.seeds?.[plantId] ?? 0;
  if (currentSeeds <= 0) return state;

  const pots = (state.garden?.pots || []).map(pot => {
    if (pot.id === potId) {
      return {
        ...pot,
        plantId,
        stage: 0,
        waterLevel: 50,
        starsToCollect: 0,
        lastCared: Date.now()
      };
    }
    return pot;
  });

  return {
    ...state,
    garden: {
      ...state.garden,
      pots,
      inventory: {
        ...state.garden.inventory,
        seeds: {
          ...state.garden.inventory.seeds,
          [plantId]: currentSeeds - 1
        }
      }
    }
  };
}

export function waterGardenPot(state, potId, plantYield = 8) {
  const pots = (state.garden?.pots || []).map(pot => {
    if (pot.id === potId && pot.plantId) {
      const nextStage = pot.stage < 4 ? pot.stage + 1 : 4;
      const bonusStars = nextStage >= 3 ? Math.max(2, Math.floor(plantYield / 2)) : 0;
      return {
        ...pot,
        stage: nextStage,
        waterLevel: 100,
        starsToCollect: (pot.starsToCollect || 0) + bonusStars,
        lastCared: Date.now()
      };
    }
    return pot;
  });

  return {
    ...state,
    garden: {
      ...state.garden,
      pots
    }
  };
}

export function fertilizeGardenPot(state, potId, plantYield = 10) {
  const fert = state.garden?.inventory?.fertilizer ?? 0;
  if (fert <= 0) return state;

  const pots = (state.garden?.pots || []).map(pot => {
    if (pot.id === potId && pot.plantId) {
      const nextStage = Math.min(4, pot.stage + 1);
      const bonus = plantYield;
      return {
        ...pot,
        stage: nextStage,
        waterLevel: 100,
        starsToCollect: (pot.starsToCollect || 0) + bonus,
        lastCared: Date.now()
      };
    }
    return pot;
  });

  return {
    ...state,
    garden: {
      ...state.garden,
      pots,
      inventory: {
        ...state.garden.inventory,
        fertilizer: fert - 1
      }
    }
  };
}

export function careGardenPotWithSpecial(state, potId, careType = 'sunlight', bonusStars = 15) {
  const currentCount = state.garden?.inventory?.[careType] ?? 0;
  if (currentCount <= 0) return state;

  const pots = (state.garden?.pots || []).map(pot => {
    if (pot.id === potId && pot.plantId) {
      return {
        ...pot,
        stage: 4, // Instant radiant bloom
        waterLevel: 100,
        starsToCollect: (pot.starsToCollect || 0) + bonusStars,
        lastCared: Date.now()
      };
    }
    return pot;
  });

  return {
    ...state,
    garden: {
      ...state.garden,
      pots,
      inventory: {
        ...state.garden.inventory,
        [careType]: currentCount - 1
      }
    }
  };
}

export function collectGardenStars(state, potId) {
  let harvested = 0;
  const pots = (state.garden?.pots || []).map(pot => {
    if (pot.id === potId) {
      harvested = pot.starsToCollect || 0;
      return {
        ...pot,
        starsToCollect: 0
      };
    }
    return pot;
  });

  if (harvested <= 0) return state;

  return {
    ...state,
    stars: (state.stars || 0) + harvested,
    garden: {
      ...state.garden,
      pots
    }
  };
}

export function buyGardenMarketItem(state, item) {
  const price = item.price || 0;
  if ((state.stars || 0) < price) return { state, success: false, reason: 'Not enough stars' };

  let updatedInventory = { ...state.garden.inventory };

  if (item.seedPlantId) {
    const current = updatedInventory.seeds?.[item.seedPlantId] ?? 0;
    updatedInventory.seeds = {
      ...updatedInventory.seeds,
      [item.seedPlantId]: current + 1
    };
  } else if (item.type) {
    const current = updatedInventory[item.type] ?? 0;
    updatedInventory[item.type] = current + (item.amount || 1);
  }

  return {
    success: true,
    state: {
      ...state,
      stars: state.stars - price,
      garden: {
        ...state.garden,
        inventory: updatedInventory
      }
    }
  };
}

export function toggleGardenBgm(state) {
  const current = state.garden?.bgmEnabled ?? true;
  return {
    ...state,
    garden: {
      ...state.garden,
      bgmEnabled: !current
    }
  };
}

// ==========================================
// ASHA MULTI-PATIENT ROSTER MANAGEMENT
// ==========================================

export function getActivePatient(state) {
  const patient = state.patients?.find(p => p.id === state.activePatientId);
  return patient || state.patients?.[0] || {
    id: 'patient-1',
    name: state.profile?.name || 'Biren Das',
    stage: state.profile?.stage || 'mild',
    village: 'Kamalabari, Majuli',
    district: 'Majuli',
    state: 'Assam'
  };
}

export function switchActivePatient(state, patientId) {
  const target = state.patients?.find(p => p.id === patientId);
  if (!target) return state;
  return {
    ...state,
    activePatientId: patientId,
    profile: {
      ...state.profile,
      name: target.name,
      stage: target.stage || 'mild',
      language: target.language || state.profile.language || 'en',
      emergencyName: target.emergencyName || '',
      emergencyPhone: target.emergencyPhone || ''
    }
  };
}

export function createPatient(state, patientData) {
  const newPatient = {
    id: `patient-${Date.now()}`,
    name: patientData.name?.trim() || 'New Elder',
    age: Number(patientData.age) || 70,
    gender: patientData.gender || 'Other',
    village: patientData.village?.trim() || 'Rural Village',
    district: patientData.district?.trim() || 'District',
    state: patientData.state || 'Assam',
    stage: patientData.stage || 'mild',
    language: patientData.language || 'en',
    emergencyName: patientData.emergencyName?.trim() || '',
    emergencyPhone: patientData.emergencyPhone?.trim() || '',
    notes: patientData.notes?.trim() || 'Registered by ASHA Community Health Worker.',
    createdAt: Date.now()
  };

  try {
    enqueueSyncAction(SYNC_ACTION_TYPES.PATIENT_CREATED, newPatient, newPatient.id);
  } catch (err) {
    console.error('Failed to enqueue patient sync', err);
  }

  return {
    ...state,
    patients: [...(state.patients || []), newPatient],
    activePatientId: newPatient.id,
    profile: {
      ...state.profile,
      name: newPatient.name,
      stage: newPatient.stage,
      language: newPatient.language
    }
  };
}

export function updateActivePatient(state, updates) {
  const activeId = state.activePatientId;
  const patients = (state.patients || []).map(p => {
    if (p.id === activeId) {
      const updated = { ...p, ...updates };
      try {
        enqueueSyncAction(SYNC_ACTION_TYPES.PATIENT_UPDATED, updated, activeId);
      } catch (err) {
        console.error('Failed to enqueue patient update sync', err);
      }
      return updated;
    }
    return p;
  });

  return {
    ...state,
    patients,
    profile: {
      ...state.profile,
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.stage ? { stage: updates.stage } : {}),
      ...(updates.language ? { language: updates.language } : {})
    }
  };
}

export function deletePatient(state, patientId) {
  const remaining = (state.patients || []).filter(p => p.id !== patientId);
  if (remaining.length === 0) return state; // Prevent deleting last patient
  const nextActive = remaining[0];
  return {
    ...state,
    patients: remaining,
    activePatientId: nextActive.id,
    profile: {
      ...state.profile,
      name: nextActive.name,
      stage: nextActive.stage
    }
  };
}

// ==========================================
// CAREGIVER CLINICAL PIN SECURITY LOCK
// ==========================================

export function verifyCaregiverPin(state, enteredPin) {
  const correctPin = state.caregiverPin || '1234';
  return String(enteredPin).trim() === String(correctPin).trim();
}

export function changeCaregiverPin(state, currentPin, newPin) {
  if (!verifyCaregiverPin(state, currentPin)) {
    return { success: false, reason: 'Current PIN is incorrect' };
  }
  if (!/^\d{4}$/.test(String(newPin).trim())) {
    return { success: false, reason: 'New PIN must be exactly 4 numeric digits' };
  }
  return {
    success: true,
    state: {
      ...state,
      caregiverPin: String(newPin).trim()
    }
  };
}

