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
  .task-card { transition: background 0.15s; }
  .task-card:hover { background: #ffffff0a !important; }
  .qdrop.drag-over { outline: 1px solid rgba(255,255,255,0.18) !important; }
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
  .reorder-btn {
    background: none; border: none; color: #2a2a2a; font-size: 9px;
    padding: 0 1px; line-height: 1; transition: color 0.1s; display: block;
  }
  .reorder-btn:hover { color: #666; }
`;

const QUADRANTS = [
  { id: "do",        label: "Do First",  sub: "Urgent · Important",         color: "#FF4500", bg: "#030303", border: "#FF4500" },
  { id: "schedule",  label: "Schedule",  sub: "Not Urgent · Important",     color: "#C8A84B", bg: "#030303", border: "#C8A84B" },
  { id: "delegate",  label: "Delegate",  sub: "Urgent · Not Important",     color: "#6B9E8C", bg: "#030303", border: "#6B9E8C" },
  { id: "eliminate", label: "Eliminate", sub: "Not Urgent · Not Important", color: "#666680", bg: "#030303", border: "#666680" },
];

let nextId = 50;

/* ── CONFETTI ─────────────────────────────────────── */
function spawnConfetti(x, y) {
  const pieces = ["✦", "♥", "✿", "★", "◆", "✸"];
  const colors = ["#FF4500", "#C8A84B", "#6B9E8C", "#fff", "#FF8C69"];
  const container = document.getElementById("confetti-root");
  if (!container) return;
  for (let i = 0; i < 10; i++) {
    const el = document.createElement("span");
    el.className = "confetti-piece";
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.random() * 360) * (Math.PI / 180);
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

  const move = (idx, dir) => {
    const arr = [...subtasks];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    setSubtasks(arr);
  };

  return (
    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: `1px solid ${color}22` }}>
      {subtasks.map((st, idx) => (
        <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button className="reorder-btn" onClick={() => move(idx, -1)}>▲</button>
            <button className="reorder-btn" onClick={() => move(idx, 1)}>▼</button>
          </div>
          <button
            onClick={() => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, done: !s.done } : s))}
            style={{ width: 11, height: 11, borderRadius: 2, border: `1px solid ${color}44`, background: st.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {st.done && <span style={{ color: "#000", fontSize: 7, fontWeight: 700 }}>✓</span>}
          </button>
          <span style={{ fontSize: 12, color: st.done ? "#2a2a2a" : "#777", textDecoration: st.done ? "line-through" : "none", flex: 1 }}>{st.text}</span>
          <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} style={{ background: "none", border: "none", color: "#222", fontSize: 10, padding: "0 2px" }}>✕</button>
        </div>
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          <input autoFocus
            style={{ flex: 1, background: "#ffffff04", border: `1px solid ${color}1a`, borderRadius: 3, color: "#999", padding: "5px 8px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setVal(""); } }}
            placeholder="Subtask name…"/>
          <button onClick={submit} style={{ background: color, color: "#000", border: "none", borderRadius: 3, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>+</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ background: "none", border: "none", color: "#2a2a2a", fontSize: 11, padding: "3px 0" }}>
          + subtask
        </button>
      )}
    </div>
  );
}

/* ── TASK CARD ───────────────────────────────────── */
function TaskCard({ task, color, onToggle, onDelete, onFocus, onUpdateSubtasks, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(false);
  const doneCount = task.subtasks.filter(s => s.done).length;

  const handleToggle = (e) => {
    if (!task.done) {
      const rect = e.currentTarget.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    onToggle();
  };

  return (
    <div className="task-card fadein" style={{ background: "#ffffff04", borderRadius: 3, borderLeft: `2px solid ${color}`, opacity: task.done ? 0.28 : 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, marginTop: 1 }}>
          <button className="reorder-btn" onClick={onMoveUp}>▲</button>
          <button className="reorder-btn" onClick={onMoveDown}>▼</button>
        </div>
        <button onClick={handleToggle}
          style={{ width: 13, height: 13, marginTop: 2, borderRadius: 2, border: `1px solid ${color}55`, background: task.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          {task.done && <span style={{ color: "#000", fontSize: 8, fontWeight: 700 }}>✓</span>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#ddd", lineHeight: 1.4, textDecoration: task.done ? "line-through" : "none", flex: 1, wordBreak: "break-word" }}>
              {task.text}
            </span>
            {task.subtasks.length > 0 && (
              <span style={{ fontSize: 10, color: color + "55", whiteSpace: "nowrap" }}>{doneCount}/{task.subtasks.length}</span>
            )}
          </div>
          {task.subtasks.length > 0 && (
            <div style={{ height: 1, background: "#ffffff08", borderRadius: 1, marginTop: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(doneCount / task.subtasks.length) * 100}%`, background: color, transition: "width 0.3s" }}/>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
            {task.created_at && (
              <span style={{ fontSize: 10, color: "#222" }}>
                {new Date(task.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {task.completed_at && (
              <span style={{ fontSize: 10, color: color + "44" }}>
                ✓ {new Date(task.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {task.focus_sessions > 0 && (
              <span style={{ fontSize: 10, color: "#2a2a2a" }}>◎ {task.focus_sessions}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", color: "#2a2a2a", fontSize: 12, padding: "1px 4px", lineHeight: 1 }}>
            {expanded ? "−" : "+"}
          </button>
          <button onClick={onFocus}
            style={{ background: "none", border: `1px solid ${color}22`, color: color + "66", fontSize: 9, borderRadius: 2, padding: "2px 5px", letterSpacing: 0.4, textTransform: "uppercase" }}>
            focus
          </button>
          <button onClick={onDelete}
            style={{ background: "none", border: "none", fontSize: 10, color: "#1e1e1e", padding: "1px 3px" }}>✕</button>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 10px 10px 34px" }}>
          <SubTasks subtasks={task.subtasks} setSubtasks={onUpdateSubtasks} color={color}/>
        </div>
      )}
    </div>
  );
}

/* ── APP ─────────────────────────────────────────── */
export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("pm_tasks");
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "Reply to urgent client email", quadrant: "do",       done: false, subtasks: [{ id: 2, text: "Draft reply", done: false }, { id: 3, text: "Attach report", done: false }], created_at: new Date().toISOString(), completed_at: null },
        { id: 4, text: "Plan next week's goals",       quadrant: "schedule", done: false, subtasks: [{ id: 5, text: "Review this week", done: false }], created_at: new Date().toISOString(), completed_at: null },
        { id: 7, text: "Fix printer jam",              quadrant: "delegate", done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null },
        { id: 8, text: "Browse social media",          quadrant: "eliminate",done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null },
      ];
    } catch { return []; }
  });

  const [sessions, setSessions] = useState(() => {
    try { const s = localStorage.getItem("pm_sessions"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [input, setInput] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState(null);
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [dragId, setDragId] = useState(null);
  const iRef = useRef(null);
  const sessionStartRef = useRef(null);

  useEffect(() => { try { localStorage.setItem("pm_tasks",    JSON.stringify(tasks));    } catch {} }, [tasks]);
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
    setTasks(prev => [...prev, { id: nextId++, text: input.trim(), quadrant: q, done: false, subtasks: [], created_at: new Date().toISOString(), completed_at: null }]);
    setInput(""); setUrgent(false); setImportant(false);
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const topTask = tasks.find(t => t.quadrant === "do" && !t.done) || tasks.find(t => !t.done);
  const openFocus = task => { setFocusTask(task); setFocusMode(true); setTimer(25 * 60); setRunning(false); sessionStartRef.current = null; };

  const moveTask = (id, quadrant, dir) => {
    setTasks(prev => {
      const qTasks = prev.filter(t => t.quadrant === quadrant);
      const idx = qTasks.findIndex(t => t.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= qTasks.length) return prev;
      const newOrder = [...qTasks];
      [newOrder[idx], newOrder[swap]] = [newOrder[swap], newOrder[idx]];
      const others = prev.filter(t => t.quadrant !== quadrant);
      return [...others, ...newOrder];
    });
  };

  const exportCSV = () => {
    const taskHeaders = ["id","task","quadrant","done","created_at","completed_at","subtasks_total","subtasks_done","focus_sessions","total_focus_mins"];
    const taskRows = tasks.map(t => [t.id, `"${t.text.replace(/"/g,'""')}"`, t.quadrant, t.done, t.created_at||"", t.completed_at||"", t.subtasks.length, t.subtasks.filter(s=>s.done).length, t.focus_sessions||0, t.total_focus_mins||0]);
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
                    <div key={st.id} style={{ fontSize: 12, color: st.done ? "#222" : "#666", textDecoration: st.done ? "line-through" : "none", marginBottom: 5 }}>
                      {st.done ? "✓" : "○"} {st.text}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 80, color: "#fff", lineHeight: 1, marginBottom: 28, letterSpacing: 2 }}>{fmt(timer)}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
                <button onClick={() => { if (running && focusTask) logSession(focusTask, false); setRunning(r => !r); }}
                  style={{ background: running ? "#111" : "#FF4500", color: running ? "#444" : "#fff", border: `1px solid ${running ? "#1a1a1a" : "#FF4500"}`, borderRadius: 4, padding: "11px 28px", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>
                  {running ? "Pause" : "Start"}
                </button>
                <button onClick={() => { if (focusTask) logSession(focusTask, false); setTimer(25*60); setRunning(false); sessionStartRef.current = null; }}
                  style={{ background: "transparent", color: "#333", border: "1px solid #111", borderRadius: 4, padding: "11px 20px", fontSize: 12 }}>
                  Reset
                </button>
              </div>
              <button onClick={() => { if (running && focusTask) logSession(focusTask, false); setFocusMode(false); setRunning(false); sessionStartRef.current = null; }}
                style={{ background: "none", border: "none", color: "#2a2a2a", fontSize: 11, letterSpacing: 0.5, marginTop: 4 }}>
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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {topTask && (
              <button onClick={() => openFocus(topTask)}
                style={{ background: "transparent", color: "#FF4500", border: "1px solid #FF450033", borderRadius: 3, padding: "8px 14px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>
                Focus →
              </button>
            )}
            <button onClick={exportCSV}
              style={{ background: "none", border: "1px solid #111", borderRadius: 3, color: "#333", fontSize: 11, padding: "8px 14px", letterSpacing: 0.8, textTransform: "uppercase" }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* ADD BAR */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#080808", borderRadius: 3, padding: "10px 14px", border: "1px solid #111" }}>
          <input
            style={{ flex: 1, minWidth: 200, background: "transparent", border: "none", color: "#ddd", padding: "5px 4px", fontSize: 14, outline: "none" }}
            placeholder="Add a task…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}/>
          <button className="tag-btn" onClick={() => setUrgent(u => !u)}
            style={{ borderColor: urgent ? "#FF4500" : "#1a1a1a", background: urgent ? "#FF450010" : "transparent", color: urgent ? "#FF4500" : "#333" }}>
            Urgent
          </button>
          <button className="tag-btn" onClick={() => setImportant(i => !i)}
            style={{ borderColor: important ? "#C8A84B" : "#1a1a1a", background: important ? "#C8A84B10" : "transparent", color: important ? "#C8A84B" : "#333" }}>
            Important
          </button>
          <button onClick={addTask}
            style={{ background: "#fff", color: "#000", border: "none", borderRadius: 3, padding: "8px 20px", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Add
          </button>
        </div>

        {/* MATRIX */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
          {QUADRANTS.map(q => {
            const qTasks = tasks.filter(t => t.quadrant === q.id);
            return (
              <div key={q.id} className="qdrop"
                style={{ background: q.bg, border: "1px solid #111", borderTop: `2px solid ${q.color}`, borderRadius: 3, padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 220 }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
                onDrop={e => { e.currentTarget.classList.remove("drag-over"); if (dragId != null) { setTasks(prev => prev.map(t => t.id === dragId ? { ...t, quadrant: q.id } : t)); setDragId(null); } }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#fff", fontWeight: 400 }}>{q.label}</div>
                    <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 0.8, marginTop: 2, textTransform: "uppercase" }}>{q.sub}</div>
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: q.color, opacity: 0.7 }}/>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                  {qTasks.length === 0 && (
                    <p style={{ color: "#181818", fontSize: 12, textAlign: "center", marginTop: 20 }}>Drop tasks here</p>
                  )}
                  {qTasks.map((task, idx) => (
                    <div key={task.id} draggable onDragStart={() => setDragId(task.id)}>
                      <TaskCard
                        task={task} color={q.color}
                        onToggle={() => updateTask(task.id, t => ({ ...t, done: !t.done, completed_at: !t.done ? new Date().toISOString() : null }))}
                        onDelete={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); if (focusTask?.id === task.id) setFocusTask(null); }}
                        onFocus={() => openFocus(task)}
                        onUpdateSubtasks={subs => updateTask(task.id, t => ({ ...t, subtasks: subs }))}
                        onMoveUp={() => moveTask(task.id, q.id, -1)}
                        onMoveDown={() => moveTask(task.id, q.id, 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* STATS BAR */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #111", paddingTop: 14 }}>
          {QUADRANTS.map(q => {
            const total = tasks.filter(t => t.quadrant === q.id).length;
            const done  = tasks.filter(t => t.quadrant === q.id && t.done).length;
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "#080808", borderRadius: 3, padding: "6px 12px", border: "1px solid #111" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: q.color, opacity: 0.7 }}/>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#fff" }}>{done}/{total}</span>
                <span style={{ fontSize: 10, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: 0.5 }}>{q.label}</span>
              </div>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, background: "#080808", borderRadius: 3, padding: "6px 14px", border: "1px solid #111" }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#fff" }}>{tasks.filter(t => t.done).length}/{tasks.length}</span>
            <span style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: 0.5 }}>Total</span>
          </div>
        </div>

      </div>
    </>
  );
}
