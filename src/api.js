const API_URL = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;

// Generic API fetch helper
export async function apiFetch(url, options = {}) {
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // always include cookies
  });
}

// Auth
export async function login(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(email, password, role) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
  return res.json();
}

// Transactions
export async function submitTransaction(data) {
  const res = await apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

// Example: fetch users
export async function fetchUsers() {
  const res = await apiFetch('/users');
  return res.json();
}

// You can add more API helpers as needed, using apiFetch for consistency.
