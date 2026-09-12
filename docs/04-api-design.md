# LIFE-RPG: RESTful API Design Specification

> **Document Version:** 1.0.0  
> **Status:** Canonical API Specification  
> **Base URL:** `/api/v1`  
> **Author:** Full-Stack Architect & Security Engineer  
> **Last Updated:** 2026-09-12  

---

## 1. Global API Conventions & Standards

### 1.1 Transport & Serialization
- All endpoints communicate strictly over HTTPS using `application/json` payload encoding.
- UTC timestamps follow ISO-8601 formatting (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Date-only values follow `YYYY-MM-DD`.

### 1.2 Unified Response Envelope
Every API response adheres to a strict, predictable JSON wrapper:

#### Success Response (`2xx`):
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-12T16:00:00.000Z",
    "requestId": "req_8f12a9c3"
  }
}
```

#### Error Response (`4xx`, `5xx`):
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "The requested quest does not exist or does not belong to your account.",
    "details": null
  },
  "meta": {
    "timestamp": "2026-09-12T16:00:00.000Z",
    "requestId": "req_8f12a9c3"
  }
}
```

### 1.3 HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Zod validation failure or malformed JSON.
- `401 Unauthorized`: Missing or invalid session token/cookie.
- `403 Forbidden`: Resource belongs to another user (tenant isolation violation).
- `404 Not Found`: Entity does not exist.
- `409 Conflict`: Duplicate completion or race condition violation.
- `422 Unprocessable Entity`: Business rule constraint violated (e.g., insufficient gold).
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected server exception.

### 1.4 Idempotency & Concurrency Safety
For financial, progression, and task completion endpoints, clients may supply an `Idempotency-Key: <UUID>` header. If a duplicate key is processed within 120 seconds, the server returns the cached response without repeating side-effects.

---

## 2. Authentication & Identity Endpoints

### 2.1 Register New User
- **METHOD:** `POST`
- **PATH:** `/api/v1/auth/register`
- **AUTH:** Public
- **REQUEST BODY:**
  ```json
  {
    "email": "player@liferpg.dev",
    "password": "SecurePassword123!",
    "username": "ArcadeHero"
  }
  ```
- **VALIDATION:**
  - `email`: Valid email format, normalized to lowercase.
  - `password`: String, min 8 chars, max 100 chars, containing at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - `username`: Alphanumeric, 3–20 characters, matching `/^[a-zA-Z0-9_]+$/`.
- **RESPONSE (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c7a8b412-3211-44aa-9811-123456789abc",
        "email": "player@liferpg.dev",
        "username": "ArcadeHero"
      }
    }
  }
  ```
- **ERRORS:** `400 Bad Request`, `409 Conflict (EMAIL_OR_USERNAME_EXISTS)`.
- **SECURITY NOTES:** Passwords hashed with Argon2id. Automatically provisions profile, default character record, and initializes 6 attribute records inside an atomic transaction. Sets secure HTTP-only session cookie.

---

## 3. Character & Progression Endpoints

### 3.1 Get Player Character Sheet
- **METHOD:** `GET`
- **PATH:** `/api/v1/character`
- **AUTH:** Authenticated (Session Cookie)
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "p91a82bc-9921-4def-a111-987654321def",
      "username": "ArcadeHero",
      "title": "Novice Wanderer",
      "totalXp": 420,
      "currentLevel": 2,
      "xpToNextLevel": 182,
      "levelProgressPercent": 56.4,
      "gold": 125,
      "streakCurrent": 5,
      "streakLongest": 12,
      "momentumScore": 78,
      "activeTheme": "synthwave",
      "avatarId": "pixel_knight",
      "attributes": [
        { "code": "STR", "name": "Strength", "level": 2, "xp": 140 },
        { "code": "INT", "name": "Intellect", "level": 3, "xp": 210 },
        { "code": "WIS", "name": "Wisdom", "level": 1, "xp": 20 },
        { "code": "DEX", "name": "Discipline", "level": 1, "xp": 50 },
        { "code": "CRE", "name": "Creativity", "level": 1, "xp": 0 },
        { "code": "CHA", "name": "Charisma", "level": 1, "xp": 0 }
      ]
    }
  }
  ```
- **SECURITY & STREAK NOTES:** Evaluates whether `lastActiveDate` requires a streak pause or triggers an eligible Recovery Quest. Streak calculation is non-punitive:
  - If `lastActiveDate` is missing or equals today: streak continues (set to 1 if missing).
  - If `lastActiveDate` is yesterday in user's profile timezone: `streakCurrent += 1`.
  - If `lastActiveDate` is 2+ days ago: `streakCurrent` is frozen (never reset to 0); `streakPaused` is derived as `true` when `lastActiveDate >= 36h` ago, and the next completion resumes from the frozen value. No punitive reset, ever.

---

## 4. Tasks & Quests Endpoints (CRUD + Complete)

### 4.1 List Quests
- **METHOD:** `GET`
- **PATH:** `/api/v1/tasks`
- **AUTH:** Authenticated
- **QUERY PARAMS:**
  - `status`: Optional enum `ACTIVE` | `COMPLETED` | `ARCHIVED` (Default: `ACTIVE`).
  - `attribute`: Optional enum `STR` | `INT` | `WIS` | `DEX` | `CRE` | `CHA`.
  - `limit`: Integer, 1–100 (Default: 50).
  - `offset`: Integer (Default: 0).
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "task_1a2b3c",
          "title": "Read Chapter 4 of Distributed Systems",
          "description": "Focus on Raft consensus protocol",
          "attributeCode": "INT",
          "difficulty": "Medium",
          "xpReward": 50,
          "goldReward": 25,
          "status": "ACTIVE",
          "dueDate": "2026-09-15",
          "createdAt": "2026-09-12T10:00:00.000Z"
        }
      ],
      "total": 1
    }
  }
  ```

### 4.2 Create Quest
- **METHOD:** `POST`
- **PATH:** `/api/v1/tasks`
- **AUTH:** Authenticated
- **REQUEST BODY:**
  ```json
  {
    "title": "Practice 45 minutes of LeetCode",
    "description": "Solve two Medium graph problems",
    "attributeCode": "INT",
    "difficulty": "Medium",
    "dueDate": "2026-09-13"
  }
  ```
- **VALIDATION:**
  - `title`: String, trimmed length 1–160 chars.
  - `description`: Optional string, max 2,000 chars.
  - `attributeCode`: One of `['STR', 'INT', 'WIS', 'DEX', 'CRE', 'CHA']`.
  - `difficulty`: One of `['Trivial', 'Easy', 'Medium', 'Hard', 'Epic']`.
  - `dueDate`: Optional valid ISO date string $\ge$ today.
- **SECURITY & BUSINESS LOGIC:** Server automatically maps `difficulty` to authoritative `xpReward` and `goldReward`. Client values for rewards are completely ignored.
- **RESPONSE (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "task_4d5e6f",
      "title": "Practice 45 minutes of LeetCode",
      "attributeCode": "INT",
      "difficulty": "Medium",
      "xpReward": 50,
      "goldReward": 25,
      "status": "ACTIVE",
      "createdAt": "2026-09-12T16:00:00.000Z"
    }
  }
  ```

### 4.3 Complete Quest (Authoritative Engine)
`[SOURCE REQUIREMENT] & [TECHNICAL DECISION]`
- **METHOD:** `POST`
- **PATH:** `/api/v1/tasks/:id/complete`
- **AUTH:** Authenticated
- **REQUEST HEADERS:** `Idempotency-Key: <UUID>`
- **REQUEST BODY:** `{}` (Must be empty! Zero-trust client policy)
- **SECURITY & EXECUTION FLOW:**
  1. Opens an ACID transaction with `SERIALIZABLE` or `ROW SHARE` lock on task.
  2. Validates task exists, `user_id == session.userId`, and `status == 'ACTIVE'`.
  3. Checks `task_completions` table for duplicate entry; if exists, aborts with `409 Conflict`.
  4. Marks `tasks.status = 'COMPLETED'` and sets `completed_at = NOW()`.
  5. Inserts immutable record into `task_completions`.
  6. Increments `profiles.total_xp += task.xp_reward` and `profiles.gold += task.gold_reward`.
  7. Updates `attributes.current_xp` for matching `attributeCode`.
  8. Evaluates Level boundary:
     $$\text{newLevel} = \text{calculateLevel}(\text{newTotalXp})$$
     If `newLevel > oldLevel`, flags `didLevelUp = true`.
  9. Inserts audit record into `xp_transactions`.
  10. Commits transaction.
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "taskId": "task_4d5e6f",
      "awardedXp": 50,
      "awardedGold": 25,
      "character": {
        "totalXp": 470,
        "currentLevel": 2,
        "didLevelUp": false,
        "gold": 150,
        "streakCurrent": 6,
        "momentumScore": 82
      },
      "attributeProgress": {
        "code": "INT",
        "newXp": 260,
        "newLevel": 3
      }
    }
  }
  ```
- **ERRORS:** `404 Not Found (TASK_NOT_FOUND)`, `409 Conflict (TASK_ALREADY_COMPLETED)`.

### 4.4 Update Quest
- **METHOD:** `PATCH`
- **PATH:** `/api/v1/tasks/:id`
- **AUTH:** Authenticated
- **REQUEST BODY:**
  ```json
  {
    "title": "Practice 60 minutes of LeetCode",
    "difficulty": "Hard"
  }
  ```
- **RESPONSE (`200 OK`):** Returns updated task object.

### 4.5 Delete Quest
- **METHOD:** `DELETE`
- **PATH:** `/api/v1/tasks/:id`
- **AUTH:** Authenticated
- **RESPONSE (`200 OK`):** `{ "success": true, "data": { "deletedId": "task_4d5e6f" } }`

---

## 5. Real-Life Boss Battle Endpoints

### 5.1 Create Boss Battle
- **METHOD:** `POST`
- **PATH:** `/api/v1/bosses`
- **AUTH:** Authenticated
- **REQUEST BODY:**
  ```json
  {
    "title": "Capstone Project Submission",
    "description": "Build, test, and deploy the complete application",
    "deadline": "2026-10-01",
    "milestones": [
      { "title": "System Architecture & ERD", "damageHp": 200 },
      { "title": "Implement Server API & Auth", "damageHp": 300 },
      { "title": "Build Frontend Retro UI", "damageHp": 300 },
      { "title": "Write Test Suite & Deploy", "damageHp": 200 }
    ]
  }
  ```
- **VALIDATION:**
  - `title`: 1–120 chars.
  - `milestones`: Array of 2–10 items; each `damageHp` $\ge 50$.
  - Automatically sets `total_hp` and `current_hp` to sum of milestone damage ($\sum = 1000\text{ HP}$).
- **RESPONSE (`201 Created`):** Returns full boss structure with initialized milestones.

### 5.2 Complete Boss Milestone (Deal Damage)
- **METHOD:** `POST`
- **PATH:** `/api/v1/bosses/:bossId/milestones/:milestoneId/complete`
- **AUTH:** Authenticated
- **SECURITY & EXECUTION FLOW:**
  1. Transactional update: Marks milestone `COMPLETED`.
  2. Deducts `damageHp` from `bosses.current_hp`.
  3. If `current_hp <= 0`:
     - Sets `bosses.status = 'DEFEATED'`.
     - Dispenses Boss Victory Loot: +500 XP, +250 Gold, and unlocks "Boss Slayer" profile badge.
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "bossId": "boss_99a8b",
      "inflictedDamage": 300,
      "remainingHp": 700,
      "totalHp": 1000,
      "isDefeated": false,
      "lootAwarded": null
    }
  }
  ```

---

## 6. Rewards, Economy & Inventory Endpoints

### 6.1 List Shop Items
- **METHOD:** `GET`
- **PATH:** `/api/v1/shop/items`
- **AUTH:** Authenticated
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "theme_gameboy",
        "name": "Monochrome Pocket",
        "itemType": "THEME",
        "description": "Classic 1989 green-tinted 4-shade pixel display.",
        "priceGold": 150,
        "isOwned": false
      },
      {
        "id": "badge_boss_slayer",
        "name": "Titan Slayer",
        "itemType": "BADGE",
        "description": "Awarded to those who topple a 1000+ HP Boss.",
        "priceGold": 0,
        "isOwned": true
      }
    ]
  }
  ```

### 6.2 Purchase Item
- **METHOD:** `POST`
- **PATH:** `/api/v1/shop/purchase`
- **AUTH:** Authenticated
- **REQUEST BODY:** `{ "itemId": "theme_gameboy" }`
- **SECURITY & EXECUTION FLOW:**
  1. Starts transaction with `SELECT gold FROM profiles WHERE user_id = $1 FOR UPDATE`.
  2. Verifies user does not already own the item in `inventory`.
  3. Checks `profile.gold >= item.priceGold`. If false, aborts with `422 Unprocessable Entity (INSUFFICIENT_GOLD)`.
  4. Deducts `item.priceGold` from `profiles.gold`.
  5. Inserts new item into `inventory`.
  6. Inserts ledger row into `xp_transactions` (`delta_gold = -priceGold, sourceType = 'SHOP_PURCHASE'`).
  7. Commits transaction.
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "purchasedItem": "theme_gameboy",
      "remainingGold": 25,
      "equipped": false
    }
  }
  ```

---

## 7. AI Game Master Endpoints

### 7.1 Generate Campaign from Goal
`[PROPOSED FEATURE]`
- **METHOD:** `POST`
- **PATH:** `/api/v1/ai/generate-campaign`
- **AUTH:** Authenticated
- **RATE LIMIT:** 5 calls per hour per user.
- **REQUEST BODY:**
  ```json
  {
    "goalDescription": "Learn full-stack web development with Next.js and Prisma",
    "timelineWeeks": 4
  }
  ```
- **RESPONSE (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "campaignTitle": "Path of the Full-Stack Architect",
      "attributeCode": "INT",
      "suggestedQuests": [
        {
          "title": "Master React Server Components",
          "difficulty": "Medium",
          "description": "Build a simple page contrasting client vs server components."
        },
        {
          "title": "Design a Relational PostgreSQL Schema",
          "difficulty": "Hard",
          "description": "Model users, posts, and comments with foreign key constraints."
        }
      ],
      "suggestedBoss": {
        "title": "Deploy Production Web App",
        "totalHp": 500
      }
    }
  }
  ```
- **SECURITY NOTES:** The AI endpoint merely returns structured proposals. Quests are NOT added to the database until the user confirms acceptance, preventing database spam.
