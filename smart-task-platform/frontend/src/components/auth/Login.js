import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">⚡</span>
          <span className="auth-logo-text">TaskFlow</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>

        <div className="auth-demo">
          <p className="auth-demo-label">Demo credentials</p>
          <code>admin@demo.com / password123</code>
        </div>
      </div>
    </div>
  );
}
