---
name: motion-dev
description: "Mastery of Motion (motion.dev / Framer Motion) for declarative web animations, layout animations, gestures, scroll-linked animations, spring physics, exit animations (AnimatePresence), and fluid interactive interfaces."
---

# Motion.dev / Framer Motion Skill

High-performance, declarative motion design and gesture orchestration for React, Vanilla JS, and modern web frameworks.

## Core Features

1. **Declarative Component Animations**: Simple `initial`, `animate`, `exit`, and `transition` props.
2. **Spring Physics**: Precise physics simulation (`stiffness`, `damping`, `mass`, `velocity`) avoiding rigid durations.
3. **Layout Animations (`layout`, `layoutId`)**: Automatic FLIP-based layout morphing between list reorders, tabs, and shared element transitions.
4. **Scroll Orchestration (`useScroll`, `scroll()`)**: Scroll progress bars, parallax depth, viewport reveals (`whileInView`).
5. **Gestures & Tactile Micro-Interactions**: `whileHover`, `whileTap`, `whileDrag`, `dragConstraints`.

## Key Patterns

### 1. Spring-Loaded Card Hover & Tap
```jsx
import { motion } from 'motion/react';

export function InteractiveCard({ children, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="card"
    >
      {children}
    </motion.div>
  );
}
```

### 2. Layout Transitions & Active Indicators
```jsx
import { motion } from 'motion/react';

export function TabBar({ tabs, activeTab, onSelect }) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onSelect(tab.id)} className="tab-button">
          {tab.label}
          {activeTab === tab.id && (
            <motion.div 
              layoutId="active-indicator" 
              className="tab-pill-highlight"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```
