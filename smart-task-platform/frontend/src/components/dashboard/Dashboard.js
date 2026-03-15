import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const STAT_COLORS = {
  projects: '#6366f1',
  tasks: '#3b82f6',
  done: '#10b981',
  progress: '#f59e0b',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getAll(),
        ]);
        setProjects(pRes.data.data);
        setTasks(tRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const myTasks = tasks.filter(t => t.assignedTo?._id === user?._id || t.assignedTo === user?._id);
  const recentProjects = projects.slice(0, 4);

  const stats = [
    { label: 'Total Projects', value: projects.length, color: STAT_COLORS.projects, icon: '◫' },
    { label: 'Total Tasks', value: tasks.length, color: STAT_COLORS.tasks, icon: '✓' },
    { label: 'Completed', value: doneTasks, color: STAT_COLORS.done, icon: '●' },
    { label: 'In Progress', value: inProgressTasks, color: STAT_COLORS.progress, icon: '◑' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good to see you, {user?.name?.split(' ')[0]}!</p>
        </div>
        <Link to="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label} style={{ '--stat-color': s.color }}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Projects */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◫</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started</p>
            </div>
          ) : (
            <div className="project-list">
              {recentProjects.map(p => (
                <Link to={`/projects/${p._id}`} key={p._id} className="project-item">
                  <div className="project-item-info">
                    <div className="project-item-name">{p.name}</div>
                    <div className="project-item-meta">
                      {p.members?.length || 0} members · {p.description?.slice(0, 50) || 'No description'}
                    </div>
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">My Tasks</h2>
            <Link to="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <h3>No tasks assigned</h3>
              <p>Tasks assigned to you will appear here</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.slice(0, 6).map(t => (
                <div key={t._id} className="task-item">
                  <div className="task-item-info">
                    <div className="task-item-title">{t.title}</div>
                    <div className="task-item-project">{t.project?.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    <span className={`badge badge-${t.status}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
