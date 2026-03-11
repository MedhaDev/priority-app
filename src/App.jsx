import { useState, useEffect, useRef } from "react";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0e0e10; font-family: 'Outfit', sans-serif; color: #ccc; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 2px; }
  input, textarea, button { font-family: 'Outfit', sans-serif; }
  button { cursor: pointer; }
  .task-card { transition: transform 0.15s, box-shadow 0.15s; }
  .task-card:hover { transform: translateX(2px); box-shadow: 0 2px 14px rgba(0,0,0,0.5); }
  .qdrop.drag-over { box-shadow: inset 0 0 0 2px rgba(255,255,255,0.15) !important; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
  .fadein { animation: fadeIn 0.2s ease forwards; }
  @keyframes wobble { 0%,100% { transform:rotate(-1.5deg); } 50% { transform:rotate(1.5deg); } }
  .doodle-wrap:hover svg { animation: wobble 0.35s ease; }
  .subtask-inp {
    background: #ffffff08; border: 1px dashed #ffffff1a; border-radius: 5px;
    color: #aaa; padding: 5px 8px; font-size: 11px; width: 100%;
    font-family: 'IBM Plex Mono', monospace;
  }
  .subtask-inp::placeholder { color: #444; }
  .tag-btn {
    border-radius: 5px; padding: 7px 13px; font-size: 11px;
    border: 1px solid; transition: all 0.15s; letter-spacing: 0.5px;
    font-family: 'IBM Plex Mono', monospace; font-weight: 500;
  }
`;

/* ── DOODLES ─────────────────────────────────────── */
const Doodle = ({ id, color }) => {
  const sw = "1.8";
  if (id === "do") return (
    <svg width="62" height="70" viewBox="0 0 64 72" fill="none">
      <ellipse cx="32" cy="16" rx="10" ry="11" stroke={color} strokeWidth={sw} fill="none"/>
      <circle cx="27" cy="14" r="1.8" fill={color}/>
      <circle cx="37" cy="14" r="1.8" fill={color}/>
      <path d="M27 20 Q32 18 37 20" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M26 8 L23 4M32 7 L32 3M38 8 L41 4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M32 27 L32 48" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 32 Q20 28 15 22" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 32 Q44 28 49 22" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 48 Q26 56 24 64" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 48 Q38 56 40 64" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <rect x="10" y="30" width="10" height="8" rx="1" stroke={color} strokeWidth="1.2" fill="none" transform="rotate(-20 15 34)"/>
      <rect x="44" y="28" width="10" height="8" rx="1" stroke={color} strokeWidth="1.2" fill="none" transform="rotate(15 49 32)"/>
      <path d="M12 32 L18 32M12 34.5 L18 34.5" stroke={color} strokeWidth="0.8" opacity="0.5" transform="rotate(-20 15 34)"/>
    </svg>
  );
  if (id === "schedule") return (
    <svg width="62" height="70" viewBox="0 0 64 72" fill="none">
      <ellipse cx="32" cy="15" rx="10" ry="11" stroke={color} strokeWidth={sw} fill="none"/>
      <circle cx="27.5" cy="13" r="1.8" fill={color}/>
      <circle cx="36.5" cy="13" r="1.8" fill={color}/>
      <path d="M28 19 Q32 22 36 19" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M32 26 L32 46" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 31 Q24 35 20 42" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 31 Q40 33 44 38" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <rect x="16" y="42" width="20" height="14" rx="2" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M26 42 L26 56" stroke={color} strokeWidth="1" opacity="0.4"/>
      <path d="M19 46 L23 46M19 49 L23 49M19 52 L23 52" stroke={color} strokeWidth="0.9" opacity="0.6"/>
      <path d="M38 38 L46 30" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M46 30 L49 27" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M32 46 Q28 54 26 62" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 46 Q36 54 38 62" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  if (id === "delegate") return (
    <svg width="70" height="70" viewBox="0 0 72 72" fill="none">
      <ellipse cx="18" cy="14" rx="9" ry="10" stroke={color} strokeWidth={sw} fill="none"/>
      <circle cx="14" cy="12" r="1.6" fill={color}/>
      <circle cx="22" cy="12" r="1.6" fill={color}/>
      <path d="M14 18 Q18 21 22 18" stroke={color} strokeWidth="1.3" fill="none"/>
      <path d="M18 24 L18 44" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M18 30 Q28 27 36 30" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M18 30 L12 40" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M18 44 L12 58M18 44 L24 58" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <rect x="31" y="26" width="11" height="9" rx="1.5" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M31 30 L42 30M36 26 L36 35" stroke={color} strokeWidth="0.9" opacity="0.6"/>
      <path d="M38 20 L43 20M41 17 L44 20 L41 23" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <ellipse cx="56" cy="14" rx="9" ry="10" stroke={color} strokeWidth={sw} fill="none"/>
      <circle cx="52" cy="12" r="1.6" fill={color}/>
      <circle cx="60" cy="12" r="1.6" fill={color}/>
      <path d="M52 18 Q56 22 60 18" stroke={color} strokeWidth="1.3" fill="none"/>
      <path d="M56 24 L56 44" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M56 30 Q46 27 42 35" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M56 30 L62 40" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M56 44 L50 58M56 44 L62 58" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  if (id === "eliminate") return (
    <svg width="62" height="70" viewBox="0 0 64 72" fill="none">
      <ellipse cx="32" cy="12" rx="10" ry="11" stroke={color} strokeWidth={sw} fill="none"/>
      <path d="M25 10 L29 10M35 10 L39 10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M27 17 Q32 20 37 17" stroke={color} strokeWidth="1.4" fill="none"/>
      <text x="44" y="10" fill={color} fontSize="8" fontFamily="serif" opacity="0.5">z</text>
      <text x="49" y="5" fill={color} fontSize="11" fontFamily="serif" opacity="0.35">z</text>
      <path d="M10 46 Q32 38 54 46" stroke={color} strokeWidth="1.4" fill="none" opacity="0.4" strokeDasharray="3 2"/>
      <path d="M10 44 L10 56M54 44 L54 56" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 23 Q28 32 12 40" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M32 23 Q40 28 50 34" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M12 40 Q10 43 10 44" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M12 40 Q16 44 18 48" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M50 34 Q53 40 54 44" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M50 34 Q48 40 46 46" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  return null;
};

/* ── DATA ────────────────────────────────────────── */
const QUADRANTS = [
  { id: "do",        label: "DO FIRST",  sub: "urgent + important",         color: "#e05c42", bg: "#160704", border: "#e05c42", desc: "on fire. do it now." },
  { id: "schedule",  label: "SCHEDULE",  sub: "not urgent + important",     color: "#e8a825", bg: "#161004", border: "#e8a825", desc: "worth your future time." },
  { id: "delegate",  label: "DELEGATE",  sub: "urgent + not important",     color: "#3dbdcc", bg: "#021012", border: "#3dbdcc", desc: "someone else can handle it." },
  { id: "eliminate", label: "ELIMINATE", sub: "not urgent + not important", color: "#77778a", bg: "#101013", border: "#77778a", desc: "drop it. no guilt." },
];

let nextId = 50;

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
    <div style={{ marginTop: 8, paddingLeft: 10, borderLeft: `2px solid ${color}28` }}>
      {subtasks.map(st => (
        <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <button
            onClick={() => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, done: !s.done } : s))}
            style={{ width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${color}66`, background: st.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {st.done && <span style={{ color: "#000", fontSize: 8, lineHeight: 1, fontWeight: 700 }}>x</span>}
          </button>
          <span style={{ fontSize: 12, color: st.done ? "#444" : "#999", textDecoration: st.done ? "line-through" : "none", flex: 1, letterSpacing: 0.2 }}>{st.text}</span>
          <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} style={{ background: "none", border: "none", color: "#333", fontSize: 10, padding: "0 2px" }}>x</button>
        </div>
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          <input autoFocus className="subtask-inp" style={{ flex: 1 }} value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setVal(""); } }}
            placeholder="subtask name... (enter to save)"/>
          <button onClick={submit} style={{ background: color, color: "#000", border: "none", borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>+</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ background: "none", border: "none", color: color + "55", fontSize: 11, padding: "2px 0", letterSpacing: 0.4 }}>
          + add subtask
        </button>
      )}
    </div>
  );
}

/* ── TASK CARD ───────────────────────────────────── */
function TaskCard({ task, color, onToggle, onDelete, onFocus, onUpdateSubtasks, isDoQ }) {
  const [expanded, setExpanded] = useState(false);
  const doneCount = task.subtasks.filter(s => s.done).length;

  return (
    <div className="task-card fadein" style={{ background: "#ffffff06", borderRadius: 7, borderLeft: `3px solid ${color}`, opacity: task.done ? 0.38 : 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 10px" }}>
        <button onClick={onToggle}
          style={{ width: 15, height: 15, marginTop: 2, borderRadius: 3, border: `1.5px solid ${color}`, background: task.done ? color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          {task.done && <span style={{ color: "#000", fontSize: 9, fontWeight: 700 }}>x</span>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, color: "#ddd", lineHeight: 1.4, textDecoration: task.done ? "line-through" : "none", flex: 1, wordBreak: "break-word", letterSpacing: 0.2 }}>
              {task.text}
            </span>
            {task.subtasks.length > 0 && (
              <span style={{ fontSize: 10, color: color + "88", whiteSpace: "nowrap" }}>{doneCount}/{task.subtasks.length}</span>
            )}
          </div>
          {task.subtasks.length > 0 && (
            <div style={{ height: 2, background: "#ffffff0e", borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(doneCount / task.subtasks.length) * 100}%`, background: color, transition: "width 0.3s", borderRadius: 2 }}/>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
            {task.created_at && (
              <span style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: 0.3 }}>
                added {new Date(task.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {task.completed_at && (
              <span style={{ fontSize: 10, color: color + "66", letterSpacing: 0.3 }}>
                done {new Date(task.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", color: color + "55", fontSize: 10, padding: "1px 5px" }}>
            {expanded ? "[-]" : "[+]"}
          </button>
          {isDoQ && !task.done && (
            <button onClick={onFocus} title="Focus"
              style={{ background: "none", border: `1px solid ${color}44`, color: color, fontSize: 9, borderRadius: 4, padding: "2px 6px", letterSpacing: 0.5 }}>
              focus
            </button>
          )}
          <button onClick={onDelete}
            style={{ background: "none", border: "none", fontSize: 10, color: "#333", padding: "1px 4px" }}>x</button>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 10px 10px 10px" }}>
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
        { id: 1, text: "reply to urgent client email", quadrant: "do",       done: false, subtasks: [{ id: 2, text: "draft reply", done: false }, { id: 3, text: "attach report", done: false }] },
        { id: 4, text: "plan next week goals",          quadrant: "schedule", done: false, subtasks: [{ id: 5, text: "review this week", done: false }, { id: 6, text: "set 3 priorities", done: false }] },
        { id: 7, text: "fix printer jam",               quadrant: "delegate", done: false, subtasks: [] },
        { id: 8, text: "browse social media",           quadrant: "eliminate",done: false, subtasks: [] },
      ];
    } catch { return []; }
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

  useEffect(() => {
    if (running) {
      iRef.current = setInterval(() => setTimer(t => {
        if (t <= 1) { clearInterval(iRef.current); setRunning(false); return 0; }
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

  useEffect(() => { try { localStorage.setItem("pm_tasks", JSON.stringify(tasks)); } catch {} }, [tasks]);

  const updateTask = (id, fn) => setTasks(prev => prev.map(t => t.id === id ? fn(t) : t));
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const topTask = tasks.find(t => t.quadrant === "do" && !t.done) || tasks.find(t => !t.done);
  const openFocus = task => { setFocusTask(task); setFocusMode(true); setTimer(25 * 60); setRunning(false); };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", background: "#0e0e10", color: "#ccc", padding: "24px 20px 48px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* FOCUS OVERLAY */}
        {focusMode && (
          <div style={{ position: "fixed", inset: 0, background: "#000000f4", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#131315", border: `1px solid ${QUADRANTS[0].color}28`, borderRadius: 16, padding: "40px 36px", textAlign: "center", maxWidth: 400, width: "90%" }}>
              <p style={{ fontSize: 10, letterSpacing: 4, color: "#e05c42", marginBottom: 14, fontWeight: 600 }}>// FOCUS SESSION</p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.6 }}>
                <Doodle id="do" color="#e05c42"/>
              </div>
              <p style={{ fontSize: 14, color: "#ddd", marginBottom: 24, lineHeight: 1.5, letterSpacing: 0.3 }}>{focusTask?.text || "—"}</p>
              {focusTask?.subtasks?.length > 0 && (
                <div style={{ marginBottom: 20, textAlign: "left", background: "#ffffff06", borderRadius: 8, padding: "10px 14px" }}>
                  {focusTask.subtasks.map(st => (
                    <div key={st.id} style={{ fontSize: 11, color: st.done ? "#3a3a3a" : "#888", textDecoration: st.done ? "line-through" : "none", marginBottom: 5, letterSpacing: 0.3 }}>
                      [{st.done ? "x" : " "}] {st.text}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: "#fff", letterSpacing: 6, lineHeight: 1, marginBottom: 24 }}>{fmt(timer)}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
                <button onClick={() => setRunning(r => !r)}
                  style={{ background: running ? "#222" : "#e05c42", color: running ? "#888" : "#fff", border: `1px solid ${running ? "#333" : "#e05c42"}`, borderRadius: 7, padding: "11px 24px", fontSize: 12, letterSpacing: 1, fontWeight: 600 }}>
                  {running ? "[ pause ]" : "[ start ]"}
                </button>
                <button onClick={() => { setTimer(25 * 60); setRunning(false); }}
                  style={{ background: "transparent", color: "#555", border: "1px solid #2a2a2e", borderRadius: 7, padding: "11px 18px", fontSize: 12, letterSpacing: 1 }}>
                  [ reset ]
                </button>
              </div>
              <button onClick={() => { setFocusMode(false); setRunning(false); }}
                style={{ background: "none", border: "1px solid #1e1e22", color: "#444", borderRadius: 7, padding: "7px 18px", fontSize: 11, letterSpacing: 0.5 }}>
                exit focus mode
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, letterSpacing: 5, color: "#f0f0f0", lineHeight: 1 }}>PRIORITY MATRIX</h1>
            <p style={{ fontSize: 12, color: "#666", marginTop: 5, letterSpacing: 1.5 }}>// tag it — break it down — ship it</p>
          </div>
          {topTask && (
            <button onClick={() => openFocus(topTask)}
              style={{ background: "transparent", color: "#e05c42", border: "1px solid #e05c4255", borderRadius: 7, padding: "9px 16px", fontSize: 11, letterSpacing: 1, fontWeight: 600 }}>
              [ focus on top task ]
            </button>
          )}
        </div>

        {/* ADD BAR */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#141416", borderRadius: 10, padding: "11px 14px", border: "1px solid #1e1e22" }}>
          <input
            style={{ flex: 1, minWidth: 180, background: "transparent", border: "none", color: "#ddd", padding: "5px 4px", fontSize: 13, outline: "none", letterSpacing: 0.3 }}
            placeholder="// what needs to get done?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}/>
          <button className="tag-btn" onClick={() => setUrgent(u => !u)}
            style={{ borderColor: urgent ? "#e05c42" : "#252528", background: urgent ? "#e05c4214" : "transparent", color: urgent ? "#e05c42" : "#666" }}>
            urgent
          </button>
          <button className="tag-btn" onClick={() => setImportant(i => !i)}
            style={{ borderColor: important ? "#e8a825" : "#252528", background: important ? "#e8a82514" : "transparent", color: important ? "#e8a825" : "#666" }}>
            important
          </button>
          <button onClick={addTask}
            style={{ background: "#f0f0f0", color: "#0e0e10", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            + add
          </button>
        </div>

        {/* HINT ROW */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { t: "urgent + important  ->  DO FIRST",   c: "#e05c42" },
            { t: "important only      ->  SCHEDULE",   c: "#e8a825" },
            { t: "urgent only         ->  DELEGATE",   c: "#3dbdcc" },
            { t: "neither            ->  ELIMINATE",   c: "#888899" },
          ].map(h => (
            <span key={h.t} style={{ fontSize: 10, color: h.c + "77", letterSpacing: 0.5 }}>{h.t}</span>
          ))}
        </div>

        {/* MATRIX */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
          {QUADRANTS.map(q => {
            const qTasks = tasks.filter(t => t.quadrant === q.id);
            return (
              <div key={q.id} className="qdrop"
                style={{ background: q.bg, border: `1px solid ${q.border}33`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 240 }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
                onDrop={e => {
                  e.currentTarget.classList.remove("drag-over");
                  if (dragId != null) { setTasks(prev => prev.map(t => t.id === dragId ? { ...t, quadrant: q.id } : t)); setDragId(null); }
                }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2.5, color: q.color }}>{q.label}</div>
                    <div style={{ fontSize: 10, color: "#666", letterSpacing: 0.8, marginTop: 2 }}>{q.sub}</div>
                    <div style={{ fontSize: 11, color: q.color + "99", marginTop: 5, letterSpacing: 0.3, fontStyle: "italic" }}>{q.desc}</div>
                  </div>
                  <div className="doodle-wrap" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <Doodle id={q.id} color={q.color}/>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {qTasks.length === 0 && (
                    <p style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 24, letterSpacing: 0.5 }}>// drop tasks here</p>
                  )}
                  {qTasks.map(task => (
                    <div key={task.id} draggable onDragStart={() => setDragId(task.id)}>
                      <TaskCard
                        task={task} color={q.color} isDoQ={q.id === "do"}
                        onToggle={() => updateTask(task.id, t => ({ ...t, done: !t.done, completed_at: !t.done ? new Date().toISOString() : null }))}
                        onDelete={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); if (focusTask?.id === task.id) setFocusTask(null); }}
                        onFocus={() => openFocus(task)}
                        onUpdateSubtasks={subs => updateTask(task.id, t => ({ ...t, subtasks: subs }))}/>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* STATS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #1a1a1e", paddingTop: 16, alignItems: "center" }}>
          {QUADRANTS.map(q => {
            const total = tasks.filter(t => t.quadrant === q.id).length;
            const done  = tasks.filter(t => t.quadrant === q.id && t.done).length;
            return (
              <div key={q.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#131315", borderRadius: 7, padding: "7px 14px", gap: 2 }}>
                <span style={{ color: q.color + "cc", fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 1.5 }}>{q.label}</span>
                <span style={{ fontSize: 17, fontFamily: "'Bebas Neue', sans-serif", color: "#777" }}>{done}/{total}</span>
              </div>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "center", background: "#131315", borderRadius: 7, padding: "7px 16px", gap: 2 }}>
            <span style={{ color: "#888", fontSize: 10, letterSpacing: 1.5 }}>TOTAL</span>
            <span style={{ fontSize: 17, fontFamily: "'Bebas Neue', sans-serif", color: "#ddd" }}>{tasks.filter(t => t.done).length}/{tasks.length}</span>
          </div>
        </div>

      </div>
    </>
  );
}
