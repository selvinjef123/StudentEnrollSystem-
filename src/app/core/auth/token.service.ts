
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'enrollora_token';
  private readonly ROLE_KEY = 'enrollora_role';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setRole(role: string): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getRole(): string | null {
    const storedRole = localStorage.getItem(this.ROLE_KEY);
    if (storedRole) {
      return this.normalizeRole(storedRole);
    }

    const roleFromToken = this.getRoleFromToken();
    if (roleFromToken) {
      this.setRole(roleFromToken);
      return roleFromToken;
    }

    return null;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  hasToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodePayload(token);
      if (typeof payload.exp !== 'number') {
        return true;
      }

      if (payload.exp * 1000 <= Date.now()) {
        this.removeToken();
        return false;
      }

      return true;
    } catch {
      this.removeToken();
      return false;
    }
  }

  private normalizeRole(role: string): 'Administrator' | 'Student' | null {
    const normalized = role.trim().toLowerCase();
    if (normalized === 'administrator' || normalized === 'admin') {
      return 'Administrator';
    }
    if (normalized === 'student') {
      return 'Student';
    }
    return null;
  }

  private getRoleFromToken(): 'Administrator' | 'Student' | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodePayload(token);
      const role =
        payload['role'] ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return typeof role === 'string' ? this.normalizeRole(role) : null;
    } catch {
      return null;
    }
  }

  private decodePayload(token: string): Record<string, unknown> & { exp?: number } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT');
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json);
  }
}
