import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import {
  AdminAuthService,
  ADMIN_TOKEN_KEY,
  ADMIN_HANDLE_KEY,
  ADMIN_TIME_KEY,
  ADMIN_EXPIRY_KEY,
} from './admin-auth.service';

function makeLocalStorageMock(initial: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...initial };
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  } as Storage;
}

function setup(platformId = 'browser', initial: Record<string, string> = {}): {
  service: AdminAuthService;
  httpTesting: HttpTestingController;
} {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock(initial) });
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: platformId },
    ],
  });
  return {
    service:     TestBed.inject(AdminAuthService),
    httpTesting: TestBed.inject(HttpTestingController),
  };
}

describe('AdminAuthService', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ── isAuthenticated ────────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns false when no token is stored', () => {
      const { service, httpTesting } = setup();
      expect(service.isAuthenticated()).toBe(false);
      httpTesting.verify();
    });

    it('returns true when a token is stored with no expiry', () => {
      const { service, httpTesting } = setup('browser', { [ADMIN_TOKEN_KEY]: 'tok' });
      expect(service.isAuthenticated()).toBe(true);
      httpTesting.verify();
    });

    it('returns true when a token is stored with a future expiry', () => {
      const expiry = (Date.now() + 60_000).toString();
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]: 'tok',
        [ADMIN_EXPIRY_KEY]: expiry,
      });
      expect(service.isAuthenticated()).toBe(true);
      httpTesting.verify();
    });

    it('returns false when the trust expiry has passed', () => {
      const expiry = (Date.now() - 1000).toString();
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]: 'tok',
        [ADMIN_EXPIRY_KEY]: expiry,
      });
      expect(service.isAuthenticated()).toBe(false);
      httpTesting.verify();
    });

    it('clears an expired stored session on startup', () => {
      const expiry = (Date.now() - 1000).toString();
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]:  'tok',
        [ADMIN_HANDLE_KEY]: 'Robert',
        [ADMIN_TIME_KEY]:   '12345',
        [ADMIN_EXPIRY_KEY]: expiry,
      });
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_TIME_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_EXPIRY_KEY)).toBeNull();
      httpTesting.verify();
    });

    it('returns false on server platform even when a token is stored', () => {
      const { service, httpTesting } = setup('server', { [ADMIN_TOKEN_KEY]: 'tok' });
      expect(service.isAuthenticated()).toBe(false);
      httpTesting.verify();
    });
  });

  // ── handle ─────────────────────────────────────────────────────────────────

  describe('handle', () => {
    it('returns stored handle', () => {
      const { service } = setup('browser', { [ADMIN_HANDLE_KEY]: 'Robert' });
      expect(service.handle()).toBe('Robert');
    });

    it('returns "Editor" as default when no handle is stored', () => {
      const { service } = setup();
      expect(service.handle()).toBe('Editor');
    });

    it('returns "Editor" on server platform', () => {
      const { service } = setup('server', { [ADMIN_HANDLE_KEY]: 'Robert' });
      expect(service.handle()).toBe('Editor');
    });
  });

  // ── loginTime ──────────────────────────────────────────────────────────────

  describe('loginTime', () => {
    it('returns null when no login-time is stored', () => {
      const { service } = setup();
      expect(service.loginTime()).toBeNull();
    });

    it('returns a Date when login-time is stored', () => {
      const now = Date.now();
      const { service } = setup('browser', { [ADMIN_TIME_KEY]: now.toString() });
      expect(service.loginTime()).toEqual(new Date(now));
    });

    it('returns null on server platform', () => {
      const now = Date.now();
      const { service } = setup('server', { [ADMIN_TIME_KEY]: now.toString() });
      expect(service.loginTime()).toBeNull();
    });
  });

  // ── getAuthHeaders ─────────────────────────────────────────────────────────

  describe('getAuthHeaders', () => {
    it('returns empty object when no token is stored', () => {
      const { service } = setup();
      expect(service.getAuthHeaders()).toEqual({});
    });

    it('returns Authorization Bearer header when a token is stored', () => {
      const { service } = setup('browser', { [ADMIN_TOKEN_KEY]: 'my-token' });
      expect(service.getAuthHeaders()).toEqual({ Authorization: 'Bearer my-token' });
    });

    it('does not return Authorization header for an expired token', () => {
      const { service } = setup('browser', {
        [ADMIN_TOKEN_KEY]:  'my-token',
        [ADMIN_EXPIRY_KEY]: (Date.now() - 1000).toString(),
      });
      expect(service.getAuthHeaders()).toEqual({});
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    });
  });

  // ── signIn ─────────────────────────────────────────────────────────────────

  describe('signIn', () => {
    it('returns success and persists token when server returns 200', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let result: any;
      service.signIn('good-tok', 'Robert', false).then(r => { result = r; });
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      expect(result).toEqual({ success: true });
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe('good-tok');
      expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBe('Robert');
      expect(localStorage.getItem(ADMIN_TIME_KEY)).toBeTruthy();
      httpTesting.verify();
    }));

    it('does not store a trust expiry when trust=false', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.signIn('tok', 'Robert', false).then(() => {});
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      expect(localStorage.getItem(ADMIN_EXPIRY_KEY)).toBeNull();
      httpTesting.verify();
    }));

    it('stores a 7-day trust expiry when trust=true', fakeAsync(() => {
      const { service, httpTesting } = setup();
      const before = Date.now();
      service.signIn('tok', 'Robert', true).then(() => {});
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      const expiry = parseInt(localStorage.getItem(ADMIN_EXPIRY_KEY)!, 10);
      expect(expiry).toBeGreaterThanOrEqual(before + 7 * 24 * 60 * 60 * 1000 - 1000);
      httpTesting.verify();
    }));

    it('makes the service authenticated after a successful sign-in', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.signIn('tok', 'Robert', false).then(() => {});
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      expect(service.isAuthenticated()).toBe(true);
      httpTesting.verify();
    }));

    it('returns failure message on 401', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let result: any;
      service.signIn('wrong-tok', 'Robert', false).then(r => { result = r; });
      httpTesting.expectOne('/api/admin/health').flush(
        { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' },
      );
      flushMicrotasks();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unrecognised');
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
      httpTesting.verify();
    }));

    it('returns failure message on 403', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let result: any;
      service.signIn('wrong-tok', 'Robert', false).then(r => { result = r; });
      httpTesting.expectOne('/api/admin/health').flush(
        { error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' },
      );
      flushMicrotasks();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unrecognised');
      httpTesting.verify();
    }));

    it('returns a connection error message on network failure', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let result: any;
      service.signIn('tok', 'Robert', false).then(r => { result = r; });
      httpTesting.expectOne('/api/admin/health').error(new ProgressEvent('network error'));
      flushMicrotasks();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not reach');
      httpTesting.verify();
    }));

    it('trims whitespace from handle before storing', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.signIn('tok', '  Robert  ', false).then(() => {});
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBe('Robert');
      httpTesting.verify();
    }));

    it('falls back to "Editor" when handle is blank', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.signIn('tok', '   ', false).then(() => {});
      httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
      flushMicrotasks();
      expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBe('Editor');
      httpTesting.verify();
    }));
  });

  // ── clearSession ───────────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('removes all admin localStorage keys', () => {
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]:  'tok',
        [ADMIN_HANDLE_KEY]: 'Robert',
        [ADMIN_TIME_KEY]:   '12345',
        [ADMIN_EXPIRY_KEY]: '99999',
      });
      service.clearSession();
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_TIME_KEY)).toBeNull();
      expect(localStorage.getItem(ADMIN_EXPIRY_KEY)).toBeNull();
      httpTesting.verify();
    });

    it('makes the service no longer authenticated', () => {
      const { service, httpTesting } = setup('browser', { [ADMIN_TOKEN_KEY]: 'tok' });
      expect(service.isAuthenticated()).toBe(true);
      service.clearSession();
      expect(service.isAuthenticated()).toBe(false);
      httpTesting.verify();
    });
  });

  describe('handleUnauthorized', () => {
    it('clears the session for 401 and reports it handled', () => {
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]: 'tok',
      });
      expect(service.handleUnauthorized(401)).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
      httpTesting.verify();
    });

    it('clears the session for 403 and reports it handled', () => {
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]: 'tok',
      });
      expect(service.handleUnauthorized(403)).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
      httpTesting.verify();
    });

    it('leaves the session untouched for non-auth statuses', () => {
      const { service, httpTesting } = setup('browser', {
        [ADMIN_TOKEN_KEY]: 'tok',
      });
      expect(service.handleUnauthorized(500)).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
      httpTesting.verify();
    });
  });
});
