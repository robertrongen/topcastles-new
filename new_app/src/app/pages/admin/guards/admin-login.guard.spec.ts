import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { adminLoginGuard } from './admin-login.guard';
import { ADMIN_TOKEN_KEY } from '../admin-auth.service';

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

describe('adminLoginGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('returns true (allows access to login page) when not authenticated', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => adminLoginGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /admin/editorial when already authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => adminLoginGuard({} as any, {} as any));
    expect(result instanceof UrlTree).toBe(true);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/admin/editorial']));
  });
});
