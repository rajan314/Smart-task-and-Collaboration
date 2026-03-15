import React, { useState, useEffect } from 'react';
import { tasksAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TaskModal({ task, projectId, projectMembers, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    project: projectId || task?.project?._id || task?.project || '',
  });
  const [members, setMembers] = useState(projectMembers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If no projectMembers passed, try to load users
    if (!projectMembers && user?.role === 'admin') {
      usersAPI.getAll().then(res => {
        setMembers(res.data.data.map(u => ({ user: u })));
      }).catch(() => {});
    }
  }, []); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined };
    try {
      let res;
      if (task) res = await tasksAPI.update(task._id, payload);
      else res = await tasksAPI.create(payload);
      onSave(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task title *</label>
            <input className="form-input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required placeholder="What needs to be done?" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="More details about this task…" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign to</label>
            <select className="form-select" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map(m => m.user && (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due date</label>
            <input className="form-input" type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
