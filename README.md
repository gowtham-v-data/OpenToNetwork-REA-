# OpenToNetwork-REA-

> **Full-Stack LinkedIn web application rebuilt autonomously using REA (Reverse Engineer Anything) with zero pre-supplied assets.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 22/22 Passing](https://img.shields.io/badge/Tests-22%2F22%20Passing-brightgreen.svg)]()
[![Reverse Engineered with REA](https://img.shields.io/badge/Reverse%20Engineered-REA%20v6.8-blueviolet.svg)](https://github.com/morluto/rea)

---

## 📖 Overview

**OpenToNetwork** is a locally hosted, production-grade reconstruction of LinkedIn's core web platform. 

Instead of writing frontend code from scratch or manually copying assets, this entire project was built by tasking an autonomous AI agent to reverse engineer LinkedIn using the open-source **[REA (Reverse Engineer Anything)](https://github.com/morluto/rea)** engine.

### ⚡ The "Zero-Asset" Experiment
- **No pre-supplied images, SVGs, or styles:** All icons, branding wordmarks, reaction vectors, and illustrations were discovered and extracted from live network traces (`static.licdn.com`) and DOM snapshots captured by REA.
- **Real Telemetry & API Contracts:** Replicates real LinkedIn routes including `/homepage-guest/manifest.json`, `/litms/api/metadata/user`, and `/li/track`.
- **Pure Vector & High-Res Imagery:** Contains official LinkedIn SVGs (`asset_7.svg` wordmark, `asset_2.svg` In-bug), high-res community photos, and hero illustrations.

---

## ✨ Key Features

### 1. 🎨 Authentic Landing Page & Layout Parity
- **Official Brand Navigation:** Real LinkedIn wordmark and bug logos with authentic typography.
- **Hero Section:** Official `hero-illustration.svg` paired with quick 1-click demo login buttons.
- **Community Carousel:** High-res member photo cards (*"Open to work"*, *"Conversations lead to opportunity"*, *"Stay updated"*).
- **"Who is LinkedIn for?" Section:** Dual-column layout featuring high-res editorial photography and interactive intent modules.
- **Browse Directory & Footer:** Real LinkedIn corporate policies, directory taxonomy, and footer decals.

### 2. 👍 6 Official LinkedIn Reactions & Details Modal
- Full support for all 6 official reactions:
  - 👍 **Like** (`#0a66c2`)
  - 👏 **Celebrate** (`#2f7b15`)
  - 🤝 **Support** (`#7b5ea7`)
  - ❤️ **Love** (`#df704d`)
  - 💡 **Insightful** (`#f59e0b`)
  - 😂 **Funny** (`#00a0dc`)
- **Interactive Hover Bar:** Smooth spring popup animations with tooltips.
- **Reaction Breakdown Modal:** Clicking any post's reaction counter opens a categorized modal showing every member who reacted, their chosen emoji, verified badge, and headline. Powered by `GET /api/posts/:id/reactors`.

### 3. 😊 Categorized Professional Emoji Drawer
- Built directly into the Post Composer modal with 4 categories:
  - 💼 **Work & Career:** `💼, 🚀, 💡, 📈, 🎯, 🤝, 📊, 🏆, 💻, 🧠, ⚡, 🌟...`
  - 👏 **Reactions & Gestures:** `👍, 👏, 🤝, ❤️, 💡, 😂, 🙌, 🔥, ✨, 💯, 🚀...`
  - 😀 **Smiles & Expressions:** `😊, 😃, 😎, 🤔, 🤩, 🥳, 🤓, 😇, 🧐, ☕...`
  - 🏷️ **Tags & Badges:** `🟢, 🔴, 🟡, 🔵, 🟣, 🥇, 🥈, 🥉, 🏅, 🔖, 📌...`
- **Cursor-Aware Insertion:** Inserts emojis at the exact cursor position without losing focus.

### 4. 👤 Profile Parity (#OpenToWork & Badges)
- **#OpenToWork Avatar Frame:** Authentic circular green border with an overlapping `#OpenToWork` bottom badge.
- **Verified Shield Badge:** Blue checkmark icon (`✓`) for verified members.
- **Premium Badge:** Gold `IN` badge on profile cards.
- **Skills Endorsements:** Connections can click **"+ Endorse"** to increment endorsement counts live.
- **Full Profile Sections:** Experience, Education, Licenses & Certifications, Languages, and Activity.

### 5. 🔍 Real-Time Search with Autocomplete
- **Debounced Autocomplete:** Typing $\ge 2$ characters displays instant quick-results for People and Jobs.
- **Multi-Tab Search Results:** Full search results view with filter tabs for **All**, **People**, **Posts**, and **Jobs**.

### 6. 📰 Rich Feed, Live Polls & Reposting
- **Interactive Polls:** Create polls with up to 4 options and cast live votes with animated percentage bars.
- **Quote & Instant Reposts:** Repost with thoughts (nested card) or 1-click instant repost.
- **Direct Messaging:** Two-pane instant messaging system with active conversation threads.

---

## 🛠️ Architecture & Tech Stack

```
├── app.js               # Frontend state, DOM interactions, emoji picker, modals
├── index.html           # Single Page Application (Tailwind CSS, clean UI)
├── server.mjs           # Node.js backend (REST API, JWT auth, REA contracts)
├── db.json              # Persistent JSON document database
├── images/              # Extracted official LinkedIn SVGs, PNGs, and Favicon
├── rea-scenarios/       # REA browser scenarios & extraction scripts
└── PROJECT_DOCUMENTATION.md # Comprehensive engineering specification
```

- **Backend:** Node.js (ES Modules, HTTP native, zero heavy dependencies)
- **Frontend:** Vanilla ES6+, Tailwind CSS, SVG vectors
- **Reverse Engineering Engine:** [REA (Reverse Engineer Anything)](https://github.com/morluto/rea) via Chrome DevTools Protocol & Playwright

---

## 🚀 Quickstart Guide

### 1. Clone the repository
```bash
git clone https://github.com/gowtham-v-data/OpenToNetwork-REA-.git
cd OpenToNetwork-REA-
```

### 2. Install dependencies (Optional / Minimal)
```bash
npm install
```

### 3. Start the application
```bash
node server.mjs
```

### 4. Open in your browser
Navigate to:
```
http://127.0.0.1:4000/
```

---

## 🔑 Demo Accounts

The database comes pre-seeded with realistic professional profiles (Password for all: `pass123`):

| Email | Name | Role / Badges |
| :--- | :--- | :--- |
| `gowtham@example.com` | Gowtham Sanjay | Software Engineer (Verified, Premium, #OpenToWork) |
| `priya@example.com` | Priya Sharma | Senior Product Manager (Verified) |
| `alex@example.com` | Alex Chen | Staff AI Engineer @ Google (Verified, Premium) |
| `elena@example.com` | Elena Rostova | VP Product Innovation (Premium) |
| `rahul@example.com` | Rahul Verma | Full Stack Developer (#OpenToWork) |

*(You can also use the 1-click login buttons on the landing page!)*

---

## 📄 Documentation

For full architectural details, methodology, and API contract specifications, refer to [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

---

## ⚖️ License & Disclaimer

This project is built for educational, research, and reverse-engineering demonstration purposes using the [REA toolkit](https://github.com/morluto/rea). All brand trademarks and logos belong to LinkedIn Corporation.
