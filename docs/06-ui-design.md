# LIFE-RPG: UX/UI Design System & Retro Arcade Visual Specification

> **Document Version:** 1.0.0  
> **Status:** Canonical UX/UI Specification  
> **Design Theme:** Retro Arcade Cabinet meets High-Performance Productivity  
> **Author:** Senior UX/UI Designer & Creative Director  
> **Last Updated:** 2026-09-12  

---

## 1. Design Philosophy & Target Audience

### 1.1 The Golden Ratio: 70 / 20 / 10
Life-RPG is **not** a toy or a shallow novelty game; it is an ergonomic, high-throughput daily driver for serious real-world achievement.

We maintain a strict visual-to-utility ratio:
- **70% Modern Ergonomic UX:** Clean layouts, generous negative space, high contrast, crystal-clear typography, lightning-fast keyboard shortcuts, and zero clutter.
- **20% Retro-Arcade Identity:** Illuminated cabinet marquees, beveled pixel frames, glowing phosphor gauges, and CRT scanlines.
- **10% Pure Game Magic:** Satisfying 3D button clicks, subtle particle bursts on quest completion, screen shake on boss damage, and triumphant level-up fanfares.

### 1.2 Target Audience & Aesthetic Maturity
- **Who it is for:** University students, software engineers, designers, knowledge workers, founders, and busy adults who want their daily effort recognized.
- **Aesthetic Tone:** Mature, sleek, dark-mode synthwave/cyber-arcade (think *Tron*, *Blade Runner 2049*, or premium custom mechanical keyboards).
- **Explicit Anti-Patterns:**
  - ❌ No childish cartoon characters or condescending mascot nagging.
  - ❌ No unreadable walls of pixel font for paragraphs of text.
  - ❌ No garish, oversaturated rainbow clutter that causes eye fatigue.

---

## 2. Information Architecture & Sitemap

```
├── (auth)
│   ├── /login                     # Retro arcade coin-insert style signin
│   └── /register                  # Character creation & initial attribute setup
└── (dashboard)
    ├── /                          # Main Arcade Screen (Quests, HUD, Level, Daily Loop)
    ├── /quests                    # Detailed Quest Log & Category Filtering
    ├── /bosses                    # Active Boss Battles & Milestone Tracking
    ├── /character                 # Character Sheet, Attributes Radar & Inventory
    ├── /shop                      # Virtual Arcade Rewards & Theme Catalog
    └── /settings                  # Profile, Timezone, SFX, and Display Options
```

### The 3-Second Home Screen Principle
When a user opens the app, the interface immediately answers three questions without scrolling:
1. **What should I do right now?** $\to$ Prominent "Daily Active Quests" card with high-priority tasks.
2. **How am I progressing?** $\to$ Glowing XP progress gauge, current Level, and Streak/Momentum counter.
3. **What is my big challenge?** $\to$ Active Boss Battle widget showing remaining HP.

---

## 3. The Retro Arcade Design System

`[DESIGN RECOMMENDATION] & [SOURCE REQUIREMENT]`

### 3.1 Color Palette Tokens

```css
:root {
  /* Background & Chassis */
  --color-arcade-black: #0B0C16;    /* Deep space CRT void background */
  --color-cabinet-surface: #141324; /* Cabinet bezel and card surface */
  --color-cabinet-border: #2B254A;  /* Beveled structural border */

  /* Arcade Neon Accents */
  --color-neon-cyan: #00F0FF;       /* High-energy interactive highlights, buttons */
  --color-synth-magenta: #FF2A85;   /* Boss HP, XP bar fill, marquee brand */
  --color-arcade-gold: #FFE600;     /* Currency, stars, streak fire, badges */
  --color-phosphor-green: #00FF66;  /* Task completion checkmarks, health */
  --color-arcade-red: #FF3366;      /* Warnings, critical damage */

  /* Text & Readability */
  --color-text-primary: #EDEBF7;    /* Pure crisp readable white */
  --color-text-secondary: #9F9BB8;  /* Subtitles, metadata, timestamps */
  --color-text-muted: #5E5879;      /* Inactive icons, subtle grid lines */
}
```

### 3.2 Typography Hierarchy & Font Pairing
To guarantee 100% accessibility while maintaining retro flavor, we employ a strict dual-font system:

1. **Pixel Font:** `'Press Start 2P'` or `'Silkscreen'` (via Google Fonts).
   - **Usage (Strictly constrained):** Numerical scores, Level numbers (`LVL 9`), character titles, button labels, and marquee banners.
   - **Rule:** Never use pixel fonts for multi-line descriptions or reading text!
2. **Modern Sans-Serif Font:** `'Outfit'` or `'Inter'` (via Google Fonts).
   - **Usage:** Task titles, quest descriptions, modal body text, settings forms, and data tables.
   - **Rule:** Optimized for high reading speed, proper kerning, and screen-reader accessibility.

```css
/* Typography Utility Classes */
.font-arcade {
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.font-sans {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.01em;
}
```

---

## 4. Key UI Components & Visual Motifs

### 4.1 The CRT Screen & Scanline Shader
A lightweight, GPU-accelerated scanline and vignette overlay giving the viewport an authentic arcade monitor feel without consuming CPU cycles:

```css
/* Scanline overlay container */
.crt-overlay {
  position: relative;
  overflow: hidden;
}

.crt-overlay::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(
    rgba(18, 16, 30, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 40;
  pointer-events: none;
  opacity: 0.6;
}

/* Subtle CRT monitor curvature border glow */
.crt-bezel {
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.7),
              0 0 30px rgba(255, 42, 133, 0.15);
  border: 2px solid var(--color-cabinet-border);
  border-radius: 12px;
}
```

### 4.2 Tactile Arcade Push-Buttons (`ArcadeButton.tsx`)
Buttons feature a beveled 3D appearance that visibly compresses when clicked:

```css
.arcade-btn-primary {
  background: var(--color-synth-magenta);
  color: #FFFFFF;
  box-shadow: 0 4px 0 #9E0045, 0 6px 12px rgba(255, 42, 133, 0.4);
  transform: translateY(0);
  transition: all 0.08s ease-in-out;
  border: 1px solid #FF77B0;
}

.arcade-btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 0 #9E0045, 0 8px 16px rgba(255, 42, 133, 0.6);
}

.arcade-btn-primary:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #9E0045, 0 2px 4px rgba(255, 42, 133, 0.3);
}
```

### 4.3 Segmented Pixel XP Progress Gauge
A glowing, segmented energy bar showing progress to the next level:
- Background: Deep purple track with pixel notches.
- Fill: Glowing neon gradient (`#FF2A85` to `#00F0FF`).
- Text indicator: `"720 / 1000 XP (72%)"` in crisp micro-typography.

### 4.4 The Interactive Quest Card (`QuestCard.tsx`)
- **Left:** Thematic attribute icon badge (`INT` in cyan, `STR` in crimson).
- **Center:** Quest title in clear modern font, with estimated time and difficulty tag.
- **Right:** XP and Gold reward pill (`+50 XP | +25 GP`).
- **Action:** Chunky arcade checkbox that triggers a satisfying click sound and a localized burst of golden pixel confetti upon completion.

---

## 5. Animation, Tactile Feedback & Sound Design

### 5.1 Sound Effects Architecture (`src/lib/sound.ts`)
Using the Web Audio API, sound effects are generated synthetically or loaded from tiny audio sprites:
- `sfx_click`: Sharp, tactile mechanical switch click (10ms).
- `sfx_complete`: 3-tone ascending 8-bit arpeggio on quest completion (120ms).
- `sfx_levelup`: Triumphant 8-bit brass fanfare with visual screen flash.
- `sfx_boss_hit`: Heavy low-frequency punch with screen shake.
- **Global Mute:** Accessible persistent audio toggle in the top HUD. Default state: Muted until user opts in, respecting web autoplay policies.

### 5.2 Micro-Interactions & Spring Animations
- Built with **Framer Motion**:
  - Modal entries scale smoothly from $0.95 \to 1.0$ with spring physics (`damping: 20, stiffness: 300`).
  - Completed quests slide horizontally off the active list with a fading glow.
  - XP counter smoothly rolls up numbers over 600ms.

### 5.3 Reduced Motion Accessibility Support
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .crt-overlay::before {
    display: none !important;
  }
}
```
When reduced motion is enabled, all screen shakes, confetti explosions, and scanline animations are cleanly bypassed, replacing them with instantaneous state changes.

---

## 6. Responsive Layout Breakpoints

`[SOURCE REQUIREMENT]`

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`<768px`)** | iPhones, Android phones | Single-column vertical stack. The desktop arcade cabinet frame transforms into a sleek **retro handheld console (GameBoy / Game Gear)** layout. Bottom navigation bar with touch-friendly 48px hit targets. |
| **Tablet (`768px - 1024px`)** | iPads, Tablets | Two-column split layout: Left side features character HUD and level; right side displays the active quest queue. |
| **Desktop (`>1024px`)** | Laptops, Desktop Monitors | Full three-column arcade cabinet dashboard: Left panel (Character Sheet & Navigation), Center panel (CRT Main Display & Quest Stream), Right panel (Boss Battles & Progress Tracker). |
