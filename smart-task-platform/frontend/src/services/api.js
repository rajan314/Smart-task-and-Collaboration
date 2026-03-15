import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/updatepassword', data),
};

// ── Users ─────────────────────────────────────────
export const usersAPI = {
  getAll:    ()         => API.get('/users'),
  getById:   (id)       => API.get(`/users/${id}`),
  update:    (id, data) => API.put(`/users/${id}`, data),
  delete:    (id)       => API.delete(`/users/${id}`),
};

// ── Projects ──────────────────────────────────────
export const projectsAPI = {
  getAll:       ()            => API.get('/projects'),
  getById:      (id)          => API.get(`/projects/${id}`),
  create:       (data)        => API.post('/projects', data),
  update:       (id, data)    => API.put(`/projects/${id}`, data),
  delete:       (id)          => API.delete(`/projects/${id}`),
  addMember:    (id, data)    => API.post(`/projects/${id}/members`, data),
  removeMember: (id, userId)  => API.delete(`/projects/${id}/members/${userId}`),
  getTasks:     (id)          => API.get(`/projects/${id}/tasks`),
};

// ── Tasks ─────────────────────────────────────────
export const tasksAPI = {
  getAll:     (params) => API.get('/tasks', { params }),
  getById:    (id)     => API.get(`/tasks/${id}`),
  create:     (data)   => API.post('/tasks', data),
  update:     (id, data) => API.put(`/tasks/${id}`, data),
  delete:     (id)     => API.delete(`/tasks/${id}`),
  addComment: (id, data) => API.post(`/tasks/${id}/comments`, data),
};

export default API;
