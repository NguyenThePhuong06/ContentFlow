const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = localStorage.getItem('token');

  // If no token in development mode, provide a default demo dev token
  if (!token) {
    token = 'dev-token-contentflow-demo';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.details || errorBody.error || `HTTP error ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
