import type { User, AuthResponse } from './types.tsx';

const API_BASE = '/api.php';

export async function loginUser(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}?endpoint=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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
    body: JSON.stringify({ email, password }),
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

/**
 * Ambil session_hash dari user yang sedang login.
 * Return null jika belum login atau tidak ada hash.
 */
export function getSessionHash(): string | null {
  const user = getCurrentUser();
  return user?.session_hash ?? null;
}

/**
 * Verifikasi session_hash ke backend, memastikan masih valid.
 */
export async function verifySessionHash(hash: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}?endpoint=verify_session&hash=${encodeURIComponent(hash)}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export function logoutUser(): void {
  const hash = getSessionHash();
  if (hash) {
    // Invalidate session_hash di database agar tidak bisa dipakai ulang
    fetch(`${API_BASE}?endpoint=logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_hash: hash }),
    }).catch(() => {
      // Abaikan kegagalan jaringan saat logout
    });
  }
  localStorage.removeItem('user');
}
