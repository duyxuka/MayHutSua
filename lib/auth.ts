import { jwtDecode } from 'jwt-decode';

function isClient() {
  return typeof window !== 'undefined';
}

export function saveTokens(accessToken: string, refreshToken?: string) {
  if (!isClient()) return;
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
}

export function getAccessToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('refresh_token');
}

export function logout() {
  if (!isClient()) return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function isTokenExpired(): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn(): boolean {
  if (!isClient()) return false;
  return !!getAccessToken() && !isTokenExpired();
}

export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub;
  } catch {
    return null;
  }
}

export function getUserNameFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.given_name || decoded.preferred_username || null;
  } catch {
    return null;
  }
}