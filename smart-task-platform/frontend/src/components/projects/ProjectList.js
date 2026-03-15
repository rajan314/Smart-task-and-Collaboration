import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProjectModal from './ProjectModal';
import './Projects.css';

export default function ProjectList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const canCreate = ['admin', 'manager'].includes(user?.role);

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◫</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div className="project-card" key={p._id}>
              <div className="project-card-header">
                <Link to={`/projects/${p._id}`} className="project-card-name">{p.name}</Link>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </div>
              {p.description && (
                <p className="project-card-desc">{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</p>
              )}
              <div className="project-card-meta">
                <span className={`badge badge-${p.priority}`}>{p.priority}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {p.members?.length || 0} member{p.members?.length !== 1 ? 's' : ''}
                </span>
                {p.dueDate && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Due {new Date(p.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="project-card-footer">
                <div className="project-avatars">
                  {[{ user: p.owner }, ...(p.members || [])].slice(0, 4).map((m, i) => (
                    <div key={i} className="avatar project-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                      {(m.user?.name || '?')[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link to={`/projects/${p._id}`} className="btn btn-ghost btn-sm">View</Link>
                  {(user?.role === 'admin' || p.owner?._id === user?._id) && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditProject(p); setShowModal(true); }}>Edit</button>
                      {user?.role === 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Del</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => setShowModal(false)}
          onSave={(saved) => {
            if (editProject) setProjects(prev => prev.map(p => p._id === saved._id ? saved : p));
            else setProjects(prev => [saved, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
