# Apon Mon Presentation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an improved SIH presentation PDF with natural copy and a readable offline-first flowchart.

**Architecture:** Edit the existing standalone HTML deck in place, preserving its visual tokens and page layout. Export the HTML through the repository's existing headless-browser PDF path and validate both page count and flowchart text in the rendered PDF.

**Tech Stack:** HTML, CSS, Chromium headless PDF export, Poppler PDF inspection.

## Global Constraints

- Keep exactly 10 slides at 16:9.
- Add no dependencies or new application code.
- Keep health claims non-diagnostic.
- Preserve the existing dark teal-and-gold visual style.

---

### Task 1: Humanise presentation copy

**Files:**
- Modify: `presentation.html`

**Interfaces:**
- Consumes: Existing semantic `<section class="slide">` structure.
- Produces: Scannable, presenter-friendly headings and body copy across all 10 slides.

- [ ] **Step 1: Replace buzzword-heavy headings and paragraphs**

Use short, audience-centred language. For example, replace the cover tagline with:

```html
<p class="cover-tagline">A calm, familiar way for older adults to stay engaged — even when the internet is not.</p>
```

- [ ] **Step 2: Preserve claims and clinical safeguards**

Keep the existing game count, offline-first design, local media storage, ASHA workflow, and non-diagnostic boundary. Remove unverifiable superlatives and internal source-file references from audience-facing text.

- [ ] **Step 3: Check copy density**

Run:

```bash
rg -n "bleeding-edge|Complete decoupling|Mutex|CORS Safe|Prompt-Augmented|non-compliance" presentation.html
```

Expected: no matches.

### Task 2: Replace the architecture diagram

**Files:**
- Modify: `presentation.html`

**Interfaces:**
- Consumes: Slide 4’s `.diagram-node` and `.arrow-flow` styles.
- Produces: A left-to-right diagram containing `Older adult & ASHA`, `Offline Apon Mon app`, `Private device storage`, `Optional AI assistance`, `Sync when connected`, and `PHC-ready report`.

- [ ] **Step 1: Build the visible journey**

Use the existing node and arrow styles in a clear primary row:

```html
<div class="diagram-node"><strong>Older adult &amp; ASHA</strong><small>Play, guide, and revisit memories</small></div>
<div class="arrow-flow">→</div>
<div class="diagram-node"><strong>Offline Apon Mon app</strong><small>Works without a signal</small></div>
```

- [ ] **Step 2: Add the trust boundary and delayed sync**

Show that photos, voice notes, and session progress remain on the tablet. Connect the outbox to a report only with an explicit `When Wi-Fi/4G returns` label.

- [ ] **Step 3: Validate the HTML**

Run:

```bash
tidy -qe presentation.html
```

Expected: no structural HTML errors; if `tidy` is unavailable, use Chromium’s successful load as the check.

### Task 3: Export and verify the PDF

**Files:**
- Modify: `SIH_AponMon_Presentation.pdf`

**Interfaces:**
- Consumes: `presentation.html`.
- Produces: A 10-page printable PDF with the revised flowchart.

- [ ] **Step 1: Export the deck**

Run the installed headless Chromium exporter against the local HTML source, with background printing enabled, and write `SIH_AponMon_Presentation.pdf`.

- [ ] **Step 2: Confirm output structure**

Run:

```bash
pdfinfo SIH_AponMon_Presentation.pdf | rg '^Pages:'
pdftotext SIH_AponMon_Presentation.pdf - | rg 'Older adult & ASHA|Offline Apon Mon app|When Wi-Fi/4G returns|PHC-ready report'
```

Expected: `Pages: 10` and all four flow labels present.

- [ ] **Step 3: Visually inspect the architecture page**

Render PDF page 4 to PNG and inspect it for text clipping, reading order, and clear arrows.
