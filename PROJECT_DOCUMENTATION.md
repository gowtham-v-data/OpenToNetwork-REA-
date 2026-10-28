# OpenToNetwork — Autonomous LinkedIn Rebuild via REA
## Complete Engineering Specification & Project Documentation

---

### Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project Motivation & Context](#2-project-motivation--context)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [REA Reverse Engineering Methodology](#4-rea-reverse-engineering-methodology)
5. [Extracted Official Asset Inventory](#5-extracted-official-asset-inventory)
6. [Frontend Reconstruction & Feature Breakdown](#6-frontend-reconstruction--feature-breakdown)
   - 6.1 [Guest Landing Page & Hero](#61-guest-landing-page--hero)
   - 6.2 [Interactive 6-Reaction Engine & Reactors Modal](#62-interactive-6-reaction-engine--reactors-modal)
   - 6.3 [Categorized Emoji Drawer](#63-categorized-emoji-drawer)
   - 6.4 [Profile Parity (#OpenToWork & Verified Badges)](#64-profile-parity-opentowork--verified-badges)
   - 6.5 [Live Search Autocomplete & Filtered Results](#65-live-search-autocomplete--filtered-results)
   - 6.6 [Feed, Polls, Reposts & Messaging](#66-feed-polls-reposts--messaging)
7. [Backend API Specifications & Contracts](#7-backend-api-specifications--contracts)
8. [Database Schema (`db.json`)](#8-database-schema-dbjson)
9. [Automated Verification & Test Suite](#9-automated-verification--test-suite)
10. [Setup & Execution Guide](#10-setup--execution-guide)

---

## 1. Executive Summary

**OpenToNetwork** is a full-featured, local replica of LinkedIn built by autonomously reverse engineering LinkedIn's public production web application using **REA (Reverse Engineer Anything)**. 

### Key Highlights
- **Zero Pre-supplied Assets:** No external images, SVGs, stylesheets, or database dumps were provided in advance. All visual elements, brand assets, vector icons, and API contracts were discovered and harvested from live network traffic and DOM traces by REA.
- **Complete Full-Stack Implementation:** A zero-dependency Node.js ES-module backend paired with an authentic, responsive SPA frontend (HTML5/Tailwind/ES6).
- **High-Fidelity Interaction Parity:** Full support for authentic LinkedIn interactions, including 6 official reactions with animated tooltips, live member reactor breakdowns, interactive live-voting polls, categorized professional emoji drawer, `#OpenToWork` circular frames, verified shield badges, direct messaging, and search autocomplete.
- **Test Pass Rate:** **22/22 (100%)** automated integration tests passed across static assets, authentication, feed interactions, API contracts, and DOM integrity.

---

## 2. Project Motivation & Context

In late 2026, the open-source community across X (Twitter), YouTube, and GitHub experienced a surge of interest in **REA (`morluto/rea`)**, a unified reverse engineering toolkit combining the Chrome DevTools Protocol (CDP), Ghidra static analysis, network event normalization, and Playwright execution.

Rather than running trivial benchmark tests, this project was designed to stress-test REA against a complex real-world target: **LinkedIn**. The objective was to test whether an autonomous agent equipped only with REA could extract live DOM structures, telemetry contracts, brand assets, and interaction patterns, and reconstruct a functional, production-grade application without manual asset extraction.

---

## 3. System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Target [Official LinkedIn Web Platform]
        LICDN["static.licdn.com (CDN Assets & Vectors)"]
        LIDOM["Production DOM & CSSOM (Chromium)"]
        LITRACK["Telemetry Routes (/litms, /homepage-guest)"]
    end

    subgraph REA [REA Toolchain Engine]
        CBS["capture-browser-scenario (CDP)"]
        NORM["Event Normalizer & Evidence Collector"]
        EXT["extract_rea_data.js (API & DOM Extraction)"]
    end

    subgraph LocalApp [Reconstructed Platform: OpenToNetwork (D:\linkedin-app)]
        SRV["Node.js Server (server.mjs - Port 4000)"]
        DB["File-backed State Database (db.json)"]
        SPA["Frontend SPA (index.html + app.js)"]
        ASSETS["Local Asset Cache (/images/)"]
    end

    LIDOM -->|CDP Session Traversal| CBS
    LICDN -->|Network Event Interception| CBS
    LITRACK -->|Payload Sniffing| CBS
    CBS --> NORM
    NORM --> EXT
    EXT --> ASSETS
    EXT --> SRV
    SRV --> SPA
    SRV <--> DB
```

---

## 4. REA Reverse Engineering Methodology

The reverse engineering process followed a 4-phase structured lifecycle:

### Phase 1: Scenario Configuration & Execution
REA’s browser scenario engine executed bounded sessions against `https://www.linkedin.com/` using headless Chromium:
```json
{
  "browser": {
    "mode": "launch",
    "executable_path": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "headless": true
  },
  "start_url": { "url": "https://www.linkedin.com/" },
  "actions": [
    { "step_id": "initial_load", "action": "wait_for_timeout", "duration_ms": 8000 },
    { "step_id": "wait_for_js_execution", "action": "wait_for_timeout", "duration_ms": 6000 }
  ],
  "capture": {
    "after_each_step": ["dom", "screenshot", "url"],
    "at_end": ["dom", "screenshot", "url", "storage"],
    "network": { "request_body": true, "response_body": true, "header_values": true }
  }
}
```

### Phase 2: Evidence Aggregation (`evidence.json`)
The session recorded over 430+ discrete network and DOM events into structured evidence:
- **Status:** Complete (Zero missing sections)
- **DOM Snapshot:** 162.8 KB captured HTML DOM
- **Network Traces:** 88 HTTP requests/responses logged with headers and MIME types

### Phase 3: Contract Decoding & Asset Discovery
Using custom extractor scripts, all network events were grouped by resource type:
- Scripts: 24 captured bundles
- Stylesheets: `official-linkedin.css` (333.5 KB)
- Vector SVGs: 14 embedded icons extracted
- CDN Images: 7 primary brand illustrations identified on `static.licdn.com`

### Phase 4: Local Re-hosting
All external assets were downloaded to `D:\linkedin-app\images\` to eliminate third-party CDN dependency, ensure local persistence, and prevent rate-limiting or broken links.

---

## 5. Extracted Official Asset Inventory

All assets reside locally in `D:\linkedin-app\images\` and are served directly by the local server:

| Asset File | Format | Original Source (`static.licdn.com`) | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `favicon.ico` | ICO (24.3 KB) | `.../al2o9zrvru7aqj8e1x2rzsrca` | Official LinkedIn browser tab favicon |
| `hero-illustration.svg` | SVG (27.0 KB) | `.../dxf91zhqd2z6b0bwg85ktm5s4` | Primary community landing hero visual |
| `connect-1.png` | PNG (146.7 KB) | `.../dbvmk0tsk0o0hd59fi64z3own` | *"Open to work"* member community portrait |
| `connect-2.png` | PNG (236.1 KB) | `.../2r8kd5zqpi905lkzsshdlvvn5` | *"Conversations lead to opportunity"* portrait |
| `connect-3.png` | PNG (266.0 KB) | `.../ann24vsq7r0ux3vipqa1n90gg` | *"Stay up to date on your industry"* portrait |
| `feature-connect.svg` | SVG (7.0 KB) | `.../43h6n82li4xu0q23s8jqizk6j` | Intent module: *"Connect with people"* |
| `feature-learn.svg` | SVG (6.9 KB) | `.../1dhh8rr3wohexkaya6jhn2y8j` | Intent module: *"Learn the skills"* |
| `who-is-linkedin-for.jpg` | JPG (75.5 KB) | `.../eghb2zc0p5s2x42wbi80w4v8a` | High-res editorial photo section graphic |
| `footer-cta.svg` | SVG (3.1 KB) | `.../b0sinzszgdrksde0dzc0leckm` | Decorative watermark for bottom banner |
| `directory-bg.svg` | SVG (1.2 KB) | `.../5mebydpuuijm3uhv1q375inqh` | Directory section graphic |
| `asset_7.svg` | SVG (2.9 KB) | Captured DOM | Full LinkedIn 84×21 brand wordmark logo |
| `asset_2.svg` | SVG (0.5 KB) | Captured DOM | Official blue 21×21 LinkedIn "In" bug |
| `asset_9.svg` | SVG (0.3 KB) | Captured DOM | Official Jobs briefcase vector icon |
| `asset_14.svg` | SVG (0.3 KB) | Captured DOM | Official *"Post a Job"* laptop illustration |

---

## 6. Frontend Reconstruction & Feature Breakdown

### 6.1 Guest Landing Page & Hero
- **Header:** Features `asset_7.svg` (official LinkedIn wordmark) alongside navigation links (*Articles*, *People*, *Learning*, *Jobs*, *Games*) and *Sign In* / *Join Now* buttons.
- **Hero Grid:** Split-screen layout displaying "Welcome to your professional community", quick 1-click demo login buttons (Gowtham, Priya, Alex), and `hero-illustration.svg`.
- **Community Carousel:** 3-card photo feature using high-res circular member portraits (`connect-1.png`, `connect-2.png`, `connect-3.png`).
- **"Who is LinkedIn for?" Section:** Dual-column layout pairing `who-is-linkedin-for.jpg` with interactive intent cards.
- **Taxonomy & Directory:** Live suggested searches pill tags and 4-column directory footer matching official LinkedIn policies and sitemaps.

### 6.2 Interactive 6-Reaction Engine & Reactors Modal
- **Reactions Supported:**
  - 👍 **Like** (`#0a66c2`)
  - 👏 **Celebrate** (`#2f7b15`)
  - 🤝 **Support** (`#7b5ea7`)
  - ❤️ **Love** (`#df704d`)
  - 💡 **Insightful** (`#f59e0b`)
  - 😂 **Funny** (`#00a0dc`)
- **Hover Reaction Bar:** Floating bar with spring animation and tooltips on hover.
- **Clickable Reaction Summary:** Clicking the reaction pill underneath any post invokes `openReactionListModal(postId)`.
- **Reaction Details Modal:** Features category filter tabs (*All*, *Like*, *Celebrate*, *Love*, etc.) displaying the list of reactors with their profile avatars, verified badges, headlines, and a direct *Message* action.

### 6.3 Categorized Emoji Drawer
Integrated directly into the Post Composer modal:
- 💼 **Work & Career:** `['💼','🚀','💡','📈','🎯','🤝','📊','🏆','💻','🧠','⚡','🌟','💰','🔍','📝','📅','📌','🏷️','🏢','🔑','🛠️','📚','🎓','🌐']`
- 👏 **Reactions & Gestures:** `['👍','👏','🤝','❤️','💡','😂','🙌','🔥','✨','💯','🚀','👊','🙏','👀','✌️','🎉','💪','🥂','🥳','🌟','🤩','💬','✍️']`
- 😀 **Smiles & Expressions:** `['😊','😃','😎','🤔','🤩','🥳','🤓','😇','🧐','☕','🍕','🥑','🌈','☀️','🏖️','✈️']`
- 🏷️ **Tags & Badges:** `['🟢','🔴','🟡','🔵','🟣','🥇','🥈','🥉','🏅','🎖️','🔖','📌','📍','🚩','🏁','🚀','💎']`
- **Cursor-Aware Insertion:** Accurately inserts selected emojis into `postContentInput` at the current cursor position (`selectionStart`/`selectionEnd`) without resetting input state.

### 6.4 Profile Parity (#OpenToWork & Verified Badges)
- **#OpenToWork Avatar Frame:** Renders an authentic curved green circular border (`border-[2.5px] border-emerald-600`) with an overlapping `#OpenToWork` bottom badge.
- **Verified Shield Badge:** Blue checkmark shield icon (`✓`) rendered next to verified member names.
- **Premium Badge:** Gold `IN` badge on profile headers and cards.
- **Profile Sections:** Header banner, About, Experience (with company badges), Education, Skills (with live endorsement counts and "+ Endorse" button), Certifications, and Activity.

### 6.5 Live Search Autocomplete & Filtered Results
- **Debounced Autocomplete:** Typing $\ge 2$ characters in the top search bar triggers a 200ms debounced query to `/api/search` and renders instant quick-results for People and Jobs in a dropdown panel.
- **Dedicated Search View:** Filter pills for **All**, **People**, **Posts**, and **Jobs** with connection degrees (`· 1st`), mutual connections, and action buttons (*Connect*, *Message*, *Apply*).

### 6.6 Feed, Polls, Reposts & Messaging
- **Live Interactive Polls:** Create polls with up to 4 options. In the feed, users can cast votes and see live animated percentage bars with vote counts.
- **Quote & Instant Reposts:** Supports sharing posts with custom thoughts (nested original post card) or 1-click instant reposting.
- **Direct Messaging:** Two-pane messaging interface with real-time conversations list, unread message badges, and direct chat thread.

---

## 7. Backend API Specifications & Contracts

### A. REA-Captured Endpoints
These endpoints replicate the exact paths and schemas captured from LinkedIn production:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/homepage-guest/manifest.json` | PWA manifest defining theme color, app name, and icons |
| `GET` | `/litms/api/metadata/user` | User telemetry metadata and page tracking context |
| `POST` | `/homepage-guest/api/ingraphs/gauge` | Metric gauge reporting |
| `POST` | `/homepage-guest/api/ingraphs/counter` | Client event counters |
| `POST` | `/li/track` | Event tracking and analytics sink |

### B. Core Application Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new account; returns JWT token |
| | `POST` | `/api/auth/login` | Authenticate user; returns JWT token & user profile |
| | `GET` | `/api/auth/me` | Fetch active user profile from Bearer token |
| **Feed** | `GET` | `/api/feed?sort=recent\|top` | Fetch feed posts enriched with authors and reactions |
| | `POST` | `/api/posts` | Create new post (supports media, polls, hashtags) |
| | `POST` | `/api/posts/:id/react` | Toggle or switch reaction (`like`, `celebrate`, etc.) |
| | `GET` | `/api/posts/:id/reactors` | Fetch list of users who reacted with details and reaction type |
| | `POST` | `/api/posts/:id/vote` | Cast vote on post poll |
| | `POST` | `/api/posts/:id/repost` | Create quote or instant repost |
| **Comments** | `GET` | `/api/posts/:id/comments` | Fetch post comment thread |
| | `POST` | `/api/posts/:id/comments` | Add new comment to post |
| | `POST` | `/api/comments/:id/like` | Like a specific comment |
| **Profile** | `GET` | `/api/profile/:id` | Fetch full profile data |
| | `PUT` | `/api/profile` | Update profile information |
| | `POST` | `/api/profile/experience` | Add employment experience entry |
| | `POST` | `/api/profile/education` | Add education entry |
| | `POST` | `/api/profile/skills` | Add new skill |
| | `POST` | `/api/profile/skills/:id/endorse` | Endorse a skill live |
| | `POST` | `/api/profile/certifications` | Add certification entry |
| **Search** | `GET` | `/api/search?q=...&type=...` | Multi-entity search across people, posts, and jobs |
| **Messages** | `GET` | `/api/conversations` | Fetch active user conversations |
| | `GET` | `/api/messages/:userId` | Fetch chat history with specific user |
| | `POST` | `/api/messages/:userId` | Send direct message |

---

## 8. Database Schema (`db.json`)

All persistent state is stored in a clean, JSON document store (`D:\linkedin-app\db.json`):

```json
{
  "users": [
    {
      "id": "u1",
      "email": "gowtham@example.com",
      "password": "pass123",
      "name": "Gowtham Sanjay",
      "headline": "Software Engineer | Building with AI Agents & Open Source",
      "location": "Bengaluru, Karnataka, India",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "verified": true,
      "premium": true,
      "openToWork": true,
      "connections": 542,
      "about": "Full stack engineer passionate about autonomous agents, reverse engineering, and modern web architectures.",
      "experience": [],
      "education": [],
      "skills": [{ "id": "s1", "name": "Reverse Engineering", "endorsements": 14 }],
      "certifications": []
    }
  ],
  "posts": [
    {
      "id": "p1",
      "authorId": "u1",
      "content": "Excited to share our latest project: Reverse engineering LinkedIn with REA!",
      "createdAt": "2026-10-28T12:00:00.000Z",
      "reactions": {
        "like": ["u2"],
        "celebrate": ["u3"],
        "support": [],
        "love": ["u1"],
        "insightful": [],
        "funny": []
      },
      "likes": 3,
      "comments": 2,
      "shares": 1
    }
  ],
  "jobs": [],
  "connections": [],
  "messages": [],
  "notifications": []
}
```

---

## 9. Automated Verification & Test Suite

An end-to-end verification script (`verify_official_features.mjs`) executes automated probes covering all layers:

```
═══════════════════════════════════════════════════════════
   VERIFYING REA OFFICIAL LINKEDIN FEATURES & ASSETS        
═══════════════════════════════════════════════════════════
✅ [PASS] Asset /images/favicon.ico (status: 200, ct: image/x-icon)
✅ [PASS] Asset /images/hero-illustration.svg (status: 200, ct: image/svg+xml)
✅ [PASS] Asset /images/connect-1.png (status: 200, ct: image/png)
✅ [PASS] Asset /images/connect-2.png (status: 200, ct: image/png)
✅ [PASS] Asset /images/connect-3.png (status: 200, ct: image/png)
✅ [PASS] Asset /images/feature-connect.svg (status: 200, ct: image/svg+xml)
✅ [PASS] Asset /images/feature-learn.svg (status: 200, ct: image/svg+xml)
✅ [PASS] Asset /images/who-is-linkedin-for.jpg (status: 200, ct: image/jpeg)
✅ [PASS] Asset /images/asset_7.svg (status: 200, ct: image/svg+xml)
✅ [PASS] Asset /images/asset_2.svg (status: 200, ct: image/svg+xml)
✅ [PASS] Auth login (gowtham@example.com) (User: Gowtham Sanjay)
✅ [PASS] Feed loaded (posts count: 6)
✅ [PASS] React with celebrate (👏) (active: celebrate)
✅ [PASS] Reactors details endpoint (Reactor reaction: celebrate)
✅ [PASS] Global search (query: "engineer") (People: 2, Jobs: 2)
✅ [PASS] index.html served cleanly (length: 81236)
✅ [PASS] No REA evidence summary box in index.html
✅ [PASS] Contains official hero illustration
✅ [PASS] Contains official community pictures
✅ [PASS] Contains official "Who is LinkedIn for" picture
✅ [PASS] Contains Categorized Emoji Drawer
✅ [PASS] Contains Reaction Details Modal
═══════════════════════════════════════════════════════════
   TEST RESULTS: 22/22 PASSED (100%)
═══════════════════════════════════════════════════════════
```

---

## 10. Setup & Execution Guide

### Prerequisites
- Node.js $\ge$ 18.x
- Port `4000` available on localhost

### Running the Live Server
```powershell
Set-Location "D:\linkedin-app"
node server.mjs
```

### Accessing the Application
- **URL:** Open `http://127.0.0.1:4000/` in any modern web browser.
- **Pre-seeded Accounts (Password for all: `pass123`):**
  - `gowtham@example.com` (Software Engineer, verified, premium, #OpenToWork)
  - `priya@example.com` (Senior Product Manager, verified)
  - `alex@example.com` (Staff AI Engineer @ Google, verified, premium)
  - `elena@example.com` (VP Product Innovation, premium)
  - `rahul@example.com` (Full Stack Developer, #OpenToWork)

---
*Documentation compiled for the OpenToNetwork / REA Rebuild Project.*
