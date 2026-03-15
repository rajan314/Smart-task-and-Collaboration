import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/projects',  icon: '◫', label: 'Projects' },
  { to: '/tasks',     icon: '✓', label: 'Tasks' },
];

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="nav-section-label" style={{ marginTop: '1.5rem' }}>Admin</div>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-user" onClick={() => setSidebarOpen(false)}>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </NavLink>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-right">
            <span className="topbar-greeting">
              Hello, <strong>{user?.name?.split(' ')[0]}</strong>
            </span>
            <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.7rem' }}>
              {user?.role}
            </span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
