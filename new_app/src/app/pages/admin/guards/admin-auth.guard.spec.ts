import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { adminAuthGuard } from './admin-auth.guard';
import { ADMIN_EXPIRY_KEY, ADMIN_TOKEN_KEY } from '../admin-auth.service';

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

function setup(authenticated: boolean) {
  const initial: Record<string, string> = authenticated ? { [ADMIN_TOKEN_KEY]: 'valid-tok' } : {};
  Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock(initial) });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });
}

function setupWithStorage(initial: Record<string, string>) {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock(initial) });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });
}

describe('adminAuthGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('returns true when the user is authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => adminAuthGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('returns a UrlTree redirecting to /admin/login when not authenticated', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => adminAuthGuard({} as any, {} as any));
    expect(result instanceof UrlTree).toBe(true);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/admin/login']));
  });

  it('redirects to /admin/login and clears storage when the token is expired', () => {
    setupWithStorage({
      [ADMIN_TOKEN_KEY]:  'expired-tok',
      [ADMIN_EXPIRY_KEY]: (Date.now() - 1000).toString(),
    });
    const result = TestBed.runInInjectionContext(() => adminAuthGuard({} as any, {} as any));
    expect(result instanceof UrlTree).toBe(true);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/admin/login']));
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
  });
});
