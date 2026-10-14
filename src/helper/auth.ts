import type { User, AuthResponse } from './types.tsx';

const API_BASE = '/api.php';

export async function loginUser(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}?endpoint=login`, {
    method: 'POST',
    heademers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ e, password }),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.user) {
    throw new Error(data.error || 'Login gagal');
  }

  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function registerUser(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}?endpoint=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emai, password }),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.user) {
    throw new Error(data.error || 'Registrasi gagal');
  }

  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem('user');
}
