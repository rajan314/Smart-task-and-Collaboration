import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { ...state, user: action.payload.user, token: action.payload.token, error: null, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, token: null, loading: false };
    case 'UPDATE_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const verify = async () => {
      if (state.token) {
        try {
          const res = await authAPI.getMe();
          dispatch({ type: 'UPDATE_USER', payload: res.data.data });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    verify();
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.register({ name, email, password, role });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, message: msg };
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateUser = (user) => dispatch({ type: 'UPDATE_USER', payload: user });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
