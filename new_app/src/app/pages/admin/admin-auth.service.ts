import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const ADMIN_TOKEN_KEY   = 'topcastles.admin.token';
export const ADMIN_HANDLE_KEY  = 'topcastles.admin.handle';
export const ADMIN_TIME_KEY    = 'topcastles.admin.login-time';
export const ADMIN_EXPIRY_KEY  = 'topcastles.admin.trust-expiry';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  private readonly _token = signal<string | null>(null);

  constructor() {
    if (this.isBrowser) {
      this._token.set(localStorage.getItem(ADMIN_TOKEN_KEY));
    }
  }

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    if (!this.isBrowser) return false;
    const expiry = localStorage.getItem(ADMIN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry, 10)) return false;
    return true;
  });

  readonly handle = computed(() =>
    this.isBrowser ? (localStorage.getItem(ADMIN_HANDLE_KEY) || 'Editor') : 'Editor'
  );

  readonly loginTime = computed((): Date | null => {
    if (!this.isBrowser) return null;
    const ts = localStorage.getItem(ADMIN_TIME_KEY);
    return ts ? new Date(parseInt(ts, 10)) : null;
  });

  getToken(): string | null {
    return this._token();
  }

  getAuthHeaders(): { Authorization: string } | Record<string, never> {
    const token = this._token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async signIn(passphrase: string, handle: string, trust: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await firstValueFrom(
        this.http.get('/api/admin/health', {
          headers: { Authorization: `Bearer ${passphrase}` },
        })
      );
      if (this.isBrowser) {
        localStorage.setItem(ADMIN_TOKEN_KEY, passphrase);
        localStorage.setItem(ADMIN_HANDLE_KEY, handle.trim() || 'Editor');
        localStorage.setItem(ADMIN_TIME_KEY, Date.now().toString());
        if (trust) {
          localStorage.setItem(ADMIN_EXPIRY_KEY, (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
        } else {
          localStorage.removeItem(ADMIN_EXPIRY_KEY);
        }
      }
      this._token.set(passphrase);
      return { success: true };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        return { success: false, error: 'Unrecognised handle or passphrase. Try again.' };
      }
      return { success: false, error: 'Could not reach the annex server. Check your connection.' };
    }
  }

  clearSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_HANDLE_KEY);
      localStorage.removeItem(ADMIN_TIME_KEY);
      localStorage.removeItem(ADMIN_EXPIRY_KEY);
    }
    this._token.set(null);
  }
}
