"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownUp, CalendarDays, Check, CheckCircle2, Circle,
  Clock3, Download, Flag, LayoutDashboard, ListTodo, MoreHorizontal,
  Plus, Search, Sparkles, Target, Trash2, X
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value: string) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  : "No date";

const starterTasks: Task[] = [
  { id: "demo-1", title: "Plan the week", description: "Review priorities and map out the key outcomes.", startDate: today(), dueDate: today(), priority: "High", status: "In progress", progress: 65, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "demo-2", title: "Prepare project outline", description: "Draft milestones, deliverables and owners.", startDate: today(), dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0,10), priority: "Medium", status: "Not started", progress: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "demo-3", title: "Review completed work", description: "Capture learnings and close out open items.", startDate: today(), dueDate: new Date(Date.now() - 86400000).toISOString().slice(0,10), priority: "Low", status: "Completed", progress: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const emptyForm = {
  title: "", description: "", startDate: today(),
  dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  priority: "Medium" as Priority, status: "Not started" as Status, progress: 0
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("All tasks");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) as Task[] : starterTasks);
    } catch { setTasks(starterTasks); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === "Completed").length;
    const active = tasks.filter(t => t.status === "In progress").length;
    const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < today()).length;
    const progress = tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;
    return { total: tasks.length, completed, active, overdue, progress };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "All tasks" ||
        (filter === "In progress" && task.status === "In progress") ||
        (filter === "Not started" && task.status === "Not started") ||
        (filter === "Completed" && task.status === "Completed") ||
        (filter === "Overdue" && task.status !== "Completed" && task.dueDate < today());
      return matchesQuery && matchesFilter;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "priority") return ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority);
      if (sortBy === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    });
  }, [tasks, filter, query, sortBy]);

  function openNew() {
    setEditingId(null); setForm(emptyForm); setShowForm(true);
  }
  function openEdit(task: Task) {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, priority: task.priority, status: task.status, progress: task.progress });
    setShowForm(true);
  }
  function saveTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const now = new Date().toISOString();
    const progress = form.status === "Completed" ? 100 : form.status === "Not started" ? Math.min(form.progress, 99) : form.progress;
    const status: Status = progress === 100 ? "Completed" : form.status === "Completed" ? "In progress" : form.status;
    if (editingId) {
      setTasks(current => current.map(t => t.id === editingId ? { ...t, ...form, progress, status, updatedAt: now } : t));
    } else {
      setTasks(current => [{ ...form, progress, status, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...current]);
    }
    setShowForm(false);
  }
  function updateProgress(task: Task, progress: number) {
    const status: Status = progress === 100 ? "Completed" : progress === 0 ? "Not started" : "In progress";
    setTasks(current => current.map(t => t.id === task.id ? { ...t, progress, status, updatedAt: new Date().toISOString() } : t));
  }
  function deleteTask(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) setTasks(current => current.filter(t => t.id !== id));
  }
  function exportTasks() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "taskflow-tasks.json"; link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={20} strokeWidth={3} /></div><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
        <button className="nav-item" onClick={() => setFilter("All tasks")}><ListTodo size={18} /> All tasks <span className="nav-count">{tasks.length}</span></button>
        <button className="nav-item" onClick={() => setFilter("In progress")}><Activity size={18} /> In progress</button>
        <button className="nav-item" onClick={() => setFilter("Completed")}><CheckCircle2 size={18} /> Completed</button>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16}/></div><strong>Small steps add up.</strong><p>Keep moving your tasks forward. Progress beats perfection.</p></div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><span>Personal account</span></div><MoreHorizontal size={18} className="muted-icon"/></div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="top-actions"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><button className="button button-primary top-add" onClick={openNew}><Plus size={17}/> New task</button></div>
        </header>

        <div className="page-wrap">
          <div className="welcome-row">
            <div><div className="eyebrow">YOUR PERSONAL DASHBOARD</div><h1>Good to see you.</h1><p className="subtitle">A clear view of what matters and what’s moving forward.</p></div>
            <button className="button button-secondary export-button" onClick={exportTasks}><Download size={16}/> Export data</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><div className="stat-icon purple"><ListTodo size={17}/></div></div><div className="stat-number">{stats.total}</div><div className="stat-foot">Across your workspace</div></div>
            <div className="stat-card"><div className="stat-top"><span>In progress</span><div className="stat-icon blue"><Activity size={17}/></div></div><div className="stat-number">{stats.active}</div><div className="stat-foot">Tasks you’re working on</div></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><div className="stat-icon green"><CheckCircle2 size={17}/></div></div><div className="stat-number">{stats.completed}</div><div className="stat-foot">Nicely done</div></div>
            <div className="stat-card"><div className="stat-top"><span>Overdue</span><div className="stat-icon orange"><Clock3 size={17}/></div></div><div className="stat-number">{stats.overdue}</div><div className="stat-foot">Need a little attention</div></div>
          </div>

          <div className="overview-grid">
            <section className="panel progress-panel">
              <div className="panel-heading"><div><h2>Overall progress</h2><p>Your progress across all tasks</p></div><div className="target-icon"><Target size={19}/></div></div>
              <div className="progress-main"><div className="progress-big">{stats.progress}<span>%</span></div><div className="progress-caption">average completion</div></div>
              <div className="large-progress-track"><div style={{ width: `${stats.progress}%` }}/></div>
              <div className="progress-legend"><span><i className="dot dot-green"/> Completed <b>{stats.completed}</b></span><span><i className="dot dot-blue"/> Active <b>{stats.active}</b></span><span><i className="dot dot-gray"/> To do <b>{tasks.filter(t => t.status === "Not started").length}</b></span></div>
            </section>
            <section className="panel focus-panel">
              <div className="panel-heading"><div><h2>Focus for today</h2><p>Tasks that need your attention</p></div><div className="focus-icon"><Flag size={18}/></div></div>
              {tasks.filter(t => t.status !== "Completed").sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0,3).length ? (
                <div className="focus-list">{tasks.filter(t => t.status !== "Completed").sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0,3).map(t => <div className="focus-item" key={t.id}><span className="focus-bullet"/><div className="focus-text"><strong>{t.title}</strong><span>Due {dateLabel(t.dueDate)}</span></div><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></div>)}</div>
              ) : <div className="focus-empty"><CheckCircle2 size={23}/><span>You’re all caught up. Great work!</span></div>}
            </section>
          </div>

          <section className="tasks-section">
            <div className="tasks-heading"><div><h2>Your tasks</h2><p>Manage deadlines, priorities and progress.</p></div><button className="button button-primary" onClick={openNew}><Plus size={17}/> Add a task</button></div>
            <div className="toolbar">
              <div className="filter-tabs">{["All tasks", "In progress", "Not started", "Completed", "Overdue"].map(item => <button key={item} onClick={() => setFilter(item)} className={filter === item ? "filter-tab selected" : "filter-tab"}>{item}{item === "All tasks" && <span>{tasks.length}</span>}</button>)}</div>
              <div className="toolbar-right"><div className="search-box"><Search size={16}/><input aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)}/></div><div className="sort-box"><ArrowDownUp size={15}/><select aria-label="Sort tasks" value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="createdAt">Recently added</option></select></div></div>
            </div>
            <div className="task-list">
              {visibleTasks.map(task => {
                const overdue = task.status !== "Completed" && task.dueDate < today();
                return <article className="task-row" key={task.id}>
                  <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} aria-label={task.status === "Completed" ? "Mark incomplete" : "Mark complete"} onClick={() => updateProgress(task, task.status === "Completed" ? 0 : 100)}>{task.status === "Completed" && <Check size={14}/>}</button>
                  <div className="task-info"><button className={`task-title ${task.status === "Completed" ? "is-complete" : ""}`} onClick={() => openEdit(task)}>{task.title}</button><p>{task.description || "No description added"}</p><div className="task-meta"><span><CalendarDays size={13}/> {dateLabel(task.startDate)} – {dateLabel(task.dueDate)}</span><span className={`priority priority-${task.priority.toLowerCase()}`}><i/> {task.priority} priority</span>{overdue && <span className="overdue-label">Overdue</span>}</div></div>
                  <div className="task-progress"><div className="task-progress-label"><span>{task.progress}%</span><span>{task.status}</span></div><div className="mini-track"><div style={{ width: `${task.progress}%` }}/></div><input aria-label={`Progress for ${task.title}`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e => updateProgress(task, Number(e.target.value))}/></div>
                  <div className="task-actions"><button aria-label="Edit task" title="Edit task" onClick={() => openEdit(task)}><MoreHorizontal size={19}/></button><button aria-label="Delete task" title="Delete task" onClick={() => deleteTask(task.id)}><Trash2 size={16}/></button></div>
                </article>;
              })}
              {visibleTasks.length === 0 && <div className="empty-state"><div className="empty-icon"><Circle size={25}/></div><h3>{query ? "No matching tasks" : "Nothing here just yet"}</h3><p>{query ? "Try another search term or change the filter." : "Add your first task and start tracking your progress."}</p>{!query && <button className="button button-primary" onClick={openNew}><Plus size={16}/> Create your first task</button>}</div>}
            </div>
            <div className="list-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><span><span className="live-dot"/> Saved automatically on this device</span></div>
          </section>
          <footer className="footer-note">Made for focused work <span>·</span> One task at a time.</footer>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-header"><div><div className="eyebrow">{editingId ? "UPDATE YOUR WORK" : "MAKE IT HAPPEN"}</div><h2>{editingId ? "Edit task" : "Create a task"}</h2></div><button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20}/></button></div>
          <label className="field-label">Task name <span>*</span><input autoFocus required maxLength={100} placeholder="e.g. Prepare monthly report" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label>
          <label className="field-label">Description <textarea rows={3} placeholder="Add a few details about this task..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>
          <div className="form-two"><label className="field-label">Start date<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}/></label><label className="field-label">Due date<input type="date" min={form.startDate} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label></div>
          <div className="form-two"><label className="field-label">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="field-label">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}><option>Not started</option><option>In progress</option><option>Completed</option></select></label></div>
          <label className="field-label range-field">Progress <strong>{form.status === "Completed" ? 100 : form.progress}%</strong><input type="range" min="0" max="100" step="5" value={form.status === "Completed" ? 100 : form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value), status: Number(e.target.value) === 100 ? "Completed" : Number(e.target.value) === 0 ? "Not started" : "In progress" })}/></label>
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button button-primary"><Check size={16}/>{editingId ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}
