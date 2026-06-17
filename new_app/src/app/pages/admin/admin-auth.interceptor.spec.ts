import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ADMIN_TOKEN_KEY } from './admin-auth.service';
import { adminUnauthorizedInterceptor } from './admin-auth.interceptor';

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

function setup() {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: makeLocalStorageMock({ [ADMIN_TOKEN_KEY]: 'tok' }),
  });

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(withInterceptors([adminUnauthorizedInterceptor])),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpTesting: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

describe('adminUnauthorizedInterceptor', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('clears admin session and redirects when an admin API returns 401 inside admin routes', () => {
    const { http, httpTesting, router } = setup();
    Object.defineProperty(router, 'url', { configurable: true, get: () => '/admin/pipeline' });
    spyOn(router, 'navigate');

    http.get('/api/admin/health').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/admin/health').flush(
      { error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    httpTesting.verify();
  });

  it('clears admin session on 403 admin API responses', () => {
    const { http, httpTesting, router } = setup();
    Object.defineProperty(router, 'url', { configurable: true, get: () => '/admin/castles' });
    spyOn(router, 'navigate');

    http.get('/api/admin/castles').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/admin/castles').flush(
      { error: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    httpTesting.verify();
  });

  it('leaves the admin session alone for public API 401 responses', () => {
    const { http, httpTesting, router } = setup();
    spyOn(router, 'navigate');

    http.get('/api/user/me').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/user/me').flush(
      { error: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe('tok');
    expect(router.navigate).not.toHaveBeenCalled();
    httpTesting.verify();
  });
});
