import React, { useState } from 'react';
import { projectsAPI } from '../../services/api';

export default function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    dueDate: project?.dueDate ? project.dueDate.split('T')[0] : '',
    tags: project?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      dueDate: form.dueDate || undefined,
    };
    try {
      let res;
      if (project) res = await projectsAPI.update(project._id, payload);
      else res = await projectsAPI.create(payload);
      onSave(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
            <label className="form-label">Due date</label>
            <input className="form-input" type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="design, frontend, api" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : project ? 'Update' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
