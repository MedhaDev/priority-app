# Priority Matrix

A personal productivity tracking app built to collect and analyze behavioral data on how I prioritize and complete tasks over time.

**Live app:** https://task-priority-tracker.netlify.app

---

## What it does

Tasks are organized using the Eisenhower Matrix - a framework for sorting work by urgency and importance:

| Quadrant | Meaning |
|---|---|
| **Do First** | Urgent + Important |
| **Schedule** | Not Urgent + Important |
| **Delegate** | Urgent + Not Important |
| **Eliminate** | Not Urgent + Not Important |

Features include subtask breakdowns with auto-completion, drag-and-drop reordering across quadrants, a 25-minute Pomodoro focus timer, inline task editing, daily date navigation with carry-forward, and real-time sync to Supabase.

---

## Why I built it

This is a data collection instrument as much as a productivity app. I designed the schema, built the collection tool, and wired it to a real database — then used the data to build an analytics dashboard in Power BI.

The goal was to study my own working habits: when I focus, how long tasks actually take, which quadrant I spend the most time in, and whether focus sessions correlate with task completion.

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Hosting | Netlify |
| Database | Supabase (PostgreSQL) |
| BI / Visualization | Power BI |

---

## Data pipeline

```
React App  →  Supabase (PostgreSQL)  →  Power BI Dashboard
 (writes)        (stores)                 (visualizes)
```

Every task creation, completion, edit, and focus session is written to Supabase in real time. Power BI connects directly via the PostgreSQL connector and refreshes on demand.

---

## Data schema

**Tasks table**

| Field | Description |
|---|---|
| id | Unique task ID |
| text | Task description |
| quadrant | do / schedule / delegate / eliminate |
| date | Date the task was created for |
| done | Completion status |
| created_at | Timestamp when task was added |
| completed_at | Timestamp when task was checked off |
| subtasks | JSON array of subtasks |
| focus_sessions | Number of Pomodoro sessions |
| total_focus_mins | Total minutes spent in focus mode |

**Sessions table**

| Field | Description |
|---|---|
| task_id | Links to parent task |
| quadrant | Quadrant at time of session |
| started_at | Session start timestamp |
| ended_at | Session end timestamp |
| duration_mins | Actual minutes worked |
| completed | Whether full 25 mins was finished |

---

## Synthetic data

To demonstrate the full pipeline before accumulating sufficient real data, I generated 90 days of realistic synthetic task data using a custom Python script (`generate_synthetic_data.py`). The script models realistic behavioral patterns including day-of-week completion rates, quadrant distributions, crunch weeks, and focus session frequency.

---

## Roadmap

- [x] Eisenhower Matrix with drag and drop
- [x] Subtasks with auto-completion
- [x] Pomodoro focus timer with session logging
- [x] Inline task editing
- [x] Daily date navigation with carry-forward modal
- [x] Real-time Supabase sync
- [x] Synthetic data generation (90 days)
- [x] Power BI dashboard
- [ ] Row Level Security (Supabase RLS)
- [ ] Python behavioral analysis notebook
