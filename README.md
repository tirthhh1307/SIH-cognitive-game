# Apon Mon Cognitive Companion

Offline-first cognitive games and memory support for older adults, family caregivers, and ASHA workers in North East India. Built as a Smart India Hackathon prototype.

## Included

- 26 playable games across 10 cognitive categories and mild, moderate, and severe stages
- transparent local difficulty adjustment based on recent accuracy and hints
- five-game baseline, category trends, Memory Gap Map, and review flags
- daily check-ins, reminders, and an emergency `tel:` contact
- local family photos and voice notes through IndexedDB
- Family and ASHA dashboard views, printable report, and JSON export
- English interface plus an Assamese pilot pack
- installable PWA shell with offline game assets
- high contrast, large text, keyboard controls, read-aloud, and reduced motion

## Run checks

```bash
npm install
npm test
npm run build
```

Development and preview servers are intentionally not started by automated agents in this repository.

## Local data

Settings, check-ins, reminders, results, and baselines use browser `localStorage`. Family photos and voice clips use IndexedDB. The caregiver view can export structured data or delete all local data. No account or cloud sync is included.

## Important boundary

This prototype supports cognitive engagement and care conversations. It does not diagnose dementia, replace clinical assessment, or automatically assign a clinical stage. SMS/IVR, geofencing, cloud AI, clinician systems, and telehealth cards are visibly marked demonstrations with no live service connection.

## Browser support

Modern browsers with JavaScript, localStorage, and IndexedDB can run core features. Speech Synthesis, notifications, PWA installation, and phone calling progressively enhance the experience when supported by the browser, operating system, and device. Assamese speech depends on an installed `as-IN` voice; on-screen text remains available without one.
