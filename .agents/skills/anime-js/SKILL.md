---
name: anime-js
description: "Mastery of Anime.js (v3/v4) for fluid web animation, timeline orchestration, SVG path morphing, SVG line drawing, staggering effects, complex CSS property manipulation, canvas particle systems, and kinetic UI micro-interactions."
---

# Anime.js Animation Engine Skill

Expert guidelines and practical patterns for building high-performance, expressive animations using Anime.js in web applications.

## Core Capabilities

1. **Timeline Orchestration**: Chaining complex multi-element sequences with relative offsets (`-=200`, `+=100`), overlapping tweens, and synchronized choreographies.
2. **SVG Morphing & Drawing**: Animating SVG `path`, `stroke-dashoffset`, shapes, and organic morphing effects.
3. **Stagger Effects**: `anime.stagger(val, { start, from, direction, grid, axis })` for ripples, wave grids, and entrance choreographies.
4. **Custom Easings & Physics**: Spring physics, elastic rebounds (`easeOutElastic(1, .5)`), cubic beziers, and custom mathematical easing curves.
5. **Interactive Controls**: Play, pause, restart, reverse, seek, and loop management bound to user gestures and scroll triggers.

## Key Patterns

### 1. Element Entrance Stagger (Cards, Lists, Tiles)
```javascript
import anime from 'animejs';

export function animateGridEntrance(selector = '.card') {
  return anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [40, 0],
    scale: [0.92, 1],
    delay: anime.stagger(80, { from: 'center' }),
    easing: 'easeOutElastic(1, .8)',
    duration: 800
  });
}
```

### 2. Interactive SVG Morph & Line Drawing
```javascript
anime({
  targets: '.svg-path-line',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 1200,
  delay: function(el, i) { return i * 250 },
  direction: 'alternate',
  loop: true
});
```

### 3. Timeline Sequences
```javascript
const tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

tl.add({
  targets: '.modal-backdrop',
  opacity: [0, 1]
})
.add({
  targets: '.modal-card',
  scale: [0.8, 1],
  opacity: [0, 1],
  translateY: [20, 0]
}, '-=400')
.add({
  targets: '.modal-item',
  opacity: [0, 1],
  translateY: [15, 0],
  delay: anime.stagger(50)
}, '-=200');
```
