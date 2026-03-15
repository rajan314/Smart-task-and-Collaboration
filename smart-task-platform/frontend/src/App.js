import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import TaskList from './components/tasks/TaskList';
import UserList from './components/users/UserList';
import Profile from './components/auth/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"        element={<Dashboard />} />
        <Route path="projects"         element={<ProjectList />} />
        <Route path="projects/:id"     element={<ProjectDetail />} />
        <Route path="tasks"            element={<TaskList />} />
        <Route path="profile"          element={<Profile />} />
        <Route path="users"            element={<AdminRoute><UserList /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
