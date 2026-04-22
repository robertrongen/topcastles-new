import { Injectable, inject } from '@angular/core';
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

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  async ensureUser(): Promise<void> {
    if (this.getToken()) return;
    await this.createUser();
  }

  async createUser(): Promise<void> {
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
}
