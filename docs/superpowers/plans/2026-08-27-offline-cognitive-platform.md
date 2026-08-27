# Offline-First Cognitive Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing React/Vite demo into an installable offline hackathon prototype containing all 26 documented games, local assessments, daily support, memory anchors, and a caregiver dashboard.

**Architecture:** Keep the current single-page React app and scenic home. Add one declarative game catalogue, one shared game runner with seven interaction modes, and native browser persistence through `localStorage`, IndexedDB, Web Speech, service workers, notifications, and `tel:` links. Keep scoring/adaptation pure and tested; components consume those functions without introducing a backend or state library.

**Tech Stack:** React 19, Vite 6, existing Lucide/Canvas Confetti/Web Audio dependencies, native browser APIs, Node `node:test`.

## Global Constraints

- Exactly 26 documented games across 10 cognitive categories.
- Hackathon prototype; screening/engagement support only, never diagnosis.
- Core play and stored data work offline after first successful load.
- Health and personal data remain local unless explicitly exported.
- SMS, IVR, geofencing, cloud AI, clinician systems, and telehealth are visibly labelled demos.
- SOS uses a real `tel:` link where supported.
- English is complete; Assamese is a reviewed pilot for navigation, common instructions, feedback, and representative content.
- No new runtime or test dependency.
- No punitive scoring, lost stars, stressful countdowns, or automatic clinical-stage changes.
- Do not run dev/preview servers automatically; verify with `npm test` and `npm run build`.
- Preserve user-owned deletion of root `AGENTS.md`; never stage it.

## File Map

- `src/data/games.js` — authoritative 26-game configs and catalogue constants.
- `src/data/i18n.js` — English strings and Assamese pilot strings.
- `src/utils/platform.js` — schema migration, local persistence, metrics, adaptation, trends, export/reset.
- `src/utils/mediaStore.js` — IndexedDB family photo/audio CRUD.
- `src/components/AppNav.jsx` — Home/Play/Check-in/Anchors/Caregiver navigation.
- `src/components/ConsentGate.jsx` — first-run consent/local-data disclosure.
- `src/components/GameLibrary.jsx` — search, category/stage filters, game selection.
- `src/components/games/GameRunner.jsx` — modal lifecycle, shared feedback, metrics, seven game modes.
- `src/components/DailyCheckIn.jsx` — daily checklist, recent-event prompt, reminder CRUD, SOS.
- `src/components/MemoryAnchors.jsx` — family media form/list/delete.
- `src/components/CaregiverDashboard.jsx` — baseline, trends, map, flags, report/export/reset, demo services.
- `src/App.jsx` — platform state and view orchestration.
- `src/index.css` — new platform/game styles plus accessibility/responsive/reduced-motion rules.
- `src/main.jsx` — service-worker registration.
- `public/manifest.webmanifest` — install metadata.
- `public/sw.js` — versioned app-shell cache.
- `public/app-icon.svg` — reusable install icon.
- `index.html` — manifest/theme metadata.
- `tests/gameCatalog.test.js` — catalogue completeness/shape.
- `tests/platform.test.js` — schema, metrics, adaptation, trends.

---

### Task 1: Authoritative Game Catalogue

**Files:**
- Create: `src/data/games.js`
- Create: `tests/gameCatalog.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `STAGES`, `GAME_CATEGORIES`, `GAMES`, `getGame(gameId)`, `validateGameCatalog(games)`.
- `GAMES` entries expose `{ id, name, category, stages, engine, description, instructions, content, difficulty }`.

- [ ] **Step 1: Add test command and failing catalogue test**

Add `"test": "node --test"` under `scripts` in `package.json`. Create:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, validateGameCatalog } from '../src/data/games.js';

const expectedIds = [
  'card-match', 'sequence-repeat', 'item-recall', 'route-puzzle',
  'childhood-trivia', 'family-tree', 'today-recall', 'photo-diary',
  'odd-one-out', 'naming-game', 'category-sorting', 'routine-sequence',
  'task-simulation', 'family-face-match', 'voice-recognition',
  'emotion-recognition', 'festival-match', 'folk-story-sequence',
  'local-music-recall', 'spot-difference', 'tap-target',
  'word-association', 'proverb-completion', 'color-tap',
  'sound-match', 'yes-no-recognition'
];

test('catalog contains all 26 unique documented games', () => {
  assert.deepEqual(GAMES.map(({ id }) => id).sort(), expectedIds.sort());
  assert.equal(new Set(GAMES.map(({ id }) => id)).size, 26);
});

test('every game config is runnable', () => {
  assert.deepEqual(validateGameCatalog(GAMES), []);
});
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm test -- tests/gameCatalog.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/games.js`.

- [ ] **Step 3: Implement catalogue constants and validation**

Use these exact engine names:

```js
export const STAGES = ['mild', 'moderate', 'severe'];
export const GAME_CATEGORIES = [
  'working-memory', 'long-term-memory', 'episodic-memory',
  'semantic-memory', 'procedural-memory', 'recognition-memory',
  'cultural-memory', 'attention', 'language', 'sensory'
];
const ENGINES = ['match', 'sequence', 'recall', 'choice', 'sorting', 'audio', 'action'];

export function getGame(gameId) {
  return GAMES.find(({ id }) => id === gameId) ?? null;
}

export function validateGameCatalog(games) {
  const errors = [];
  if (games.length !== 26) errors.push('catalog must contain 26 games');
  for (const game of games) {
    for (const key of ['id', 'name', 'category', 'engine', 'description', 'instructions', 'content', 'difficulty']) {
      if (!game[key]) errors.push(`${game.id || 'unknown'} missing ${key}`);
    }
    if (!GAME_CATEGORIES.includes(game.category)) errors.push(`${game.id} has invalid category`);
    if (!ENGINES.includes(game.engine)) errors.push(`${game.id} has invalid engine`);
    if (!Array.isArray(game.stages) || !game.stages.every(stage => STAGES.includes(stage))) {
      errors.push(`${game.id} has invalid stages`);
    }
  }
  return errors;
}
```

Create every config using document stages and this exhaustive engine mapping:

| IDs | Engine | Required content |
|---|---|---|
| `card-match`, `family-face-match`, `festival-match` | `match` | At least 6 pair records `{ id, label, symbol }`; family version declares `source: 'anchors'` and demo fallbacks. |
| `sequence-repeat` | `sequence` | 5 cultural symbols; `mode: 'repeat'`. |
| `routine-sequence`, `task-simulation`, `folk-story-sequence` | `sequence` | At least 2 rounds with ordered `{ id, label, symbol }` steps; `mode: 'order'`. |
| `item-recall`, `today-recall`, `photo-diary` | `recall` | At least 3 rounds with shown items, prompt, choices, and correct IDs; personalized games declare local check-in/media source plus fallback. |
| `route-puzzle`, `childhood-trivia`, `odd-one-out`, `naming-game`, `emotion-recognition`, `local-music-recall`, `word-association`, `proverb-completion`, `yes-no-recognition` | `choice` | At least 3 rounds `{ prompt, options, correct, explanation }`; local music rounds include `sound: 'dhol-low' | 'dhol-high' | 'xylophone'`. |
| `family-tree`, `category-sorting` | `sorting` | At least 6 items and 2 targets; family version declares anchor relationships and demo fallbacks. |
| `voice-recognition`, `sound-match` | `audio` | At least 3 rounds with playable sound descriptors and 2–3 choices; voice version declares anchor audio plus speech fallback. |
| `spot-difference`, `tap-target`, `color-tap` | `action` | `mode: 'difference' | 'target' | 'color'` with 3 rounds and explicit target data. |

Use NER-focused bundled content: Bihu, Hornbill Festival, Losar, Chapchar Kut, tea gardens, bamboo, japi, dhol, Muga silk, local landscapes, familiar household routines. Avoid unsupported health claims.

Difficulty values use this shape:

```js
difficulty: {
  mild: { min: 2, max: 3, initial: 2 },
  moderate: { min: 1, max: 2, initial: 1 },
  severe: { min: 1, max: 1, initial: 1 }
}
```

- [ ] **Step 4: Run catalogue test**

Run: `npm test -- tests/gameCatalog.test.js`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json src/data/games.js tests/gameCatalog.test.js
git commit -m "feat(games): add 26-game catalog"
```

---

### Task 2: Local Platform State, Scoring, and Adaptation

**Files:**
- Create: `src/utils/platform.js`
- Create: `tests/platform.test.js`

**Interfaces:**
- Consumes: category/stage strings from `src/data/games.js`.
- Produces: `createInitialState()`, `loadPlatformState(storage)`, `savePlatformState(state, storage)`, `recordAttempt(state, attempt)`, `getAdaptiveDifficulty(state, game)`, `getCategorySummaries(state)`, `getReviewFlags(state)`, `exportPlatformData(state)`, `clearPlatformData(storage)`.

- [ ] **Step 1: Write failing state and scoring tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState, loadPlatformState, recordAttempt,
  getAdaptiveDifficulty, getCategorySummaries, getReviewFlags
} from '../src/utils/platform.js';

const game = {
  id: 'card-match', category: 'working-memory', stages: ['mild'],
  difficulty: { mild: { min: 1, max: 3, initial: 2 } }
};
const attempt = (accuracy, hints = 0, score = accuracy) => ({
  id: crypto.randomUUID(), gameId: game.id, category: game.category,
  stage: 'mild', difficulty: 2, accuracy, score, hints,
  durationMs: 12000, completedAt: '2026-08-27T10:00:00.000Z'
});

test('initial state uses schema 1 and local consent is false', () => {
  const state = createInitialState();
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.consent.accepted, false);
  assert.deepEqual(state.attempts, []);
});

test('invalid stored JSON safely returns initial state', () => {
  const storage = { getItem: () => '{broken' };
  assert.deepEqual(loadPlatformState(storage), createInitialState());
});

test('two strong attempts raise one step', () => {
  let state = createInitialState();
  state = recordAttempt(state, attempt(90));
  state = recordAttempt(state, attempt(85, 1));
  assert.equal(getAdaptiveDifficulty(state, game), 3);
});

test('two struggling attempts lower one step', () => {
  let state = createInitialState();
  state = recordAttempt(state, attempt(45, 2));
  state = recordAttempt(state, attempt(40, 3));
  assert.equal(getAdaptiveDifficulty(state, game), 1);
});

test('20-point decline after three attempts creates review flag', () => {
  let state = { ...createInitialState(), baseline: { 'working-memory': 80 } };
  state = [50, 55, 45].reduce((next, score) => recordAttempt(next, attempt(score, 0, score)), state);
  assert.equal(getCategorySummaries(state)[0].recentScore, 50);
  assert.equal(getReviewFlags(state)[0].category, 'working-memory');
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- tests/platform.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/utils/platform.js`.

- [ ] **Step 3: Implement schema and pure rules**

Use storage key `cognitive-platform-state-v1`. Initial state:

```js
export const STORAGE_KEY = 'cognitive-platform-state-v1';

export function createInitialState() {
  return {
    schemaVersion: 1,
    consent: { accepted: false, acceptedAt: null },
    profile: { name: 'Apoi', stage: 'mild', language: 'en', emergencyName: '', emergencyPhone: '' },
    stars: 120,
    attempts: [],
    baseline: {},
    checkIns: [],
    reminders: [],
    settings: { muted: false, voice: true, fontSize: 'normal', highContrast: false },
    difficultyByGame: {}
  };
}
```

`recordAttempt` returns a new state, appends the validated attempt, caps history at 500, and adds earned stars. Reject attempts missing `gameId`, `category`, numeric `accuracy`, or ISO `completedAt` by returning the unchanged state.

`getAdaptiveDifficulty` reads the latest two attempts for the same game/stage. Both `accuracy >= 80 && hints <= 1` increase one step. Both `accuracy < 50 || hints >= 2` decrease one step. Clamp to the game stage's `min`/`max`; otherwise return its `initial` or stored current step.

`getCategorySummaries` returns `{ category, baselineScore, recentScore, change, attempts }`, averaging the latest five scores per category. `getReviewFlags` requires at least three attempts and `change <= -20`.

`loadPlatformState` parses and merges schema-1 data over `createInitialState()`. Invalid JSON or wrong top-level types return initial state. `savePlatformState` catches quota/security errors and returns `{ ok: false, error }`; success returns `{ ok: true }`. Export returns pretty JSON. Clear removes only `STORAGE_KEY`.

- [ ] **Step 4: Run platform and full tests**

Run: `npm test`

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/platform.js tests/platform.test.js
git commit -m "feat(data): add local progress model"
```

---

### Task 3: Consent Gate and Platform Navigation

**Files:**
- Create: `src/components/ConsentGate.jsx`
- Create: `src/components/AppNav.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `createInitialState`, `loadPlatformState`, `savePlatformState` from `platform.js`.
- Produces: App-level `platformState`, `setPlatformState`, and active view IDs `home | play | check-in | anchors | caregiver`.

- [ ] **Step 1: Add shell-level smoke assertion**

Add to `tests/platform.test.js`:

```js
test('saved schema-1 profile merges with defaults', () => {
  const storage = { getItem: () => JSON.stringify({ schemaVersion: 1, profile: { name: 'Mina' } }) };
  const state = loadPlatformState(storage);
  assert.equal(state.profile.name, 'Mina');
  assert.equal(state.profile.stage, 'mild');
  assert.equal(state.settings.voice, true);
});
```

- [ ] **Step 2: Run test and confirm failure before deep-merge fix**

Run: `npm test -- tests/platform.test.js`

Expected: FAIL because partial nested profile/settings do not yet retain defaults.

- [ ] **Step 3: Implement deep merge, consent, navigation, and App state**

`ConsentGate` shows:

- “Your information stays on this device.”
- “This prototype supports wellbeing and screening; it does not diagnose dementia.”
- Accept button stores `{ accepted: true, acceptedAt: new Date().toISOString() }`.
- Decline button leaves consent false and keeps app blocked.

`AppNav` renders five real `<button>` elements with labels Home, Play, Check-in, Memory, Caregiver, `aria-current="page"` on the selected view, and a bottom-nav layout on narrow screens.

In `App.jsx`, initialize once:

```jsx
const [platformState, setPlatformState] = useState(() => loadPlatformState(localStorage));
const [activeView, setActiveView] = useState('home');

useEffect(() => {
  savePlatformState(platformState, localStorage);
}, [platformState]);
```

Derive existing name/stars/settings from `platformState`; remove duplicate independent state. Keep current home as `activeView === 'home'`. Add temporary labelled panels for remaining views until their tasks land. Pass `playerName` into game feedback instead of hard-coded “Apoi”.

- [ ] **Step 4: Run tests and production build**

Run: `npm test && npm run build`

Expected: all tests PASS; Vite build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/Header.jsx src/components/AppNav.jsx src/components/ConsentGate.jsx src/index.css tests/platform.test.js src/utils/platform.js
git commit -m "feat(shell): add consent and navigation"
```

---

### Task 4: Game Library and Seven-Mode Runner

**Files:**
- Create: `src/components/GameLibrary.jsx`
- Create: `src/components/games/GameRunner.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `src/utils/audio.js`

**Interfaces:**
- Consumes: `GAMES`, `getGame`, `getAdaptiveDifficulty`, `recordAttempt`, player profile, anchors/check-ins.
- Produces: `GameLibrary({ stage, onSelectGame })`; `GameRunner({ game, stage, difficulty, playerName, anchors, checkIns, onComplete, onClose })`.
- `onComplete(result)` receives `{ accuracy, score, hints, durationMs }`.

- [ ] **Step 1: Strengthen catalogue tests for per-engine playable content**

Add to `tests/gameCatalog.test.js`:

```js
test('every engine has configured games and each game has three rounds or six items', () => {
  assert.deepEqual(new Set(GAMES.map(({ engine }) => engine)), new Set([
    'match', 'sequence', 'recall', 'choice', 'sorting', 'audio', 'action'
  ]));
  for (const game of GAMES) {
    const count = game.content.rounds?.length ?? game.content.items?.length ?? game.content.pairs?.length ?? 0;
    assert.ok(count >= 3, `${game.id} needs at least three playable records`);
  }
});
```

- [ ] **Step 2: Run test and fix incomplete configs before UI work**

Run: `npm test -- tests/gameCatalog.test.js`

Expected: FAIL for any incomplete config; add records until PASS.

- [ ] **Step 3: Implement searchable/filterable library**

Controls:

- search input matches game name/description;
- category select includes all `GAME_CATEGORIES` plus All;
- stage select defaults to caregiver stage but can show All;
- result text announces visible count;
- game cards show name, category label, supported stages, description, and Play button;
- “Play together” toggle marks the session as shared-device play and changes completion copy to celebrate both participants without changing clinical metrics;
- zero state offers Clear filters.

Use plain buttons and selects; no new component library.

- [ ] **Step 4: Implement shared runner lifecycle**

`GameRunner` owns `startedAt`, current round, correct count, total attempts, hints, completed state. Escape and backdrop close safely. Shared finish computes:

```js
const accuracy = Math.round((correct / Math.max(total, 1)) * 100);
const result = {
  accuracy,
  score: accuracy,
  hints,
  durationMs: Date.now() - startedAt
};
onComplete(result);
```

Render exact mode behavior:

- `match`: shuffle pairs; reveal two; matched pairs stay open; complete after all pairs.
- `sequence/repeat`: show symbol order, then accept same taps; replay increments hints.
- `sequence/order`: shuffled steps; tapping builds answer; Check compares ordered IDs.
- `recall`: show content with “I’m ready”; hide it; ask configured choice prompt.
- `choice`: render prompt/options; wrong choice gives supportive hint; correct advances.
- `sorting`: select item then target; correct placement locks; incorrect remains retryable.
- `audio`: Play invokes existing synthesized sound or `HTMLAudioElement` object URL; answer choices advance.
- `action/difference`: tap configured changed symbol.
- `action/target`: target changes among a fixed 3×3 grid after each hit; no countdown.
- `action/color`: spoken/text target color; large color buttons.

Stage affects visible pair count, sequence length, options, hint availability, and target size. Severe mode uses one prompt per screen and two choices.

- [ ] **Step 5: Connect completion to persistent attempts**

In `App.jsx` create an attempt with `crypto.randomUUID()`, game category/stage/difficulty, result values, and ISO completion time. Call `recordAttempt`; award `5 + Math.round(accuracy / 10)` stars once per completed round. Existing category modals may remain reachable from Home, but Game Library is authoritative for all 26 games.

- [ ] **Step 6: Verify**

Run: `npm test && npm run build`

Expected: tests PASS; build succeeds without unused/missing imports.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/GameLibrary.jsx src/components/games/GameRunner.jsx src/data/games.js src/index.css src/utils/audio.js tests/gameCatalog.test.js
git commit -m "feat(games): make full library playable"
```

---

### Task 5: Daily Check-in, Reminders, and SOS

**Files:**
- Create: `src/components/DailyCheckIn.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `src/utils/platform.js`
- Modify: `tests/platform.test.js`

**Interfaces:**
- Produces: `addCheckIn(state, checkIn)`, `upsertReminder(state, reminder)`, `removeReminder(state, reminderId)`, `getDueReminders(state, now)`.
- `DailyCheckIn({ state, onStateChange })` writes through those functions.

- [ ] **Step 1: Write failing reminder test**

```js
test('due reminders match local HH:MM and enabled status', () => {
  let state = createInitialState();
  state = upsertReminder(state, { id: 'meds', label: 'Medicine', time: '09:30', enabled: true });
  state = upsertReminder(state, { id: 'walk', label: 'Walk', time: '10:00', enabled: false });
  const due = getDueReminders(state, new Date('2026-08-27T09:30:00'));
  assert.deepEqual(due.map(({ id }) => id), ['meds']);
});
```

- [ ] **Step 2: Run test and confirm named exports fail**

Run: `npm test -- tests/platform.test.js`

Expected: FAIL because reminder functions are not exported.

- [ ] **Step 3: Implement immutable check-in/reminder helpers**

Validate check-in shape `{ id, date, medicine, meals, walk, mood, recentEvent }`; keep one check-in per ISO date. Validate reminder label and `HH:MM`; update matching ID or append. Due reminders match enabled items at local hours/minutes and are suppressed when `lastShownDate` equals today.

- [ ] **Step 4: Build Daily Check-in UI**

Use one card per question, native checkboxes, five large mood buttons, and optional recent-event text. Save button gives plain confirmation and disables duplicate save for the same day. Reminder form uses `<input type="time">`. Notification button requests permission only after user click; unsupported/denied state explains that in-app reminders still work.

SOS section stores emergency name/phone under profile. Disable Call until phone is non-empty. Action uses:

```jsx
<a href={`tel:${state.profile.emergencyPhone.replace(/[^+\d]/g, '')}`}>Call emergency contact</a>
```

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run build`

```bash
git add src/App.jsx src/components/DailyCheckIn.jsx src/index.css src/utils/platform.js tests/platform.test.js
git commit -m "feat(checkin): add reminders and SOS"
```

---

### Task 6: Local Family Memory Anchors

**Files:**
- Create: `src/utils/mediaStore.js`
- Create: `src/components/MemoryAnchors.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `listAnchors()`, `putAnchor(anchor)`, `deleteAnchor(id)`, `clearAnchors()` returning Promises.
- Anchor shape: `{ id, name, relationship, photoBlob, audioBlob, createdAt }`.

- [ ] **Step 1: Implement minimal IndexedDB wrapper**

Use DB `cognitive-platform-media`, version `1`, object store `anchors`, key path `id`. One `openDatabase()` Promise handles `onupgradeneeded`, rejects on `request.onerror`, and is reused by four CRUD functions. Transactions reject on `onerror`/`onabort` and resolve only on `oncomplete`.

- [ ] **Step 2: Build validated anchor form**

Requirements:

- name and relationship required, trimmed, max 60 chars;
- photo optional, `image/jpeg|image/png|image/webp`, max 5 MB;
- audio optional, `audio/*`, max 8 MB;
- invalid selection shows exact limit/type message before any DB write;
- successful save resets form and refreshes list;
- failure retains form and shows “Could not save on this device. Existing memories are unchanged.”

Render photo with `URL.createObjectURL`; revoke URLs in effect cleanup. Audio uses native `<audio controls>`. Delete requires a confirmation dialog and removes only selected record.

- [ ] **Step 3: Feed anchors into personalized games**

Load anchors once in `App.jsx`, refresh after CRUD, and pass them to `GameRunner`. `family-face-match`, `family-tree`, and `voice-recognition` prefer anchors when enough usable records exist; otherwise use bundled demo entries and display “Using demo family memories—add your own in Memory Anchors.”

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

```bash
git add src/App.jsx src/components/MemoryAnchors.jsx src/index.css src/utils/mediaStore.js src/components/games/GameRunner.jsx
git commit -m "feat(memory): add local family anchors"
```

---

### Task 7: Caregiver Dashboard and Baseline

**Files:**
- Create: `src/components/CaregiverDashboard.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `src/utils/platform.js`
- Modify: `tests/platform.test.js`

**Interfaces:**
- Consumes: category summaries, review flags, attempts, reminders, check-ins, profile.
- Produces: `setBaselineFromAttempts(state, gameIds)`, `CaregiverDashboard({ state, onStateChange, onStartGame, onClearMedia })`.

- [ ] **Step 1: Write failing baseline test**

```js
test('baseline averages only requested completed games by category', () => {
  let state = createInitialState();
  state = recordAttempt(state, attempt(80));
  state = recordAttempt(state, { ...attempt(60), id: 'second' });
  state = setBaselineFromAttempts(state, ['card-match']);
  assert.equal(state.baseline['working-memory'], 70);
});
```

- [ ] **Step 2: Run test and implement baseline helper**

Run: `npm test -- tests/platform.test.js`

Expected: FAIL because `setBaselineFromAttempts` is missing.

Implementation groups matching attempts by category, averages `score`, rounds integers, merges into existing baseline, and returns unchanged state when none match.

- [ ] **Step 3: Build caregiver panels**

Panels:

- Patient: editable name/stage, explicit note that stage is caregiver-selected.
- Audience switch: Family / ASHA Worker changes plain-language helper copy but uses the same local data and permissions.
- Baseline: five launch buttons for `sequence-repeat`, `odd-one-out`, `tap-target`, `routine-sequence`, `family-face-match`; completion progress; Save Baseline enabled after all five have attempts.
- Memory Gap Map: SVG polygon using category scores plus adjacent text list, so chart meaning never depends on shape/color alone.
- Trends: latest five category scores, change from baseline, attempt counts.
- Review flags: exact “Recent results changed from this person’s baseline. Consider checking in or sharing the report with a qualified clinician.”
- Activity: recent 10 attempts and latest check-in.
- Impact: completed sessions, active days, baseline completion, memory anchors added, check-ins saved, review flags, and reports exported.
- Care circle: positive progress toward adding three anchors and completing seven check-ins; no penalty or competitive leaderboard.
- Reports: `window.print()` and JSON Blob download from `exportPlatformData`.
- Privacy: local-only explanation; Delete All requires typed `DELETE`, then clears platform state and IndexedDB anchors.
- Demo services: SMS/IVR, geofence, telehealth cards each carry a visible `Demo — no live service connected` badge. Telehealth may expose saved clinician phone via `tel:` only.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

```bash
git add src/App.jsx src/components/CaregiverDashboard.jsx src/index.css src/utils/platform.js tests/platform.test.js
git commit -m "feat(caregiver): add local progress dashboard"
```

---

### Task 8: English/Assamese Language Layer and Accessibility

**Files:**
- Create: `src/data/i18n.js`
- Modify: `src/App.jsx`
- Modify: `src/components/AppNav.jsx`
- Modify: `src/components/ConsentGate.jsx`
- Modify: `src/components/GameLibrary.jsx`
- Modify: `src/components/games/GameRunner.jsx`
- Modify: `src/components/DailyCheckIn.jsx`
- Modify: `src/components/MemoryAnchors.jsx`
- Modify: `src/components/CaregiverDashboard.jsx`
- Modify: `src/components/CategoryCard.jsx`
- Modify: `src/components/SceneryInteractive.jsx`
- Modify: `src/components/BottomBanner.jsx`
- Modify: `src/index.css`
- Modify: `src/utils/speech.js`

**Interfaces:**
- Produces: `LANGUAGES`, `t(language, key, params)`, `speakText(text, onEnd, language)`.

- [ ] **Step 1: Implement language dictionary and fallback**

`LANGUAGES` is `{ en: 'English', as: 'অসমীয়া' }`. English contains every UI key. Assamese contains navigation, consent summary, Play/Close/Next/Repeat/Try again, check-in headings, caregiver headings, and representative game instructions. `t` falls back to English, replaces `{name}` tokens, and returns the key only when absent from both dictionaries.

Add to `tests/platform.test.js`:

```js
test('Assamese translation falls back to English for missing keys', async () => {
  const { t } = await import('../src/data/i18n.js');
  assert.equal(t('as', 'app.localOnly'), t('en', 'app.localOnly'));
  assert.equal(t('as', 'actions.play'), 'খেলক');
});
```

- [ ] **Step 2: Thread language through screens and speech**

Language selector updates `profile.language`. `speakText` sets `utterance.lang` to `as-IN` for Assamese and `en-IN` for English, then selects an installed matching voice. If no match exists, it uses default voice; all text remains visible. Settings shows this fallback limitation.

- [ ] **Step 3: Complete keyboard/dialog/reduced-motion behavior**

- Convert clickable `<div>` game/scenery/banner controls to `<button>` or add both Enter/Space handlers.
- Every modal has `role="dialog"`, `aria-modal="true"`, labelled title, Escape close, and initial focus on its heading or close button.
- Add `:focus-visible` outline at least 3 px.
- Add `@media (prefers-reduced-motion: reduce)` that removes animation/transition and hides falling petals; skip confetti when media query matches.
- Preserve current high-contrast and font-size classes across all new views.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

```bash
git add src/App.jsx src/components/AppNav.jsx src/components/ConsentGate.jsx src/components/GameLibrary.jsx src/components/games/GameRunner.jsx src/components/DailyCheckIn.jsx src/components/MemoryAnchors.jsx src/components/CaregiverDashboard.jsx src/components/CategoryCard.jsx src/components/SceneryInteractive.jsx src/components/BottomBanner.jsx src/data/i18n.js src/index.css src/utils/speech.js tests/platform.test.js
git commit -m "feat(a11y): add Assamese pilot and keyboard UX"
```

---

### Task 9: Installable Offline PWA

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `public/app-icon.svg`
- Modify: `index.html`
- Modify: `src/main.jsx`

**Interfaces:**
- Produces: install metadata and cache `cognitive-platform-shell-v1`.

- [ ] **Step 1: Add manifest and install icon**

Manifest exact core values:

```json
{
  "name": "Apon Mon Cognitive Companion",
  "short_name": "Apon Mon",
  "description": "Offline cognitive games and memory support for older adults.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#e8f5e9",
  "theme_color": "#2e7d32",
  "icons": [{ "src": "/app-icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }]
}
```

Create a simple SVG icon using existing green/gold palette, lotus/brain-like abstract paths, and no text smaller than icon readability. Link manifest and theme color from `index.html`.

- [ ] **Step 2: Add versioned service worker**

Precache `/`, `/index.html`, `/manifest.webmanifest`, `/app-icon.svg`, `/avatar_apoi.jpg`, `/scenic_bg.jpg`. On install, cache them; on activate, delete caches whose name differs from `cognitive-platform-shell-v1`; on same-origin GET fetch, return cache then network, caching successful network responses. Never intercept `tel:` or non-GET requests.

Register only in production-capable browsers:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('Offline mode unavailable:', error);
    });
  });
}
```

- [ ] **Step 3: Add static PWA assertions**

Create `tests/pwa.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('manifest and service worker expose offline shell', async () => {
  const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));
  const worker = await readFile('public/sw.js', 'utf8');
  assert.equal(manifest.display, 'standalone');
  assert.match(worker, /cognitive-platform-shell-v1/);
  assert.match(worker, /scenic_bg\.jpg/);
});
```

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

Expected: all tests PASS; `dist/manifest.webmanifest`, `dist/sw.js`, and `dist/app-icon.svg` exist.

```bash
git add index.html public/manifest.webmanifest public/sw.js public/app-icon.svg src/main.jsx tests/pwa.test.js
git commit -m "feat(pwa): add offline install support"
```

---

### Task 10: Integration Polish and Final Verification

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `README.md`
- Test: `tests/gameCatalog.test.js`
- Test: `tests/platform.test.js`
- Test: `tests/pwa.test.js`

**Interfaces:**
- Consumes all earlier task outputs.
- Produces one coherent offline hackathon build.

- [ ] **Step 1: Audit every configured game path**

Add catalogue assertion:

```js
test('documented category count and stage coverage remain complete', () => {
  assert.equal(new Set(GAMES.map(({ category }) => category)).size, 10);
  for (const stage of ['mild', 'moderate', 'severe']) {
    assert.ok(GAMES.some(({ stages }) => stages.includes(stage)), `${stage} needs games`);
  }
});
```

Check `GameRunner` switch covers all seven engine names and throws a visible unsupported-game error instead of a blank modal.

- [ ] **Step 2: Responsive and print polish**

At widths below 760 px: one-column content, sticky bottom nav, modal full-height, 48 px minimum controls. At 761–1100 px: two-column library/cards. Above 1100 px: three/four-column library. Add print CSS that hides nav/buttons/background and prints caregiver report in black on white.

- [ ] **Step 3: Update README**

Document:

- `npm install`, `npm test`, `npm run build`;
- 26-game offline scope;
- local-data behavior and reset/export;
- screening-not-diagnosis statement;
- demo-only SMS/geofence/telehealth limits;
- browser requirements for IndexedDB, Speech Synthesis, notifications, service workers, and calling.

- [ ] **Step 4: Run decisive verification**

Run:

```bash
npm test
npm run build
git diff --check
test -f dist/manifest.webmanifest
test -f dist/sw.js
test -f dist/app-icon.svg
```

Expected: all tests PASS, Vite build succeeds, no whitespace errors, all PWA assets exist.

- [ ] **Step 5: Confirm worktree scope**

Run: `git status --short`.

Expected: root `AGENTS.md` remains deleted and unstaged unless user changed it; implementation files are clean after commits.

- [ ] **Step 6: Commit final polish**

```bash
git add README.md src/App.jsx src/index.css tests/gameCatalog.test.js
git commit -m "docs: finish cognitive platform prototype"
```
