// Simple API helper using fetch with base URL and auth token support
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function getAuthHeaders() {
  const token = window.localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', data, headers = {}, credentials = 'include' } = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...getAuthHeaders(),
      ...headers,
    },
    credentials,
    cache: 'no-store',
  };
  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }
  const res = await fetch(`${API_BASE}${path}`, options);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;
  if (!res.ok) {
    const message = payload?.error || payload?.message || `Request failed with ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, data, opts) => request(path, { ...opts, method: 'POST', data }),
  put: (path, data, opts) => request(path, { ...opts, method: 'PUT', data }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
