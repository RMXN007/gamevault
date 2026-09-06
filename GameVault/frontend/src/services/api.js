const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('gamevaultUser');
    window.dispatchEvent(new Event('gamevault:auth-expired'));
  }
  if (!response.ok) {
    const error = new Error(data?.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export const gamesApi = {
  list: (params = {}) => request(`/games${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ''}`),
  home: (page = 1) => request(`/games/home?page=${page}`),
  search: (query, page = 1) => request(`/games/search?q=${encodeURIComponent(query)}&page=${page}`),
  genre: (genre, page = 1) => request(`/games/genre/${encodeURIComponent(genre)}?page=${page}`),
  get: (slug) => request(`/games/${encodeURIComponent(slug)}`),
  related: (slug) => request(`/games/${encodeURIComponent(slug)}/related`),
  create: (body) => request('/games', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/games/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/games/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminRawgSearch: (query, page = 1) => request(`/games/admin/rawg-search?q=${encodeURIComponent(query)}&page=${page}`),
  adminRawgAdd: (rawgId) => request('/games/admin/rawg-add', { method: 'POST', body: JSON.stringify({ rawgId }) }),
};

export const commentsApi = {
  list: (gameId) => request(`/games/${encodeURIComponent(gameId)}/comments`),
  create: (gameId, body) => request(`/games/${encodeURIComponent(gameId)}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  upvote: (id) => request(`/comments/${encodeURIComponent(id)}/upvote`, { method: 'POST' }),
};

export const usersApi = {
  login: (body) => request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/users/register', { method: 'POST', body: JSON.stringify(body) }),
  profile: () => request('/users/profile'),
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/users/password', { method: 'PUT', body: JSON.stringify(body) }),
  getPublicProfile: (username) => request(`/users/${encodeURIComponent(username)}`),
  getLibrary: () => request('/users/library'),
  addToLibrary: (gameId) => request(`/users/library/${encodeURIComponent(gameId)}`, { method: 'POST' }),
  removeFromLibrary: (gameId) => request(`/users/library/${encodeURIComponent(gameId)}`, { method: 'DELETE' }),
};

export const forumApi = {
  categories: () => request('/forum/categories'),
  threads: (params = {}) => request(`/forum/threads${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ''}`),
  thread: (id) => request(`/forum/threads/${id}`),
  createThread: (body) => request('/forum/threads', { method: 'POST', body: JSON.stringify(body) }),
  upvoteThread: (id) => request(`/forum/threads/${id}/upvote`, { method: 'POST' }),
  replies: (threadId) => request(`/forum/replies/${threadId}`),
  createReply: (body) => request('/forum/replies', { method: 'POST', body: JSON.stringify(body) }),
  upvoteReply: (id) => request(`/forum/replies/${id}/upvote`, { method: 'POST' }),
};

export const uploadsApi = {
  upload: (file) => { const body = new FormData(); body.append('image', file); return request('/upload', { method: 'POST', body }); },
  uploadMany: (files) => { const body = new FormData(); [...files].forEach((file) => body.append('images', file)); return request('/upload/multiple', { method: 'POST', body }); },
};

export { getToken };
