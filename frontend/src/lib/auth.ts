export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  subscription?: {
    plan: string;
    status: string;
    translationsLimit: number;
    translationsUsed: number;
  };
}

export function saveAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meps_token', token);
    localStorage.setItem('meps_user', JSON.stringify(user));
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('meps_token');
    localStorage.removeItem('meps_user');
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('meps_token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('meps_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getUser()?.role === 'ADMIN';
}
