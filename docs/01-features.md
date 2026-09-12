# LIFE-RPG: Product Feature Specification

> **Document Version:** 1.0.0  
> **Status:** Canonical Feature Specification  
> **Author:** Senior Product Management & Game Design Team  
> **Last Updated:** 2026-09-12  

---

## 1. Product Vision & Philosophy

### 1.1 Product Vision
**Life-RPG** is a full-stack, cross-device productivity platform that transforms real-world goals, routines, and challenges into a satisfying, retro-arcade role-playing progression system. 

Our guiding product thesis is:
> **"Your life is the gameplay."**

The platform eliminates the cold, clinical feel of corporate project trackers and the trivial, punishing guilt of basic habit counters. Instead, it creates an engaging virtual journey where real-world discipline fuels character growth, unlocks virtual artifacts, and visually expands a player's realm.

### 1.2 The Core Problem: Delayed Gratification
Human biology and motivation struggle with delayed gratification:
- Studying computer science or mathematics requires months of effort before a tangible payoff appears.
- Going to the gym or eating well yields imperceptible changes over day-to-day intervals.
- Working on a monolithic project (e.g., a capstone or thesis) creates chronic dread and procrastination.

In contrast, video games provide **instant feedback loops**, clear milestone progress, immediate sensory celebration, and tangible progression. **Life-RPG bridges this gap** by translating the effort of doing real work into immediate, verifiable, server-authoritative dopamine loops.

### 1.3 The Low-Friction Principle
Most gamified productivity apps fail because **the tool itself becomes a burdensome chore**. Users face bloated onboarding, endless skill-tree micromanagement, punitive penalty mechanics that trigger shame spirals, and tedious data entry.

**Life-RPG enforces the Low-Friction Principle:**
1. **Zero-Overhead Logging:** Quests can be logged, filtered, and completed in under two keystrokes or a single tap.
2. **Action-First Architecture:** The home screen answers three questions within 3 seconds:
   - *What is my immediate quest right now?*
   - *How close am I to leveling up or beating the boss?*
   - *What did my effort unlock?*
3. **No Punitive Shame Spirals:** If a user steps away for days or weeks, their character does not die, their stats are not wiped, and they are not chastised. The game pauses gracefully and greets them with a **Recovery Quest**.

---

## 2. Terminology & Traceability Framework

To maintain absolute rigor and transparency across the documentation package, all specifications are labeled using the following canonical taxonomy:

- `[SOURCE REQUIREMENT]`: Mandatory baseline requirement explicitly specified in the governing project brief (`TZPSv2.pdf`). Must be fully satisfied without deviation or weakening.
- `[PROPOSED FEATURE]`: High-leverage architectural or gameplay feature designed specifically for Life-RPG to differentiate it in the market.
- `[RESEARCH FINDING]`: Empirical insight derived from competitor teardowns and real-world user feedback patterns.
- `[DESIGN RECOMMENDATION]`: Ergonomic, visual, or interaction guideline ensuring high usability and aesthetic polish.
- `[TECHNICAL DECISION]`: Implementation choice regarding backend data integrity, security, network transport, or state handling.

---

## 3. Comprehensive Competitor Teardown & Market Research

`[RESEARCH FINDING]`

| Competitor | Positioning & Target User | Core Loops & Mechanics | Strengths | Critical Weaknesses & User Complaints |
| :--- | :--- | :--- | :--- | :--- |
| **Habitica** | Pixel RPG for habits and tasks (broad/geek niche). | Dailies, Habits, To-Dos $\to$ XP + Gold $\to$ Equipment, Pets, Boss battles. | Strong 8-bit retro art; long-standing community; party boss fights. | **High management overhead; severe punishment** (missed dailies damage party members, causing guilt and churn); outdated web UI; easily cheated client-side. |
| **LifeUp** | Android-first gamified task manager with custom shop. | Quests, Attributes, Custom Currencies, Loot boxes. | Highly flexible custom skill systems; offline-first; no subscription pressure. | **Overwhelming configuration complexity**; poor web ecosystem; lack of cohesive narrative; steep learning curve. |
| **Finch** | Self-care virtual pet for mental wellness. | Daily reflections $\to$ Energy $\to$ Pet embarks on adventures. | Extremely forgiving; compassionate recovery; beautiful emotional resonance. | **No serious task/project management**; lacks technical depth; unsuitable for technical or project-driven workflows. |
| **Todoist Karma** | Enterprise productivity tool with subtle gamification points. | Complete tasks $\to$ Earn Karma points $\to$ Karma tiers. | Clean UI; lightning-fast task entry; natural language parsing. | **Karma feels completely meaningless**; zero game mechanics, no avatars, no items, no sensory celebration. |
| **Forest** | Gamified Pomodoro timer. | Focus session (25 min) $\to$ Tree grows $\to$ Build virtual forest. | Tactile, single-purpose clarity; beautiful visual output; real-tree planting charity. | **Narrow scope**; no habit tracking, no complex project milestones, no RPG attributes or character progression. |
| **Fabulous** | Behavioral science habit routine builder. | Morning/evening rituals $\to$ Habit stacking $\to$ Journey letters. | Strong behavioral psychology grounding; high production audio/illustrations. | **Aggressive paywalls; rigid linear tracks**; users feel patronized by scripted journeys. |
| **SuperBetter** | Resilience & wellness game by Jane McGonigal. | Power-ups, Bad Guys, Quests, Allies. | Validated psychological framework (post-traumatic growth). | **Dated early-2010s web design**; clunky UX; weak daily task execution ergonomics. |
| **EpicWin** | Classic action RPG to-do list (iOS). | Tasks with loot drops $\to$ Map exploration $\to$ Animated avatars. | High humor; animated retro aesthetic; visceral feedback. | **Abandoned maintenance**; zero web integration; no modern cloud sync; very shallow RPG depth. |
| **Duolingo** | Language learning with hyper-optimized gamification. | Daily lessons $\to$ Streaks, XP, Leagues, Chests, Freeze tokens. | World-class retention mechanics; immediate tactile animations; mascot personality. | **Streak anxiety and user burnout**; punishing league demotions induce toxic engagement patterns. |
| **Beeminder** | Hardcore commitment contracts with financial penalties. | Track data $\to$ Stay on the yellow brick road $\to$ Derail and pay real money. | Extreme accountability for hyper-rationalists. | **Intense stress and anxiety**; accidental bugs or missed syncs cause wrongful charges; high churn. |
| **Amazing Marvin** | Hyper-customizable productivity sandbox with game strategies. | Modular strategies $\to$ Day planning $\to$ Reward animations. | Deep productivity feature set; highly respectful of user psychology. | **Massive configuration fatigue**; intimidating for casual users; no deep RPG narrative or cohesive visual world. |

### Key Market Opportunities for Life-RPG
1. **Escape the Punishment Trap:** Existing RPG tools (Habitica, Beeminder) punish inactivity with HP loss or real cash loss. When life gets chaotic, users abandon the tool out of shame. Life-RPG replaces shame-based punishment with **Momentum** and **Recovery Quests**.
2. **Bridge the Gap Between Sandbox and Automation:** LifeUp requires manual configuration of every stat and formula; Todoist has no RPG soul. Life-RPG provides an intelligent **AI Game Master** that converts messy real-world goals (e.g., *"Learn React"* or *"Build Capstone"*) into balanced, multi-stage campaigns with zero manual friction.
3. **True Web-Native Tactile Arcade UI:** Most productivity tools look like dull spreadsheets. Life-RPG delivers a **retro-arcade cabinet experience** built with modern web ergonomics, responsive design, and instant tactile feedback.

---

## 4. Priority Matrix (P0 / P1 / P2 / P3)

To ensure razor-sharp execution, features are strictly triaged into engineering priority tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEATURE PRIORITY MATRIX                         │
├──────────────────┬─────────────────────────────────────────────────────┤
│ P0: MANDATORY    │ • Secure Authentication & User Isolation            │
│ (Source Brief &  │ • Complete Task CRUD (Create, Read, Update, Delete) │
│ MVP Core)        │ • Server-Side Authoritative XP & Level Engine       │
│                  │ • Non-Linear Level Progression Curve                │
│                  │ • 6-Attribute Character System                      │
│                  │ • Daily Activity Streaks System                     │
│                  │ • Gold Economy & Virtual Rewards Shop               │
│                  │ • PostgreSQL Persistence & Prisma ORM               │
│                  │ • Responsive Retro-Arcade UI (Mobile & Desktop)     │
│                  │ • Full Keyboard Accessibility (Tab, Enter, Space)   │
│                  │ • Robust Error Handling & Empty/Loading States      │
├──────────────────┼─────────────────────────────────────────────────────┤
│ P1: CORE         │ • AI Game Master: Goal → Campaign Generator         │
│ DIFFERENTIATORS  │ • Real-Life Boss Battle System with Milestones      │
│ (Launch Target)  │ • Momentum Metric (Rolling 7-day consistency)       │
│                  │ • Gentle Recovery Quests (No shame/punishment)      │
│                  │ • Optimistic UI Updates with Rollback               │
│                  │ • Tactile CRT/Audio/Micro-Animation Feedback        │
├──────────────────┼─────────────────────────────────────────────────────┤
│ P2: POST-MVP     │ • Evolving Pixel Realm (Interactive World Canvas)   │
│ (Enhanced)       │ • Built-in Arcade Focus Timer (Pomodoro integration)│
│                  │ • Custom Real-World Player Rewards in Shop          │
│                  │ • Weekly Progress AI Chronicles                     │
│                  │ • Exportable Character Cards                        │
├──────────────────┼─────────────────────────────────────────────────────┤
│ P3: EXPERIMENTAL │ • Guilds & Cooperative Party Boss Fights            │
│ (Future Horizon) │ • P2P Quest Challenges & Leaderboards               │
│                  │ • Multi-model AI Voice Guidance                     │
└──────────────────┴─────────────────────────────────────────────────────┘
```

---

## 5. Detailed Feature Specifications

### 5.1 User Authentication & Security
- **Type:** `[SOURCE REQUIREMENT]`
- **Priority:** `P0`
- **Description:** Multi-provider authentication allowing users to securely create an account, log in, manage sessions, and synchronize character progress across desktop, tablet, and mobile devices.
- **Functional Requirements:**
  1. Support email/password registration with strict password policies ($\ge 8$ chars, mixed case, number, symbol) and OAuth (GitHub/Google).
  2. Issue secure, HTTP-only, `SameSite=Lax`, cryptographically signed JWT session cookies.
  3. Strict Row-Level Security / Tenant Isolation: Every query and database transaction filters strictly on `user_id == session.userId`. No user can inspect, modify, or corrupt another player's tasks, stats, or items.
  4. Secure session invalidation on logout.

### 5.2 Task & Quest Management (CRUD)
- **Type:** `[SOURCE REQUIREMENT]`
- **Priority:** `P0`
- **Description:** High-speed management of real-world activities structured as RPG Quests.
- **Functional Requirements:**
  1. **Create Quest:** Title (required, 1–120 chars), Description (optional, markdown), Attribute category (STR, INT, WIS, DEX, CRE, CHA), Difficulty Tier (Trivial, Easy, Medium, Hard, Epic), Due Date (optional).
  2. **Read Quests:** Filterable by Status (Active, Completed, Archived), Attribute, and Due Date. Fast full-text search.
  3. **Update Quest:** Inline editing of quest parameters with keyboard shortcut support (`Enter` to save, `Esc` to cancel).
  4. **Delete Quest:** Soft deletion with temporary undo banner (5-second grace period).
  5. **Complete Quest:** Authoritative server-side completion handler. Automatically awards calculated XP, Gold, Attribute progress, updates streaks, and rolls for milestone achievements.

### 5.3 The RPG Progression Engine
- **Type:** `[SOURCE REQUIREMENT]`
- **Priority:** `P0`
- **Description:** Non-linear character leveling system designed to provide rapid initial achievement while scaling smoothly to reward long-term dedication.
- **Progression Math & Formulas:**
  - The XP required to advance from Level $L$ to Level $L+1$ is non-linear:
    $$\text{XP}_{\text{required}}(L) = \left\lfloor 100 \times L^{1.5} \right\rfloor$$
  - Cumulative XP required to reach Level $L$:
    $$\text{XP}_{\text{cumulative}}(L) = \sum_{k=1}^{L-1} \left\lfloor 100 \times k^{1.5} \right\rfloor$$
  
  | Level | XP to Next Level | Cumulative XP | Milestone Title |
  | :--- | :--- | :--- | :--- |
  | **1** | 100 XP | 0 XP | Novice Wanderer |
  | **2** | 282 XP | 100 XP | Pixel Initiate |
  | **3** | 519 XP | 382 XP | Realm Pathfinder |
  | **4** | 800 XP | 901 XP | Arcade Adept |
  | **5** | 1,118 XP | 1,701 XP | Quest Veteran |
  | **10** | 3,162 XP | 11,469 XP | Master of Realities |
  | **25** | 12,500 XP | 110,612 XP | Legendary Grandmaster |

- **Quest Reward Tiers:**
  Rewards are calculated authoritatively on the backend based on quest difficulty:

  | Difficulty Tier | Base XP | Base Gold | Intended Scope |
  | :--- | :--- | :--- | :--- |
  | **Trivial** | +10 XP | +5 GP | $<5$ minutes (Drink water, make bed, clear inbox) |
  | **Easy** | +25 XP | +10 GP | 15–30 minutes (Short walk, review flashcards) |
  | **Medium** | +50 XP | +25 GP | 1 hour focused work (Write essay draft, full workout) |
  | **Hard** | +100 XP | +50 GP | Half-day project milestone (Implement API, deep study) |
  | **Epic** | +250 XP | +100 GP | Major multi-day deliverable or exam completion |

### 5.4 Character Attributes System
- **Type:** `[SOURCE REQUIREMENT]`
- **Priority:** `P0`
- **Description:** Six balanced real-life character attributes that level up independently, providing a visual radar chart of the player's real-life balance.
- **The Canonical 6 Attributes:**
  1. **Strength (`STR`):** Physical health, gym, cardiovascular training, nutrition, sleep quality.
  2. **Intellect (`INT`):** Coding, technical learning, reading non-fiction, academic research, problem-solving.
  3. **Wisdom (`WIS`):** Mindfulness, meditation, reflection, mental therapy, life planning, philosophical reading.
  4. **Discipline (`DEX`):** Chores, financial management, punctuality, habit consistency, organization.
  5. **Creativity (`CRE`):** Writing fiction, UI/UX design, art, music, creative engineering, brainstorming.
  6. **Charisma (`CHA`):** Social networking, public speaking, family connection, teamwork, community service.

- **Attribute Progression Rules:**
  - Completing an attribute-tagged quest awards 100% of the quest XP to the character's general level and 100% of the quest XP to that specific attribute track.
  - Attributes each have their own mini-level calculated via:
    $$\text{Attribute Level}(A) = \max\left(1, \left\lfloor \left(\frac{\text{Attribute XP}}{100}\right)^{0.667} \right\rfloor + 1\right)$$

### 5.5 Streaks, Momentum & Graceful Recovery
- **Type:** `[SOURCE REQUIREMENT] & [PROPOSED FEATURE]`
- **Priority:** `P0 (Streaks)` & `P1 (Momentum & Recovery)`
- **Description:** Dual-layer consistency tracking that celebrates daily habits without inducing shame or catastrophic disengagement when life interrupts routine.
- **Mechanics:**
  1. **Daily Streak (`P0`):** Non-punitive streak tracking. On each verified completion, the user's local date is computed from their profile timezone:
     - If `lastActiveDate` is missing or equals today: streak continues (set to 1 if missing).
     - If `lastActiveDate` was yesterday: `streakCurrent += 1`.
     - If `lastActiveDate` was 2+ days ago: the streak does NOT hard-reset. The `streakCurrent` remains frozen, a `streakPaused` flag is derived (`lastActiveDate >= 36h` ago), and the next completion resumes directly from the frozen value. There is NO punitive reset, ever.
  2. **Momentum Score (`P1`):** A dynamic rating from 0 to 100 representing rolling 7-day consistency and effort weight:
     $$\text{Momentum} = \min\left(100, \sum_{d=0}^{6} \frac{\text{Completed XP}_{d}}{200} \times w_d\right)$$
     where $w_d$ weights recent days higher ($w_0 = 1.0, w_6 = 0.4$).
     - *Benefit:* If a player misses one Sunday after a productive week, their streak might pause, but their Momentum only dips from 92 to 84. They don't feel like all progress is ruined.
  3. **Recovery Quests (`P1`):** If a user returns after $\ge 72$ hours of inactivity:
     - No skull icons, no negative sounds, no snide notifications.
     - The HUD presents a gentle banner: *"Your adventure was on pause. Ready to jump back in?"*
     - Generates an instant, low-friction **Recovery Quest** (e.g., *"Drink a glass of water and stretch"* or *"Spend 5 minutes planning today"*).
     - Completing the Recovery Quest grants a **+50% "Welcome Back" XP Boost** for the remainder of that day.

### 5.6 In-Game Economy, Gold & Virtual Rewards Shop
- **Type:** `[SOURCE REQUIREMENT]`
- **Priority:** `P0`
- **Description:** Authoritative currency and inventory system rewarding disciplined task completion with cosmetic upgrades, themes, and self-rewards.
- **Mechanics:**
  1. **Currency (Gold - `GP`):** Earned solely via verified task completions and boss damage. Cannot be purchased with real money (zero pay-to-win).
  2. **Shop Catalog Items:**
     - **Arcade CRT Themes:** Synthwave Magenta, Monochrome GameBoy, 16-Bit Fantasy Castle, Cyberpunk Matrix (50–300 GP).
     - **Pixel Profile Badges:** "Bug Hunter", "Iron Lifter", "Scholar", "Night Owl" (25–100 GP).
     - **Arcade Sound Packs:** 8-bit Chiptune, Lo-Fi Cozy, Retro Sci-Fi, Silent (Muted) (Free / 50 GP).
     - **Custom Player Self-Rewards:** Users can create personalized real-life rewards (e.g., *"Watch 1 episode of anime"*, *"Buy fancy espresso"*, *"1 hour gaming guilt-free"*) and price them in Gold. Redeeming deducts Gold and logs a celebratory redemption event!

### 5.7 The Real-Life Boss Battle System
- **Type:** `[PROPOSED FEATURE]` (Signature Differentiator)
- **Priority:** `P1`
- **Description:** Transforms massive, daunting real-world objectives (e.g., "Pass Final Exams", "Launch Capstone Project", "Run a 10K") into epic multi-stage Boss Battles.
- **Mechanics:**
  1. **Boss Entity:** Has a Title, Thematic Pixel Art Avatar (e.g., *"The Monolith of Procrastination"*, *"The Deadline Dragon"*), Total HP, Current HP, and a Target Completion Date.
  2. **Milestone HP Mapping:** The user or AI Game Master breaks the boss into 4–10 explicit milestones with allocated HP damage values totaling the boss's HP pool.
     - *Example:* "Final Year Project" (Total HP: 1,000)
       - Milestone 1: Literature Review & Problem Statement (-150 HP)
       - Milestone 2: System Architecture & DB Design (-200 HP)
       - Milestone 3: Core CRUD & Auth API (-250 HP)
       - Milestone 4: Frontend UI & Polish (-200 HP)
       - Milestone 5: Testing & Deployment Demo (-200 HP)
  3. **Combat Loop:** Checking off a real-world milestone triggers a CRT screen shake, boss damage animation, and floating combat text (`-200 HP! CRITICAL HIT!`).
  4. **Victory Rewards:** Defeating a Boss triggers a full-screen arcade victory fanfare, awards an exclusive achievement badge, massive Gold (+250 GP), and an epic XP chest.

### 5.8 AI Game Master (Powered by Gemini)
- **Type:** `[PROPOSED FEATURE]` (Signature Differentiator)
- **Priority:** `P1`
- **Description:** An intelligent procedural progression assistant that transforms unstructured user ambitions into structured, balanced RPG campaigns and boss fights.
- **Architectural Rules:**
  1. **Not a generic chat window:** It is an API-driven generation engine with strictly defined structured JSON outputs.
  2. **Zero Authoritative Bypass:** The AI outputs proposed quest definitions (titles, descriptions, attributes, suggested difficulties). The server validates and creates the actual database records. The AI can NEVER directly write to a user's wallet, XP balance, or inventory.
  3. **Deterministic Fallbacks:** If the AI service is unavailable or rate-limited, the system falls back to curated rule-based quest templates (e.g., standard coding tracks, fitness regimens).

---

## 6. Edge Cases & Robustness Matrix

`[TECHNICAL DECISION]`

| Edge Case Scenario | Potential Failure Mode | Life-RPG System Behavior & Mitigation |
| :--- | :--- | :--- |
| **Double-Click on Quest Complete** | Race condition awarding duplicate XP and Gold. | **Backend Idempotency:** The completion endpoint uses a unique composite lock `(user_id, task_id, completion_date)`. Subsequent simultaneous requests return `409 Conflict` or cached success without re-crediting. |
| **Simultaneous Tabs / Devices** | State desynchronization or conflicting updates. | **Optimistic UI with Conflict Resolution:** The UI updates immediately on click. If a concurrent tab already finished or deleted the task, the server returns the authoritative state and the client rolls back gracefully with a toast notification. |
| **Network Disconnect Mid-Action** | Action lost, user confused whether quest completed. | **Local Queue & Optimistic Indicator:** The quest marks as completed locally with a subtle "syncing..." arcade phosphor icon. If the offline condition persists, it retries with exponential backoff; if cancelled, it rolls back cleanly. |
| **Client-Side Value Tampering** | User attempts to send `{ xp: 999999, gold: 999999 }` in payload. | **Zero-Trust Client Policy:** The API payload for `/complete` only accepts the `taskId`. All calculations for XP, Gold, Level thresholds, and Attribute increments are strictly computed inside server-side database transactions. |
| **Timezone Shift / Daylight Savings** | Streaks wrongly broken or double-counted across time zones. | **User Local Timezone Normalization:** The user profile stores the IANA timezone (e.g., `Asia/Kolkata`). Daily boundaries are evaluated relative to the user's localized calendar date rather than raw UTC timestamps. |
| **Empty or Whitespace-Only Task** | Database pollution with blank entries. | **Zod Schema Validation:** Both client and server reject titles with length $<1$ or string consisting solely of whitespace (`title.trim().length >= 1`). |
| **Sudden AI Service Outage** | Quest generation spinner hangs indefinitely. | **5-Second Timeout with Template Fallback:** If the Gemini API does not return valid structured JSON within 5,000ms, the request gracefully degrades to pre-compiled high-quality quest templates with an explanatory notice. |
| **Database Connection Failure** | Unhandled promise rejection crashing the server. | **Connection Pooling & Health Checks:** Managed Prisma connection pool with retry logic. Graceful error boundary returns HTTP 503 with an arcade-themed "System Rebooting" screen instead of a blank crash. |

---

## 7. Feature Acceptance Criteria (QA Checklist)

- [ ] **AUTH-01:** New users can sign up with email/password and log in; duplicate emails return a clear error.
- [ ] **AUTH-02:** User session persists across page reloads and browser restarts via secure HTTP-only cookies.
- [ ] **TASK-01:** Users can create, view, edit, and delete quests; changes appear immediately in the UI.
- [ ] **PROG-01:** Completing a quest awards the exact configured XP and Gold according to the server-side tier table.
- [ ] **PROG-02:** Reaching an XP threshold triggers a celebratory Level-Up event with visual fanfare.
- [ ] **ATTR-01:** Completing a tagged quest increments both general XP and the matching attribute's XP.
- [ ] **STREAK-01:** Completing a quest on consecutive days increments the streak counter; missing a day pauses the streak without deleting past history.
- [ ] **BOSS-01:** Completing a boss milestone deals exact damage to the boss's HP bar; dropping to 0 HP marks the boss as Defeated and dispenses victory rewards.
- [ ] **SHOP-01:** Purchasing a theme deducts Gold transactionally; items cannot be purchased if Gold is insufficient.
- [ ] **A11Y-01:** All interactive elements can be navigated and triggered via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- [ ] **RESP-01:** All views render cleanly without horizontal scrollbars across mobile (375px), tablet (768px), and desktop (1440px+).
