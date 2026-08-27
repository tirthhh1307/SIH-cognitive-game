# Offline-First Cognitive Platform Design

Date: 2026-08-27

## Goal

Expand the existing React/Vite cognitive-game demo into an offline-first hackathon prototype for elderly dementia patients and caregivers in North East India. The build must include all 26 documented games, stage-aware play, local progress tracking, memory assistance, and a caregiver demonstration without claiming diagnosis or live external integrations.

## Product Boundaries

- Hackathon prototype, not production medical software.
- Screening and engagement support only; never diagnose dementia or automatically change a clinical diagnosis.
- All core play and saved data work without internet after first load.
- Health and personal data remain on the device unless the user explicitly exports them.
- SMS, geofencing, cloud AI, clinician systems, and telehealth-provider integrations are simulated and labelled as demos.
- SOS uses a real `tel:` link to the locally saved emergency contact when the device supports calling.

## Experience Architecture

Preserve the existing scenic, culturally rooted home screen and its four friendly entry cards. Add four primary spaces:

1. **Play** — complete searchable/filterable library of 26 games, grouped by cognitive category and patient stage.
2. **Daily Check-in** — medicine, meals, walk, mood, and recent-event prompts.
3. **Memory Anchors** — caregiver-managed family photos, names, relationships, and optional voice clips.
4. **Caregiver** — baseline assessment, cognitive trends, reminders, session history, alerts, report export, privacy controls, and demo safety/telehealth flows.

Existing game experiences remain reusable rather than being discarded. Navigation and controls use large targets, plain labels, high contrast, short instructions, read-aloud support, and no stressful countdowns.

## Game System

Seven reusable engines provide consistent interaction, accessibility, metrics, and difficulty rules while each documented game retains distinct content and instructions.

### Match Engine

- Card Match / Memory Flip
- Family Face Match
- Festival Memory Match

### Sequence Engine

- Sequence Repeat
- Daily Routine Sequencing
- Task Simulation
- Folk Story Sequencing

### Recall Engine

- Number / Item Recall
- “What Happened Today” Recall Quiz
- Photo Diary Recall

### Choice Engine

- Familiar Route Puzzle
- Childhood Memory Trivia
- Odd One Out
- Naming Game
- Emotion Recognition
- Local Music Recall
- Word Association
- Fill in the Blank Proverbs
- Yes/No Recognition

### Sorting Engine

- Family Tree Builder
- Category Sorting

### Audio Engine

- Voice Recognition Game
- Music / Sound Matching

### Action Engine

- Spot the Difference
- Tap the Target
- Color Tap

Each game config declares its name, category, supported stages, instructions, content, engine, and difficulty parameters. Bundled demo content keeps personalized games playable before family media is added.

## Stage and Difficulty Rules

- **Mild:** more items, longer sequences, delayed recall, fewer hints.
- **Moderate:** shorter rounds, two or three choices, immediate voice guidance, optional hints.
- **Severe:** very large targets, one instruction at a time, binary choices where possible, no penalties or timers.

Difficulty uses three steps and transparent local rules, not a remote or opaque AI claim. Two consecutive attempts with at least 80% accuracy and no more than one hint increase one step. Two consecutive attempts below 50% accuracy or using at least two hints decrease one step. Difficulty never moves outside the current stage's allowed range. Caregivers can override the suggested stage. Clinical stage labels are caregiver-entered context, never inferred diagnoses.

## Assessment and Metrics

Baseline assessment uses five short representative activities covering working memory, semantic memory, attention, procedural sequencing, and recognition. Every completed round records:

- game and cognitive category;
- configured stage and difficulty;
- accuracy;
- response duration;
- hints used;
- completion timestamp.

Category summaries compare recent performance with the patient’s own baseline. The caregiver Memory Gap Map visualizes relative strengths and changes using an accessible SVG plus a text summary. After at least three attempts in one category, a rolling score 20 percentage points below that category's baseline creates an in-app review flag phrased as “consider checking in” and never as a diagnosis or emergency conclusion.

## Daily Support

Daily Check-in records medicine, meals, walk/activity, mood, and one recent-event answer. Reminders appear in-app. Browser notifications are optional progressive enhancement and clearly state their limitations when unavailable or when the app is closed.

SOS stores one emergency contact locally and opens the system dialer through `tel:`. Telehealth, SMS, IVR, and geofence screens demonstrate intended workflows with visible “Demo” labels and no claim that monitoring or messages are active.

## Caregiver and Memory Anchors

Caregiver view provides:

- patient name and caregiver-selected stage;
- baseline status and start/resume action;
- recent sessions and category trends;
- Memory Gap Map and plain-language summaries;
- reminder management;
- family media management;
- review flags;
- printable report and JSON data export;
- delete-all-data control with confirmation.

Photos and optional audio clips are validated before storage. Family name and relationship are required. Missing or unsupported media produces a clear error and leaves existing data unchanged.

## Language and Voice

English covers the complete product. An Assamese pilot pack covers primary navigation, common instructions, feedback, and representative game content. The language layer remains data-driven so more reviewed NER language packs can be added later without changing game logic.

Read-aloud uses the browser Speech Synthesis API and an installed matching voice when available. If a requested voice is unavailable, the product keeps translated on-screen text and visibly falls back to the best available voice or silent text mode.

## Offline and Persistence

- Web app manifest enables installation where supported.
- Service worker caches the application shell and bundled assets.
- `localStorage` holds small structured settings, reminders, game results, and check-ins.
- IndexedDB holds uploaded photos and audio blobs.
- Stored records include a schema version and migrate through small explicit upgrade functions.
- Reset/export controls make local ownership understandable and recoverable.

No new dependency is required for persistence, PWA caching, reports, or test execution.

## Accessibility and Interaction Rules

- Keyboard-operable cards, buttons, tabs, and dialogs.
- Visible focus states and Escape-to-close behavior.
- Descriptive labels for icons and media controls.
- Large touch targets and readable type at all supported viewport sizes.
- High-contrast and large-text settings continue to work across new screens.
- Positive retry language; no loss of stars or punitive failure state.
- Reduced-motion preference disables nonessential animation and confetti.

## Error Handling

- Unsupported speech, notifications, installation, or calling features show a plain fallback.
- Invalid or oversized uploads are rejected before persistence.
- Storage quota failures preserve existing records and explain what was not saved.
- Corrupt or old local data uses versioned migration; unrecoverable records can be exported or reset.
- Service-worker updates replace caches by version without deleting user data.

## Verification

Use Node’s built-in test runner for the smallest meaningful automated checks:

- exactly 26 unique game configs exist;
- every config has valid engine, category, stages, content, and difficulty values;
- scoring and adaptive rules handle success, struggle, and stage boundaries;
- local schema migrations preserve supported records;
- production build completes.

Do not run the development or preview server automatically. Final verification uses tests and `npm run build`.

## Source Guidance

- Product document: `Cognitive_Platform_Features_and_Approach.docx`
- Game catalogue: `2359.xlsx`
- WHO dementia guidance: https://www.who.int/news-room/fact-sheets/detail/dementia
- Alzheimer’s Society dementia-friendly games: https://www.alzheimers.org.uk/get-support/publications-and-factsheets/dementia-together/ideas-help-person-dementia-enjoy-games
- MDN installable PWAs: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN offline PWA operation: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

## Deferred Production Work

Real authentication, encryption-at-rest key management, cloud sync, clinician accounts, remote AI, SMS/IVR delivery, background geofencing, and telehealth-provider APIs require production infrastructure, consent governance, security review, clinical review, and service credentials. Add them only after the hackathon prototype validates workflows.
