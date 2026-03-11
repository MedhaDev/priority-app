# Priority Matrix — Personal Productivity Tracker

A personal time management tool built to collect behavioral data on how I prioritize and complete tasks over time.

**Live app:** https://statuesque-blancmange-e427de.netlify.app

---

## What it does

Tasks are categorized using the Eisenhower Matrix — a framework for sorting work by urgency and importance:

| Quadrant | Meaning |
|---|---|
| **Do First** | Urgent + Important |
| **Schedule** | Not Urgent + Important |
| **Delegate** | Urgent + Not Important |
| **Eliminate** | Not Urgent + Not Important |

Features include subtask breakdowns, drag-and-drop between quadrants, a 25-minute Pomodoro focus timer, and full data export to CSV.

---

## Why I built it

This is a data collection instrument as much as a productivity app. I wanted to study my own working habits — when I focus, how long tasks actually take, which quadrant I spend the most time in, and whether focus sessions correlate with task completion.

After using it daily for several weeks, I'll run a Python/pandas analysis on the exported data.

---

## Data schema

Every task and focus session is stored in the browser's localStorage and exportable to CSV at any time.

**Tasks export** (`priority-matrix-tasks-YYYY-MM-DD.csv`):

| Field | Description |
|---|---|
| id | Unique task ID |
| task | Task text |
| quadrant | do / schedule / delegate / eliminate |
| done | true / false |
| created_at | ISO timestamp when task was added |
| completed_at | ISO timestamp when task was checked off |
| subtasks_total | Number of subtasks |
| subtasks_done | Number of completed subtasks |
| focus_sessions | Number of Pomodoro sessions on this task |
| total_focus_mins | Total minutes spent in focus mode |

**Sessions export** (`priority-matrix-sessions-YYYY-MM-DD.csv`):

| Field | Description |
|---|---|
| task_id | Links to task |
| task | Task text |
| quadrant | Which quadrant at time of session |
| started_at | Session start timestamp |
| ended_at | Session end timestamp |
| duration_mins | Actual minutes worked |
| completed | Whether full 25 mins was finished |

---

## Tech stack

- React + Vite
- localStorage for persistence
- Deployed on Netlify via GitHub

---

## Roadmap

- [x] Eisenhower Matrix with drag and drop
- [x] Subtasks with progress tracking
- [x] Pomodoro focus timer
- [x] localStorage persistence
- [x] Created/completed timestamps
- [x] CSV export (tasks + sessions)
- [ ] Python/pandas behavioral analysis
- [ ] In-app analytics dashboard
