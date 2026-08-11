# DailyFlow

> **FLOW. FOCUS. FINISH.**

DailyFlow is a personal productivity and daily planning desktop application built with Electron, React, TypeScript, and SQLite. It combines task scheduling, focus timing, habit engagement tracking, and productivity analytics into a unified environment.

---

## 🎯 Value Proposition

DailyFlow is designed for high-focus daily workflows. Rather than acting as a generic todo list, DailyFlow structures your day around a single primary focus, provides environment background atmospheres to maintain deep focus, tracks streaks and leveling engagement, and generates deterministic productivity analytics—all stored locally on your device with complete privacy.

---

## ✨ Features

### Daily Planning
- **Task Management**: Create, edit, reschedule, complete, and delete tasks with instant persistence.
- **Date Navigation**: Seamlessly navigate between past, current, and future dates.
- **Time Scheduling**: Assign exact 24-hour or 12-hour AM/PM times to tasks or keep them all-day unscheduled.
- **Categorized Workspaces**: Dedicated views for **Today**, **Upcoming** (next 7 days), and **Overdue** tasks requiring recovery.
- **Primary Focus**: Pin a single critical task as your North Star focus item for the day.

### Focus & Daily Experience
- **Daily Briefing**: Contextual morning orientation summarizing your schedule, top priority, and daily goal.
- **Focus Mode (Sanctuary)**: Distraction-free Pomodoro timer with breathing pulse visualizer and target session durations (15m, 25m, 45m, 60m).
- **Session Logging**: Automatically log focus time against specific tasks or general deep work sessions.
- **Daily Reflection & Summary**: End-of-day review to document achievements and reflect on energy levels.
- **Completion Celebrations**: Satisfying perfect-day milestone celebrations upon completing all scheduled tasks.

### Engagement & Gamification
- **XP System**: Earn experience points for creating tasks (+5 XP), completing tasks (+15 XP), and finishing focus sessions.
- **Leveling**: Progress through levels with progress indicators.
- **Streak Tracking**: Maintain daily activity streaks with flame pulse indicators.
- **Achievements**: Unlock milestones for perfect days, focus sessions, and consistent completion.

### Productivity Analytics
- **Multi-Window Insights**: Inspect activity across **7-day**, **30-day**, and **monthly** timeframes.
- **KPI Metrics**: Track overall task completion rate, focus time, active streak, and total completed items.
- **Productivity Patterns**: Discover your most productive day of the week, peak focus hours, and on-time completion rates.
- **Deterministic Insights**: Automatically generated observations on completion momentum and scheduling habits.

### Environment & UX Architecture
- **Photographic Backgrounds**: Built-in environment slideshow featuring approved photographs across 5 themes (*Emerald Forest, Deep Ocean, Mountain Lake, Night Sky, Sunset Horizon*).
- **Theme-Aware Glass UI**: Translucent glassmorphism panels, dynamic theme glow accents, and backdrop blur.
- **Startup Animation**: ~1.75-second splash sequence featuring the DailyFlow logo mark and ambient atmosphere fade.
- **Micro-Interactions**: Tactile checkbox animations, floating XP toasts, and hover elevations.

---

## 🖥️ User Interface Overview

The DailyFlow interface consists of 6 primary view containers:

1. **Main Workspace**: Hero daily briefing, North Star primary focus card, quick-capture bar, and task timeline.
2. **Task Creation & TimePicker**: Task modal featuring dual text input (`9:30`, `2pm`) and HH:MM dropdown selectors.
3. **Focus Mode Sanctuary**: Centered circular timer countdown with breathing animation and quick controls.
4. **Productivity Analytics**: Performance dashboards, completion bar charts, and habit pattern insights.
5. **Atmosphere Selector**: Sidebar environment theme switcher with instant photographic background transitions.
6. **Daily Reflection & Celebration**: Milestone modal and end-of-day journal input.

---

## 🏗️ Architecture

DailyFlow follows a strict multi-process Electron architecture:

```
┌──────────────────────────────────────────────────────────┐
│                      React Renderer                      │
│            (UI Components, Theme Engine, State)          │
└────────────────────────────┬─────────────────────────────┘
                             │ (window.dailyflow API)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Preload Context Bridge                 │
│              (Isolated IPC Request Validation)           │
└────────────────────────────┬─────────────────────────────┘
                             │ (ipcRenderer.invoke)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Electron Main Process                  │
│              (IPC Handlers, App Lifecycle)               │
└────────────────────────────┬─────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐           ┌──────────────────────┐
│     Repositories     │           │ Notification Service │
│ (Tasks, Settings, XP)│           │ (System Tray Alerts) │
└───────────┬──────────┘           └──────────────────────┘
            │
            ▼
┌──────────────────────┐
│   SQLite Database    │
│  (better-sqlite3 WAL)│
└──────────────────────┘
```

The React renderer process has zero direct access to Node.js APIs or the file system. All renderer interactions are routed through strict, type-safe IPC channels validated in the preload bridge.

---

## 🔐 Security

DailyFlow enforces standard Electron security practices:

- `contextIsolation: true`: Prevents renderer scripts from accessing internal Electron/Node objects.
- `nodeIntegration: false`: Disables Node.js environment in the web page process.
- `sandbox: true`: Restricts OS-level system access for the renderer process.
- `webSecurity: true`: Enforces strict same-origin policy and web safety rules.

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 37
- **UI Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 & Vanilla CSS Glassmorphism
- **Database Engine**: SQLite (via `better-sqlite3` 13 with WAL mode)
- **Packaging**: Electron Builder 26 (Windows NSIS)
- **Testing**: Vitest 3

---

## 💾 Data Persistence

All application data—including tasks, schedule states, XP history, focus logs, daily reflections, and user preferences—is stored locally in an embedded SQLite database (`dailyflow.sqlite`). 

The database file resides inside Electron's standard `userData` directory on your system. Your data remains persistent across application restarts, system reboots, and application updates.

---

## 🚀 Installation

DailyFlow is available as a standalone Windows desktop application:

1. Download `DailyFlow Setup 0.1.0.exe` from the latest release artifacts.
2. Run the installer.
3. Launch **DailyFlow** directly from your Desktop or Start Menu.

> **Note**: The installed application is fully self-contained. It does **not** require Node.js, npm, or any terminal dependencies to run.

---

## 👨‍💻 Development

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/tushar-cr7/DailyFlow.git
cd DailyFlow

# Install dependencies
npm install

# Launch development environment
npm run dev
```

### Quality Assurance
```bash
# Run TypeScript type check across main, preload, renderer, and tests
npm run lint

# Run unit test suite
npm test

# Build production Vite and Electron bundles
npm run build
```

---

## 📦 Production Build

To build the standalone Windows application package:

```bash
# Build unpacked application directory (release/win-unpacked/)
npm run app:dir

# Build complete Windows NSIS setup installer (release/DailyFlow Setup 0.1.0.exe)
npm run app:dist
```

---

## 🧪 Testing State

DailyFlow maintains comprehensive test coverage verified via Vitest:

- **Test Suites**: 17 passed (17)
- **Tests**: 110 passed (110)
- **Coverage**: Core date utilities, task CRUD validation, settings schema, engagement/XP calculations, analytics aggregations, and SQLite database repository handlers.

---

## 📁 Project Structure

```
DailyFlow/
├── assets/                  # Brand logo, app icon (.ico/.png), environment AVIF backgrounds
├── src/
│   ├── main/                # Electron main process, IPC handlers, SQLite repositories, schema migrations
│   ├── preload/             # Context bridge API definitions and TypeScript interfaces
│   ├── renderer/            # React components, theme slideshow, custom hooks, and Tailwind CSS styles
│   └── shared/              # Shared TypeScript types, date utilities, and validation schemas
├── tests/                   # Vitest unit test suites
├── package.json             # Build configurations and dependency definitions
├── vite.config.ts           # Vite build pipeline and Electron integration config
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🗺️ Roadmap

Future development iterations will focus on:

- Expanded UI animation controls and customizable theme presets
- Keyboard navigation accessibility enhancements
- Windows system tray minimization and background quick-capture shortcuts

---

## 👤 Author

**DailyFlow** — [Tushar](https://github.com/tushar-cr7)
