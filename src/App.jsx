import { useState, useEffect, useRef, useCallback } from "react";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; font-family: 'DM Sans', sans-serif; color: #ccc; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
  input, textarea, button { font-family: 'DM Sans', sans-serif; }
  button { cursor: pointer; }
  .task-card { transition: background 0.15s; position: relative; }
  .task-card:hover { background: #ffffff0a !important; }
  .task-card:hover .drag-handle { opacity: 1; }
  .drag-handle { opacity: 0; transition: opacity 0.15s; cursor: grab; color: #666; font-size: 13px; padding: 0 3px; user-select: none; line-height: 1; }
  .drag-handle:active { cursor: grabbing; }
  .qdrop { transition: outline 0.1s; }
  .qdrop.drag-over { outline: 1px solid rgba(255,255,255,0.18) !important; }
  .drop-indicator { height: 2px; background: #FF4500; border-radius: 1px; margin: 2px 0; transition: opacity 0.1s; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
  .fadein { animation: fadeIn 0.18s ease forwards; }
  @keyframes confettiBurst {
    0%   { opacity: 1; transform: translate(0,0) scale(1); }
    100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
  }
  .confetti-piece { position: fixed; pointer-events: none; animation: confettiBurst 0.8s ease-out forwards; font-size: 18px; z-index: 9999; }
  .tag-btn {
    border-radius: 3px; padding: 5px 12px; font-size: 11px;
    border: 1px solid; transition: all 0.12s; letter-spacing: 0.8px;
    font-family: 'DM Sans', sans-serif; font-weight: 500; text-transform: uppercase;
  }
  input::placeholder { color: #666; }
  .edit-input {
    background: transparent; border: none; border-bottom: 1px solid #444;
    color: #ddd; font-size: 13px; font-family: 'DM Sans', sans-serif;
    outline: none; width: 100%; padding: 0;
  }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; }
  .modal-box { background: #0a0a0a; border: 1px solid #222; border-radius: 6px; padding: 40px 36px; max-width: 420px; width: 90%; text-align: center; }
`;

const QUADRANTS = [
  { id: "do",        label: "Do First",  sub: "Urgent · Important",         color: "#FF4500" },
  { id: "schedule",  label: "Schedule",  sub: "Not Urgent · Important",     color: "#C8A84B" },
  { id: "delegate",  label: "Delegate",  sub: "Urgent · Not Important",     color: "#6B9E8C" },
  { id: "eliminate", label: "Eliminate", sub: "Not Urgent · Not Important", color: "#666680" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const prevDay = (d) => { const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() - 1); return dt.toISOString().slice(0, 10); };
const nextDay = (d) => { const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() + 1); return dt.toISOString().slice(0, 10); };

// Fix ID collision: compute safe starting ID from saved tasks
function getSafeNextId(tasks) {
  if (!tasks.length) return 100;
  const maxId = Math.max(...tasks.flatMap(t => [t.id, ...t.subtasks.map(s => s.id)]));
  return maxId + 1;
}

let nextId = 100;

/* ── CONFETTI ────────────────────────────────────── */
function spawnConfetti(x, y) {
  const pieces = ["✦", "♥", "✿", "★", "◆", "✸"];
  const colors = ["#FF4500", "#C8A84B", "#6B9E8C", "#fff", "#FF8C69"];
  const container = document.getElementById("confetti-root");
  if (!container) return;
  for (let i = 0; i < 10; i++) {
    const el = document.createElement("span");
    el.className = "confetti-piece";
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    el.style.setProperty("--tx", Math.cos(angle) * dist + "px");
    el.style.setProperty("--ty", Math.sin(angle) * dist + "px");
    container.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

/* ── SUBTASKS ────────────────────────────────────── */
function SubTasks({ subtasks, setSubtasks, color }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState("");

  const submit = () => {
    if (!val.trim()) return;
    setSubtasks([...subtasks, { id: nextId++, text: val.trim(), done: false }]);
    setVal(""); setAdding(false);
  };

  return (
    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: `1px solid ${color}22` }}>
      {subtasks.map((st) => (
        <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <button
            onClick={() => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, done: !s.done } : s))}
            style={{ width: 11, height: 11, borderRadius: 2, border: `1px solid ${color}44`, background: st.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {st.done && <span style={{ color: "#000", fontSize: 7, fontWeight: 700 }}>✓</span>}
          </button>
          <span style={{ fontSize: 12, color: st.done ? "#444" : "#aaa", textDecoration: st.done ? "line-through" : "none", flex: 1 }}>{st.text}</span>
          <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} style={{ background: "none", border: "none", color: "#666", fontSize: 10, padding: "0 2px" }}>✕</button>
        </div>
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          <input autoFocus
            style={{ flex: 1, background: "#ffffff04", border: `1px solid ${color}22`, borderRadius: 3, color: "#bbb", padding: "5px 8px", fontSize: 12, outline: "none" }}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setVal(""); } }}
            placeholder="Subtask name…"/>
          <button onClick={submit} style={{ background: color, color: "#000", border: "none", borderRadius: 3, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>+</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ background: "none", border: "none", color: "#666", fontSize: 11, padding: "3px 0" }}>
          + subtask
        </button>
      )}
    </div>
  );
}

/* ── TASK CARD ───────────────────────────────────── */
function TaskCard({ task, color, onToggle, onDelete, onFocus, onUpdateSubtasks, onEdit, isDragOver, onDragStart, onDragOver, onDragEnd }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.text);
  const doneCount = task.subtasks.filter(s => s.done).length;

  const handleToggle = (e) => {
    if (!task.done) {
      const rect = e.currentTarget.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    onToggle();
  };

  const submitEdit = () => {
    if (editVal.trim()) onEdit(editVal.trim());
    setEditing(false);
  };

  return (
    <>
      {isDragOver && <div className="drop-indicator"/>}
      <div className="task-card fadein"
        id={`task-${task.id}`}
        style={{ background: "#ffffff04", borderRadius: 3, borderLeft: `2px solid ${color}`, opacity: task.done ? 0.3 : 1, overflow: "hidden" }}
        onDragOver={e => { e.preventDefault(); onDragOver(); }}
        onDrop={e => { e.stopPropagation(); }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px" }}>
          {/* Drag handle */}
          <span className="drag-handle" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>⠿</span>
          {/* Checkbox */}
          <button onClick={handleToggle}
            style={{ width: 13, height: 13, marginTop: 2, borderRadius: 2, border: `1px solid ${color}55`, background: task.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {task.done && <span style={{ color: "#000", fontSize: 8, fontWeight: 700 }}>✓</span>}
          </button>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {editing ? (
                <input autoFocus className="edit-input" value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onBlur={submitEdit}
                  onKeyDown={e => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") { setEditVal(task.text); setEditing(false); } }}/>
              ) : (
                <span
                  onDoubleClick={() => { setEditVal(task.text); setEditing(true); }}
                  title="Double-click to edit"
                  style={{ fontSize: 13, color: "#ddd", lineHeight: 1.4, textDecoration: task.done ? "line-through" : "none", flex: 1, wordBreak: "break-word", cursor: "text" }}>
                  {task.text}
                </span>
              )}
              {task.subtasks.length > 0 && (
                <span style={{ fontSize: 10, color: color + "cc", whiteSpace: "nowrap" }}>{doneCount}/{task.subtasks.length}</span>
              )}
            </div>
            {task.subtasks.length > 0 && (
              <div style={{ height: 1, background: "#ffffff08", borderRadius: 1, marginTop: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(doneCount / task.subtasks.length) * 100}%`, background: color, transition: "width 0.3s" }}/>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
              {task.created_at && (
                <span style={{ fontSize: 10, color: "#666" }}>
                  {new Date(task.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              {task.completed_at && (
                <span style={{ fontSize: 10, color: color + "cc" }}>
                  ✓ {new Date(task.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              {task.focus_sessions > 0 && (
                <span style={{ fontSize: 10, color: "#666" }}>◎ {task.focus_sessions}</span>
              )}
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
            <button onClick={() => setExpanded(e => !e)}
              style={{ background: "none", border: "none", color: "#888", fontSize: 12, padding: "1px 4px", lineHeight: 1 }}>
              {expanded ? "−" : "+"}
            </button>
            <button onClick={onFocus}
              style={{ background: "none", border: `1px solid ${color}33`, color: color + "dd", fontSize: 9, borderRadius: 2, padding: "2px 5px", letterSpacing: 0.4, textTransform: "uppercase" }}>
              focus
            </button>
            <button onClick={onDelete}
              style={{ background: "none", border: "none", fontSize: 10, color: "#888", padding: "1px 3px" }}>✕</button>
          </div>
        </div>
        {expanded && (
          <div style={{ padding: "0 10px 10px 32px" }}>
            <SubTasks subtasks={task.subtasks} setSubtasks={onUpdateSubtasks} color={color}/>
          </div>
        )}
      </div>
    </>
  );
}

/* ── ID MIGRATION: fix any duplicate IDs from old data ── */
function deduplicateIds(tasks) {
  let counter = Date.now(); // use timestamp base to guarantee uniqueness
  return tasks.map(t => ({
    ...t,
    id: counter++,
    subtasks: (t.subtasks || []).map(s => ({ ...s, id: counter++ })),
  }));
}

/* ── APP ─────────────────────────────────────────── */
export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("pm_tasks");
      const parsed = saved ? JSON.parse(saved) : [];
      let initial;
      if (parsed.length) {
        initial = deduplicateIds(parsed); // always re-assign IDs on load to nuke any collisions
      } else {
        initial = [
          { id: 1, text: "Reply to urgent client email", quadrant: "do",       done: false, subtasks: [{ id: 2, text: "Draft reply", done: false }], created_at: new Date().toISOString(), completed_at: null, date: todayStr() },
          { id: 4, text: "Plan next week's goals",       quadrant: "schedule", done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null, date: todayStr() },
          { id: 7, text: "Fix printer jam",              quadrant: "delegate", done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null, date: todayStr() },
          { id: 8, text: "Browse social media",          quadrant: "eliminate",done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null, date: todayStr() },
        ];
      }
      nextId = getSafeNextId(initial);
      return initial;
    } catch { return []; }
  });

  const [sessions, setSessions] = useState(() => {
    try { const s = localStorage.getItem("pm_sessions"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Date state
  const [currentDate, setCurrentDate] = useState(todayStr);
  const [newDayModal, setNewDayModal] = useState(null); // { prevDate, undoneCount }

  // Check if it's a new day on load
  useEffect(() => {
    const lastDate = localStorage.getItem("pm_last_date");
    const today = todayStr();
    if (lastDate && lastDate !== today) {
      const undone = tasks.filter(t => t.date === lastDate && !t.done);
      if (undone.length > 0) {
        setNewDayModal({ prevDate: lastDate, undoneCount: undone.length });
      }
    }
    localStorage.setItem("pm_last_date", today);
  }, []);

  const handleCarryOver = () => {
    const today = todayStr();
    setTasks(prev => prev.map(t =>
      !t.done && t.date !== today ? { ...t, date: today } : t
    ));
    setCurrentDate(today);
    setNewDayModal(null);
  };

  const handleStartFresh = () => {
    setCurrentDate(todayStr());
    setNewDayModal(null);
  };

  const [input, setInput] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState(null);
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState(null);       // for cross-quadrant drag
  const [dragOverId, setDragOverId] = useState(null); // for within-quadrant reorder
  const [dragOverQuadrant, setDragOverQuadrant] = useState(null);

  const iRef = useRef(null);
  const sessionStartRef = useRef(null);

  useEffect(() => { try { localStorage.setItem("pm_tasks", JSON.stringify(tasks)); } catch {} }, [tasks]);
  useEffect(() => { try { localStorage.setItem("pm_sessions", JSON.stringify(sessions)); } catch {} }, [sessions]);

  const updateTask = useCallback((id, fn) => setTasks(prev => prev.map(t => t.id === id ? fn(t) : t)), []);

  const logSession = useCallback((task, completed) => {
    if (!sessionStartRef.current) return;
    const mins = Math.round((Date.now() - sessionStartRef.current) / 60000 * 10) / 10;
    if (mins < 0.1) return;
    setSessions(prev => [...prev, {
      task_id: task.id, task_text: task.text, quadrant: task.quadrant,
      started_at: new Date(sessionStartRef.current).toISOString(),
      ended_at: new Date().toISOString(), duration_mins: mins, completed,
    }]);
    updateTask(task.id, t => ({
      ...t,
      focus_sessions: (t.focus_sessions || 0) + 1,
      total_focus_mins: Math.round(((t.total_focus_mins || 0) + mins) * 10) / 10,
    }));
    sessionStartRef.current = null;
  }, [updateTask]);

  useEffect(() => {
    if (running) {
      if (!sessionStartRef.current) sessionStartRef.current = Date.now();
      iRef.current = setInterval(() => setTimer(t => {
        if (t <= 1) { clearInterval(iRef.current); setRunning(false); if (focusTask) logSession(focusTask, true); return 0; }
        return t - 1;
      }), 1000);
    } else clearInterval(iRef.current);
    return () => clearInterval(iRef.current);
  }, [running]);

  const addTask = () => {
    if (!input.trim()) return;
    const q = urgent && important ? "do" : !urgent && important ? "schedule" : urgent && !important ? "delegate" : "eliminate";
    setTasks(prev => [...prev, { id: nextId++, text: input.trim(), quadrant: q, done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null, date: currentDate }]);
    setInput(""); setUrgent(false); setImportant(false);
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const viewTasks = tasks.filter(t => t.date === currentDate || !t.date);
  const topTask = viewTasks.find(t => t.quadrant === "do" && !t.done) || viewTasks.find(t => !t.done);
  const openFocus = task => { setFocusTask(task); setFocusMode(true); setTimer(25 * 60); setRunning(false); sessionStartRef.current = null; };
  const isToday = currentDate === todayStr();

  // Drag handlers
  const handleDragStart = (id) => {
    setDragId(id);
  };
  const handleDragEnd = () => {
    // If we have a dragOverId, reorder within quadrant
    if (dragId != null && dragOverId != null && dragId !== dragOverId) {
      setTasks(prev => {
        const dragTask = prev.find(t => t.id === dragId);
        const overTask = prev.find(t => t.id === dragOverId);
        if (!dragTask || !overTask) return prev;
        if (dragTask.quadrant === overTask.quadrant) {
          // Reorder within quadrant
          const qTasks = prev.filter(t => t.quadrant === dragTask.quadrant);
          const others = prev.filter(t => t.quadrant !== dragTask.quadrant);
          const fromIdx = qTasks.findIndex(t => t.id === dragId);
          const toIdx = qTasks.findIndex(t => t.id === dragOverId);
          const newQ = [...qTasks];
          newQ.splice(fromIdx, 1);
          newQ.splice(toIdx, 0, dragTask);
          return [...others, ...newQ];
        }
        return prev;
      });
    }
    setDragId(null);
    setDragOverId(null);
    setDragOverQuadrant(null);
  };

  const exportCSV = () => {
    const taskHeaders = ["id","task","quadrant","date","done","created_at","completed_at","subtasks_total","subtasks_done","focus_sessions","total_focus_mins"];
    const taskRows = tasks.map(t => [t.id, `"${t.text.replace(/"/g,'""')}"`, t.quadrant, t.date||"", t.done, t.created_at||"", t.completed_at||"", t.subtasks.length, t.subtasks.filter(s=>s.done).length, t.focus_sessions||0, t.total_focus_mins||0]);
    const taskCSV = [taskHeaders,...taskRows].map(r=>r.join(",")).join("\n");
    const sessHeaders = ["task_id","task","quadrant","started_at","ended_at","duration_mins","completed"];
    const sessRows = sessions.map(s => [s.task_id, `"${s.task_text.replace(/"/g,'""')}"`, s.quadrant, s.started_at, s.ended_at, s.duration_mins, s.completed]);
    const sessCSV = [sessHeaders,...sessRows].map(r=>r.join(",")).join("\n");
    const date = new Date().toISOString().slice(0,10);
    [["tasks",taskCSV],["sessions",sessCSV]].forEach(([name,csv]) => {
      const blob = new Blob([csv],{type:"text/csv"}); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download=`priority-matrix-${name}-${date}.csv`; a.click(); URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div id="confetti-root" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}/>

      {/* NEW DAY MODAL */}
      {newDayModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#FF4500", marginBottom: 16, textTransform: "uppercase" }}>New Day</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#fff", marginBottom: 12, fontWeight: 400 }}>
              Good morning.
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 32, lineHeight: 1.6 }}>
              You have <span style={{ color: "#ddd" }}>{newDayModal.undoneCount} unfinished task{newDayModal.undoneCount > 1 ? "s" : ""}</span> from {fmtDate(newDayModal.prevDate)}.<br/>What would you like to do?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={handleCarryOver}
                style={{ background: "#fff", color: "#000", border: "none", borderRadius: 3, padding: "10px 22px", fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>
                Carry over
              </button>
              <button onClick={handleStartFresh}
                style={{ background: "transparent", color: "#888", border: "1px solid #333", borderRadius: 3, padding: "10px 22px", fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase" }}>
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: "100vh", background: "#000", color: "#ccc", padding: "28px 24px 48px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1400, margin: "0 auto" }}>

        {/* FOCUS OVERLAY */}
        {focusMode && (
          <div style={{ position: "fixed", inset: 0, background: "#000000f5", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 6, padding: "44px 40px", textAlign: "center", maxWidth: 420, width: "90%" }}>
              <p style={{ fontSize: 10, letterSpacing: 4, color: "#FF4500", marginBottom: 20, fontWeight: 500, textTransform: "uppercase" }}>Focus Session</p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#ddd", marginBottom: 28, lineHeight: 1.5 }}>{focusTask?.text || "—"}</p>
              {focusTask?.subtasks?.length > 0 && (
                <div style={{ marginBottom: 24, textAlign: "left", background: "#ffffff03", borderRadius: 3, padding: "10px 14px" }}>
                  {focusTask.subtasks.map(st => (
                    <div key={st.id} style={{ fontSize: 12, color: st.done ? "#333" : "#777", textDecoration: st.done ? "line-through" : "none", marginBottom: 5 }}>
                      {st.done ? "✓" : "○"} {st.text}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 80, color: "#fff", lineHeight: 1, marginBottom: 28, letterSpacing: 2 }}>{fmt(timer)}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
                <button onClick={() => { if (running && focusTask) logSession(focusTask, false); setRunning(r => !r); }}
                  style={{ background: running ? "#111" : "#FF4500", color: running ? "#555" : "#fff", border: `1px solid ${running ? "#1a1a1a" : "#FF4500"}`, borderRadius: 4, padding: "11px 28px", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>
                  {running ? "Pause" : "Start"}
                </button>
                <button onClick={() => { if (focusTask) logSession(focusTask, false); setTimer(25*60); setRunning(false); sessionStartRef.current = null; }}
                  style={{ background: "transparent", color: "#777", border: "1px solid #222", borderRadius: 4, padding: "11px 20px", fontSize: 12 }}>
                  Reset
                </button>
              </div>
              <button onClick={() => { if (running && focusTask) logSession(focusTask, false); setFocusMode(false); setRunning(false); sessionStartRef.current = null; }}
                style={{ background: "none", border: "none", color: "#666", fontSize: 11, letterSpacing: 0.5, marginTop: 4 }}>
                Exit focus mode
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #111", paddingBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#FF4500", marginBottom: 8, textTransform: "uppercase", fontWeight: 500 }}>Priority Matrix</p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#fff", lineHeight: 1.1, fontWeight: 400 }}>
              What needs<br/><em>your attention?</em>
            </h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            {/* Date nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a0a0a", border: "1px solid #222", borderRadius: 3, padding: "6px 12px" }}>
              <button onClick={() => setCurrentDate(d => prevDay(d))}
                style={{ background: "none", border: "none", color: "#888", fontSize: 14, padding: "0 4px", lineHeight: 1 }}>‹</button>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, color: isToday ? "#fff" : "#aaa", minWidth: 130, textAlign: "center" }}>
                {isToday ? "Today" : fmtDate(currentDate)}
              </span>
              <button onClick={() => setCurrentDate(d => nextDay(d))}
                style={{ background: "none", border: "none", color: "#888", fontSize: 14, padding: "0 4px", lineHeight: 1 }}>›</button>
              {!isToday && (
                <button onClick={() => setCurrentDate(todayStr())}
                  style={{ background: "none", border: "1px solid #333", borderRadius: 2, color: "#888", fontSize: 10, padding: "2px 7px", marginLeft: 4, letterSpacing: 0.5 }}>
                  today
                </button>
              )}
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {topTask && (
                <button onClick={() => openFocus(topTask)}
                  style={{ background: "transparent", color: "#FF4500", border: "1px solid #FF450033", borderRadius: 3, padding: "8px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>
                  Focus →
                </button>
              )}
              <button onClick={exportCSV}
                style={{ background: "none", border: "1px solid #555", borderRadius: 3, color: "#bbb", fontSize: 11, padding: "8px 14px", letterSpacing: 0.8, textTransform: "uppercase" }}>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* ADD BAR — only shown for current date */}
        {isToday && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#111", borderRadius: 3, padding: "10px 14px", border: "1px solid #444" }}>
            <input
              style={{ flex: 1, minWidth: 200, background: "transparent", border: "none", color: "#ddd", padding: "5px 4px", fontSize: 14, outline: "none" }}
              placeholder="Add a task…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}/>
            <button className="tag-btn" onClick={() => setUrgent(u => !u)}
              style={{ borderColor: urgent ? "#FF4500" : "#555", background: urgent ? "#FF450018" : "transparent", color: urgent ? "#FF4500" : "#bbb" }}>
              Urgent
            </button>
            <button className="tag-btn" onClick={() => setImportant(i => !i)}
              style={{ borderColor: important ? "#C8A84B" : "#555", background: important ? "#C8A84B18" : "transparent", color: important ? "#C8A84B" : "#bbb" }}>
              Important
            </button>
            <button onClick={addTask}
              style={{ background: "#fff", color: "#000", border: "none", borderRadius: 3, padding: "8px 20px", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              Add
            </button>
          </div>
        )}

        {/* MATRIX */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
          {QUADRANTS.map(q => {
            const qTasks = viewTasks.filter(t => t.quadrant === q.id);
            return (
              <div key={q.id} className="qdrop"
                style={{ background: "#030303", border: "1px solid #111", borderTop: `2px solid ${q.color}`, borderRadius: 3, padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 220 }}
                onDragOver={e => { e.preventDefault(); setDragOverQuadrant(q.id); }}
                onDrop={e => {
                  e.preventDefault();
                  // If dropped on the quadrant container (not a card), move to this quadrant
                  if (dragId != null && dragOverId == null) {
                    setTasks(prev => prev.map(t => t.id === dragId ? { ...t, quadrant: q.id } : t));
                  } else if (dragId != null && dragOverQuadrant !== null) {
                    // Move to different quadrant if drag-over quadrant differs
                    const dragTask = tasks.find(t => t.id === dragId);
                    if (dragTask && dragTask.quadrant !== q.id) {
                      setTasks(prev => prev.map(t => t.id === dragId ? { ...t, quadrant: q.id } : t));
                    }
                  }
                  setDragId(null); setDragOverId(null); setDragOverQuadrant(null);
                }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#fff", fontWeight: 400 }}>{q.label}</div>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 0.8, marginTop: 2, textTransform: "uppercase" }}>{q.sub}</div>
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: q.color, opacity: 0.7 }}/>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                  {qTasks.length === 0 && (
                    <p style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 20 }}>
                      {isToday ? "Drop tasks here" : "No tasks"}
                    </p>
                  )}
                  {qTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      color={q.color}
                      isDragOver={dragOverId === task.id}
                      onDragStart={() => handleDragStart(task.id)}
                      onDragOver={() => setDragOverId(task.id)}
                      onDragEnd={handleDragEnd}
                      onToggle={() => updateTask(task.id, t => ({ ...t, done: !t.done, completed_at: !t.done ? new Date().toISOString() : null }))}
                      onDelete={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); if (focusTask?.id === task.id) setFocusTask(null); }}
                      onFocus={() => openFocus(task)}
                      onEdit={(newText) => updateTask(task.id, t => ({ ...t, text: newText }))}
                      onUpdateSubtasks={subs => updateTask(task.id, t => {
                        const allDone = subs.length > 0 && subs.every(s => s.done);
                        const noneDone = subs.length > 0 && subs.every(s => !s.done);
                        const wasDone = t.done;
                        const nowDone = allDone ? true : noneDone ? false : t.done;
                        if (allDone && !wasDone) {
                          setTimeout(() => {
                            const el = document.getElementById(`task-${t.id}`);
                            if (el) { const r = el.getBoundingClientRect(); spawnConfetti(r.left + r.width / 2, r.top + r.height / 2); }
                          }, 50);
                        }
                        return {
                          ...t,
                          subtasks: subs,
                          done: nowDone,
                          completed_at: nowDone && !wasDone ? new Date().toISOString() : !nowDone ? null : t.completed_at,
                        };
                      })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* STATS BAR */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #111", paddingTop: 14 }}>
          {QUADRANTS.map(q => {
            const total = viewTasks.filter(t => t.quadrant === q.id).length;
            const done  = viewTasks.filter(t => t.quadrant === q.id && t.done).length;
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "#080808", borderRadius: 3, padding: "6px 12px", border: "1px solid #111" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: q.color, opacity: 0.7 }}/>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#fff" }}>{done}/{total}</span>
                <span style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>{q.label}</span>
              </div>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, background: "#080808", borderRadius: 3, padding: "6px 14px", border: "1px solid #111" }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#fff" }}>{viewTasks.filter(t => t.done).length}/{viewTasks.length}</span>
            <span style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>Total</span>
          </div>
        </div>

      </div>
    </>
  );
}
