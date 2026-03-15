import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getAll()
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await usersAPI.update(id, { role });
      setUsers(prev => prev.map(u => u._id === id ? res.data.data : u));
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div style={{ overflow: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.78rem' }}>
                      {getInitials(u.name)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <select
                    className="form-select"
                    style={{ width: 'auto', fontSize: '0.82rem', padding: '0.3rem 0.6rem' }}
                    value={u.role}
                    onChange={e => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className={`badge ${u.isActive ? 'badge-active' : 'badge-cancelled'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  {u.isActive && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
