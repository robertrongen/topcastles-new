import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { UserService } from './user.service';

// The global test-setup.ts installs a no-op localStorage mock.
// Tests that verify actual token storage override it with a real in-memory store.
function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  } as Storage;
}

function setup(platformId: string = 'browser'): {
  service: UserService;
  httpTesting: HttpTestingController;
} {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock() });
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: platformId },
    ],
  });
  return {
    service: TestBed.inject(UserService),
    httpTesting: TestBed.inject(HttpTestingController),
  };
}

describe('UserService', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ── Token storage ─────────────────────────────────────────────────────────

  describe('token storage (browser)', () => {
    it('getToken returns null when nothing is stored', () => {
      const { service, httpTesting } = setup();
      expect(service.getToken()).toBeNull();
      httpTesting.verify();
    });

    it('importToken persists the token and getToken retrieves it', () => {
      const { service, httpTesting } = setup();
      service.importToken('tok-abc');
      expect(service.getToken()).toBe('tok-abc');
      httpTesting.verify();
    });

    it('clearToken removes the stored token', () => {
      const { service, httpTesting } = setup();
      service.importToken('tok-abc');
      service.clearToken();
      expect(service.getToken()).toBeNull();
      httpTesting.verify();
    });
  });

  describe('token storage (server)', () => {
    it('getToken returns null on server because localStorage is not accessed', () => {
      const { service, httpTesting } = setup('server');
      // importToken does nothing on server (isPlatformBrowser is false)
      service.importToken('tok-abc');
      expect(service.getToken()).toBeNull();
      httpTesting.verify();
    });
  });

  // ── authHeaders ───────────────────────────────────────────────────────────

  describe('authHeaders', () => {
    it('returns empty object when no token is stored', () => {
      const { service, httpTesting } = setup();
      expect(service.authHeaders()).toEqual({});
      httpTesting.verify();
    });

    it('returns Authorization Bearer header when token is present', () => {
      const { service, httpTesting } = setup();
      service.importToken('bearer-tok');
      expect(service.authHeaders()).toEqual({ Authorization: 'Bearer bearer-tok' });
      httpTesting.verify();
    });
  });

  // ── getShareLink ──────────────────────────────────────────────────────────

  describe('getShareLink', () => {
    it('returns null when no token is stored', () => {
      const { service, httpTesting } = setup();
      expect(service.getShareLink()).toBeNull();
      httpTesting.verify();
    });

    it('returns a URL containing /favorites?token=<token> when token is present', () => {
      const { service, httpTesting } = setup();
      service.importToken('share-tok');
      const link = service.getShareLink();
      expect(link).toContain('/favorites?token=share-tok');
      httpTesting.verify();
    });

    it('returns null on server platform', () => {
      const { service, httpTesting } = setup('server');
      expect(service.getShareLink()).toBeNull();
      httpTesting.verify();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  // login() is the token-validation call: it sends the stored token to the server
  // and returns the user profile if the token is recognised.

  describe('login', () => {
    it('returns the user profile on 200', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let profile: any = undefined;
      service.login('valid-tok').then(p => { profile = p; });
      const req = httpTesting.expectOne('/api/user/login');
      expect(req.request.body).toEqual({ token: 'valid-tok' });
      req.flush({ id: 'u1', favorites: [] });
      flushMicrotasks();
      expect(profile).toEqual({ id: 'u1', favorites: [] });
      httpTesting.verify();
    }));

    it('returns null on 401 (token not recognised)', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let profile: any = 'sentinel';
      service.login('stale-tok').then(p => { profile = p; });
      httpTesting.expectOne('/api/user/login').flush(
        { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
      );
      flushMicrotasks();
      expect(profile).toBeNull();
      httpTesting.verify();
    }));

    it('throws on non-401 server error', fakeAsync(() => {
      const { service, httpTesting } = setup();
      let thrown: any = null;
      service.login('tok').catch(e => { thrown = e; });
      httpTesting.expectOne('/api/user/login').flush(
        { error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }
      );
      flushMicrotasks();
      expect(thrown).toBeTruthy();
      httpTesting.verify();
    }));
  });

  // ── ensureUser ────────────────────────────────────────────────────────────
  // ensureUser is the startup flow: validate stored token → re-register if stale or absent.

  describe('ensureUser', () => {
    it('validates stored token and keeps it when server confirms it', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.importToken('good-tok');
      service.ensureUser();
      httpTesting.expectOne('/api/user/login').flush({ id: 'u1', favorites: [] });
      flushMicrotasks();
      expect(service.getToken()).toBe('good-tok');
      httpTesting.verify();
    }));

    it('clears stale token and re-registers when login returns 401', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.importToken('stale-tok');
      service.ensureUser();
      httpTesting.expectOne('/api/user/login').flush(
        { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
      );
      flushMicrotasks();
      httpTesting.expectOne('/api/user/register').flush({ token: 'new-tok' });
      flushMicrotasks();
      expect(service.getToken()).toBe('new-tok');
      httpTesting.verify();
    }));

    it('registers a new anonymous user when no token is stored', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.ensureUser();
      httpTesting.expectOne('/api/user/register').flush({ token: 'fresh-tok' });
      flushMicrotasks();
      expect(service.getToken()).toBe('fresh-tok');
      httpTesting.verify();
    }));

    it('keeps the existing token on network error without re-registering', fakeAsync(() => {
      const { service, httpTesting } = setup();
      service.importToken('good-tok');
      service.ensureUser();
      httpTesting.expectOne('/api/user/login').error(new ProgressEvent('network error'));
      flushMicrotasks();
      expect(service.getToken()).toBe('good-tok');
      httpTesting.expectNone('/api/user/register');
      httpTesting.verify();
    }));

    it('is a no-op on server platform (no HTTP calls made)', fakeAsync(() => {
      const { service, httpTesting } = setup('server');
      service.ensureUser();
      flushMicrotasks();
      // Server platform: isPlatformBrowser is false, so no HTTP calls and no token stored.
      expect(service.getToken()).toBeNull();
      httpTesting.expectNone('/api/user/login');
      httpTesting.expectNone('/api/user/register');
      httpTesting.verify();
    }));
  });
});
