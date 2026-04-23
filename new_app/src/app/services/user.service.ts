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
  private registrationInFlight: Promise<boolean> | null = null;

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
      await this.registerAnonymousUser();
    } catch {
      // Backend unavailable (e.g. ng serve without Node server) - silent no-op
    }
  }

  async handleUnauthorized(): Promise<boolean> {
    if (!this.isBrowser) return false;
    this.clearToken();
    try {
      return await this.registerAnonymousUser();
    } catch {
      return false;
    }
  }

  async createUser(): Promise<void> {
    await this.registerAnonymousUser();
  }

  private async registerAnonymousUser(): Promise<boolean> {
    if (!this.isBrowser) return false;
    if (this.getToken()) return true;

    if (!this.registrationInFlight) {
      this.registrationInFlight = (async () => {
        const res = await firstValueFrom(
          this.http.post<{ token?: string }>('/api/user/register', {})
        );
        const token = typeof res?.token === 'string' ? res.token.trim() : '';
        if (!token) {
          throw new Error('Registration did not return a token');
        }
        this.setToken(token);
        return true;
      })().finally(() => {
        this.registrationInFlight = null;
      });
    }

    return this.registrationInFlight;
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
    return token ? `${window.location.origin}/favorites?token=${token}` : null;
  }

  importToken(token: string): void {
    this.setToken(token);
  }
}
