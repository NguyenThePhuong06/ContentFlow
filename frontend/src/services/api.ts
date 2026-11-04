const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      window.dispatchEvent(new Event('contentflow:unauthorized'));
    }
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.details || errorBody.error || `HTTP error ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
