---
name: ux-psychology
description: Evaluate and optimize venue admin workflows, ticket issuance, and screening setup UI in Mr Big Screen using six core UX psychology principles (smart defaults, goal gradient, reciprocity, endowment effect, loss aversion, contrast effect).
---

# UX Psychology & Conversion Optimization — Mr Big Screen

This skill provides an audit and optimization framework for Mr Big Screen's cinema screening management and ticket issuance workflows, adapting core behavioral psychology principles to high-efficiency venue admin interfaces.

---

## Core Directives & Psychological Principles

### 1. Smart Defaults (Combat Decision Fatigue)
- **Concept**: Never leave screening creation or ticket setup forms completely blank.
- **Application in Mr Big Screen**:
  - Pre-fill screening start times based on venue schedule patterns (e.g., next available 30-min slot or standard 19:30 evening showtime).
  - Default ticket capacity to screen max seat count; pre-select standard tier ("General Admission", standard price point).
  - Pre-populate tax rates, currency, and venue location.
- **Goal**: Shift admin effort from input creation to rapid verification and adjustment.

### 2. Goal Gradient Effect (Momentum & Completion Rates)
- **Concept**: Users accelerate progress as they approach a goal. Never start an admin workflow at 0%.
- **Application in Mr Big Screen**:
  - In screening creation wizards or ticket issuance steps, show progress starting at 20-25% (e.g., Step 1: "Venue & Date Detected" auto-checked).
  - Pre-select active screen/auditorium when starting a screening setup.
- **Goal**: Create immediate task momentum for venue staff during rush periods.

### 3. Trigger Reciprocity (Value Before Requirement)
- **Concept**: Deliver immediate, tangible utility before requiring complete form submissions or configuration commitments.
- **Application in Mr Big Screen**:
  - Render a real-time live ticket pass preview and visual QR preview while typing event title/tier, before saving.
  - Show projected venue revenue and seat availability metrics instantly as price/capacity inputs change.
- **Goal**: Establish immediate functional value so completion feels like finalizing a completed artifact.

### 4. IKEA & Endowment Effects (Invested Ownership)
- **Concept**: Users place disproportionately high value on configurations they customized or built.
- **Application in Mr Big Screen**:
  - Allow admins to interactively tweak seat tier allocations, badge colors, and screening schedules on a visual canvas or interactive preview.
  - As ticket passes are customized, retain active state in memory so discarding feels like losing work already completed.
- **Goal**: Minimize form abandonment during complex screening configurations.

### 5. Loss Aversion & Operational Status Quo
- **Concept**: Frame actions around risk of inaction or lost operational capacity.
- **Application in Mr Big Screen**:
  - Frame ticket issuance and screening publish actions around operational continuity (e.g., "Publish now to prevent unsold seats" or "Save tier changes to lock in door pricing").
  - Warning dialogs for unsaved changes highlight exact assets lost (e.g., "Discarding configured ticket passes").
- **Goal**: Drive decisive action without marketing fluff or false urgency.

### 6. Control the Contrast Effect (Relative Value Anchor)
- **Concept**: Never display cost or pricing decisions in isolation; always anchor against reference values.
- **Application in Mr Big Screen**:
  - Position ticket issuance fees or VIP tier prices directly next to total projected box office yield or standard door prices.
  - Display bulk ticket pass discounts or booking fees in direct relation to total order size (e.g., "$2.50 fee on $150 transaction").
- **Goal**: Make costs feel like rational, low-friction rounding errors relative to overall venue returns.

---

## Execution Audit Workflow

When auditing or designing a UI component or admin flow in Mr Big Screen:

1. **Audit for Blank Fields**: Identify fields that can be populated with venue defaults.
2. **Audit Zero-Progress Starts**: Add artificial head start step (e.g., venue/screen auto-assigned).
3. **Audit Gated Value**: Ensure live ticket/screening preview updates instantly without requiring page save.
4. **Audit Lack of Investment**: Give interactive customization controls for seating/pass layout.
5. **Audit Gain-Focused Copy**: Reframe CTAs and status notices around preventing operational loss/drift.
6. **Audit Isolated Pricing**: Pair tier costs or ticket fees with higher context anchors (total seat capacity yield, standard ticket baseline).
