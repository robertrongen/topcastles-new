import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const TOKEN_KEY = 'tc_user_token';

export interface UserProfile {
  id: string;
  favorites: unknown[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
  }

  async ensureUser(): Promise<void> {
    if (!this.isBrowser || this.getToken()) return;
    try {
      await this.createUser();
    } catch {
      // Backend unavailable (e.g. ng serve without Node server) — silent no-op
    }
  }

  async handleUnauthorized(): Promise<void> {
    if (!this.isBrowser) return;
    this.clearToken();
    try {
      await this.createUser();
    } catch {
      // silent
    }
  }

  async createUser(): Promise<void> {
    if (!this.isBrowser) return;
    const res = await firstValueFrom(
      this.http.post<{ token: string }>('/api/user/register', {})
    );
    this.setToken(res.token);
  }

  async getMe(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;
    return firstValueFrom(
      this.http.get<UserProfile>('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  }

  authHeaders(): { Authorization: string } | Record<string, never> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getShareLink(): string | null {
    if (!this.isBrowser) return null;
    const token = this.getToken();
    return token ? `${window.location.origin}/account?token=${token}` : null;
  }

  importToken(token: string): void {
    this.setToken(token);
  }
}
