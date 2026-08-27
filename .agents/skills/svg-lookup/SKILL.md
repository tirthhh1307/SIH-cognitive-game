---
name: svg-lookup
description: "Use when creating, editing, or auditing SVG graphics to visually verify rendering output, detect clipping/alignment issues, and iteratively fix SVG code."
---

# SVG Lookup & Visual Inspection Skill

Visually inspect rendered SVG graphics, detect layout/clipping bugs, and iteratively fix SVG code using a zero-browser Node rasterizer.

## When to Use
- Creating new SVG icons, banners, logos, or illustrations.
- Debugging clipped paths, broken viewBox dimensions, improper padding, or low-contrast strokes.
- Auditing existing SVG assets in the project.

## Workflow & Protocol

1. **Save or Locate SVG File**: Ensure the target SVG content is saved to a file (e.g. `scratch/icon.svg` or `public/images/logo.svg`).

2. **Render PNG Image**:
   Execute the rasterizer CLI script:
   ```bash
   node .agents/skills/svg-lookup/scripts/render-svg.js <input.svg|-> [output.png] [--bg dark|white|#hex] [--width 500]
   ```
   *Examples:*
   ```bash
   # Standard render
   node .agents/skills/svg-lookup/scripts/render-svg.js scratch/icon.svg scratch/icon.png 500

   # Render with dark background (for white SVGs / light graphics)
   node .agents/skills/svg-lookup/scripts/render-svg.js scratch/white-logo.svg scratch/preview.png --bg dark
   ```

3. **Visually Inspect Output**:
   - Read/view the generated `.png` artifact file.
   - Audit visual layout against design intent.

4. **Common Flaws & Auto-Fix Strategies**:
   - **Clipping / Cropped Edges**:
     - *Cause*: Elements exceed `viewBox` bounds or stroke-width extends past boundary.
     - *Fix*: Expand `viewBox` (e.g., change `viewBox="0 0 24 24"` to `viewBox="-2 -2 28 28"`) or add padding around group elements.
   - **Distorted / Stretched Graphics**:
     - *Cause*: `width`/`height` ratio doesn't match `viewBox` aspect ratio without `preserveAspectRatio`.
     - *Fix*: Ensure `viewBox` ratio matches width/height or set `preserveAspectRatio="xMidYMid meet"`.
   - **Missing Colors / Invisible Paths**:
     - *Cause*: `fill="none"` with no `stroke`, or stroke color matches background.
     - *Fix*: Set explicit `stroke="currentColor"` or dark/high-contrast fills.
   - **Text Overflow**:
     - *Cause*: `<text>` nodes without specified font-family or explicit text-anchor.
     - *Fix*: Use explicit `font-family="sans-serif"` and set `text-anchor="middle"` for centered labels.

5. **Re-render & Confirm**:
   - Update SVG file with corrected attributes.
   - Re-run `render-svg.js`.
   - Verify clean visual rendering without clipping or artifacts.
