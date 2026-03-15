import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskModal from '../tasks/TaskModal';
import ProjectModal from './ProjectModal';
import './Projects.css';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  const fetchProject = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getTasks(id),
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [id]); // eslint-disable-line

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      usersAPI.getAll().then(res => setAllUsers(res.data.data)).catch(() => {});
    }
  }, [user]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    const found = allUsers.find(u => u.email.toLowerCase() === addMemberEmail.toLowerCase());
    if (!found) { setMemberError('User not found'); return; }
    try {
      const res = await projectsAPI.addMember(id, { userId: found._id });
      setProject(res.data.data);
      setAddMemberEmail('');
    } catch (err) { setMemberError(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await projectsAPI.removeMember(id, userId);
      setProject(res.data.data);
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const { tasksAPI } = await import('../../services/api');
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  if (!project) return <div className="empty-state"><h3>Project not found</h3></div>;

  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;
  const canManage = user?.role === 'admin' || isOwner;

  const tasksByStatus = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'review': tasks.filter(t => t.status === 'review'),
    'done': tasks.filter(t => t.status === 'done'),
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: '0.5rem' }}>
            ← Projects
          </button>
          <h1 className="page-title">{project.name}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
            <span className={`badge badge-${project.priority}`}>{project.priority}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canManage && <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>Edit</button>}
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
            + Add Task
          </button>
        </div>
      </div>

      {project.description && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {project.description}
        </p>
      )}

      <div className="detail-grid">
        {/* Kanban columns */}
        <div className="kanban-board">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="kanban-column">
              <div className="kanban-col-header">
                <span className={`badge badge-${status}`}>{status.replace('-', ' ')}</span>
                <span className="kanban-count">{statusTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {statusTasks.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No tasks
                  </div>
                )}
                {statusTasks.map(task => (
                  <div key={task._id} className="kanban-task">
                    <div className="kanban-task-title">{task.title}</div>
                    {task.description && (
                      <div className="kanban-task-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</div>
                    )}
                    <div className="kanban-task-footer">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.assignedTo && (
                        <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                          {getInitials(task.assignedTo.name)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditTask(task); setShowTaskModal(true); }}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Members */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Team Members
            </h3>
            <div className="member-list">
              <div className="member-item">
                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                  {getInitials(project.owner?.name)}
                </div>
                <div className="member-info">
                  <div className="member-name">{project.owner?.name}</div>
                  <div className="member-role">Owner</div>
                </div>
              </div>
              {project.members?.map(m => (
                <div key={m.user?._id} className="member-item">
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {getInitials(m.user?.name)}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{m.user?.name}</div>
                    <div className="member-role">{m.role}</div>
                  </div>
                  {canManage && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(m.user?._id)}
                      style={{ marginLeft: 'auto', color: 'var(--danger)', fontSize: '0.75rem' }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canManage && (
              <form onSubmit={handleAddMember} style={{ marginTop: '0.75rem' }}>
                {memberError && <div className="alert alert-error" style={{ marginBottom: '0.5rem' }}>{memberError}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" placeholder="Member email"
                    value={addMemberEmail} onChange={e => setAddMemberEmail(e.target.value)} style={{ fontSize: '0.82rem' }} />
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                </div>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '0.95rem' }}>Info</h3>
            <div className="info-list">
              {project.dueDate && (
                <div className="info-item">
                  <span className="info-label">Due Date</span>
                  <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Created</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tasks</span>
                <span>{tasks.length} total · {tasksByStatus.done.length} done</span>
              </div>
              {project.tags?.length > 0 && (
                <div className="info-item" style={{ alignItems: 'flex-start' }}>
                  <span className="info-label">Tags</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {project.tags.map(tag => (
                      <span key={tag} style={{ background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          projectMembers={[{ user: project.owner }, ...(project.members || [])]}
          onClose={() => setShowTaskModal(false)}
          onSave={(saved) => {
            if (editTask) setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
            else setTasks(prev => [saved, ...prev]);
            setShowTaskModal(false);
          }}
        />
      )}
      {showEditModal && (
        <ProjectModal project={project} onClose={() => setShowEditModal(false)}
          onSave={(saved) => { setProject(saved); setShowEditModal(false); }} />
      )}
    </div>
  );
}
