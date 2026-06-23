const BASE_URL = 'http://localhost:3000/api';

async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit = {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  };

  let response = await fetch(`${BASE_URL}${input}`, options);

  if (response.status === 401) {
    const data = await response.clone().json().catch(() => ({}));

    if (data?.message === "TOKEN_EXPIRED") {
      const refreshed = await refreshToken();
      if (refreshed) {
        response = await fetch(`${BASE_URL}${input}`, options);
      }
    }
   
    return response;
  }

  return response;
}

const api = {
  get: (url: string, init?: RequestInit) =>
    apiFetch(url, { ...init, method: 'GET' }),
  post: (url: string, body?: unknown, init?: RequestInit) =>
    apiFetch(url, { ...init, method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body?: unknown, init?: RequestInit) =>
    apiFetch(url, { ...init, method: 'PUT', body: JSON.stringify(body) }),
  patch: (url: string, body?: unknown, init?: RequestInit) =>
    apiFetch(url, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string, init?: RequestInit) =>
    apiFetch(url, { ...init, method: 'DELETE' }),
};

export default api;

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}