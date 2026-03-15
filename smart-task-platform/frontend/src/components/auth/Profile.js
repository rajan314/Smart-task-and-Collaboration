import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../services/api';
import './Auth.css';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    setLoading(true);
    try {
      const res = await usersAPI.update(user._id, { name: form.name });
      updateUser(res.data.data);
      setMsg('Profile updated!');
    } catch (error) {
      setErr(error.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (pwForm.newPassword.length < 6) { setErr('New password must be at least 6 chars'); return; }
    setLoading(true);
    try {
      await authAPI.updatePassword(pwForm);
      setMsg('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      {/* Avatar + info */}
      <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.4rem' }}>
          {getInitials(user?.name)}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
          <span className={`badge badge-${user?.role}`} style={{ marginTop: '0.4rem' }}>{user?.role}</span>
        </div>
      </div>

      {/* Update name */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Edit Profile</h3>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Change Password</h3>
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-input" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-input" type="password" value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
