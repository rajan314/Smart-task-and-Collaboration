import React, { useEffect, useState } from 'react';
import { tasksAPI, projectsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskModal from './TaskModal';
import './Tasks.css';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [tRes, pRes] = await Promise.all([tasksAPI.getAll(), projectsAPI.getAll()]);
        setTasks(tRes.data.data);
        setProjects(pRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.project && t.project?._id !== filters.project) return false;
    return true;
  });

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <select className="form-select" style={{ width: 'auto' }}
          value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }}
          value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }}
          value={filters.project} onChange={e => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <h3>No tasks found</h3>
          <p>Adjust filters or create a new task</p>
        </div>
      ) : (
        <div className="task-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task._id}>
                  <td>
                    <div className="task-table-title">{task.title}</div>
                    {task.description && <div className="task-table-desc">{task.description.slice(0, 60)}…</div>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {task.project?.name || '—'}
                  </td>
                  <td><span className={`badge badge-${task.status}`}>{task.status}</span></td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {task.assignedTo?.name || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => { setEditTask(task); setShowModal(true); }}>Edit</button>
                      {(user?.role === 'admin' || user?.role === 'manager' || task.createdBy?._id === user?._id) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          projectId={editTask?.project?._id || (projects[0]?._id)}
          projectMembers={null}
          onClose={() => setShowModal(false)}
          onSave={(saved) => {
            if (editTask) setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
            else setTasks(prev => [saved, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
