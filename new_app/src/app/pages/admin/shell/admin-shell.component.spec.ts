import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminShellComponent } from './admin-shell.component';
import { ADMIN_EXPIRY_KEY, ADMIN_HANDLE_KEY, ADMIN_TIME_KEY, ADMIN_TOKEN_KEY } from '../admin-auth.service';

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

describe('AdminShellComponent', () => {
  let fixture: ComponentFixture<AdminShellComponent>;
  let component: AdminShellComponent;
  let router: Router;

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: makeLocalStorageMock({
        [ADMIN_TOKEN_KEY]:  'tok',
        [ADMIN_HANDLE_KEY]: 'Robert',
        [ADMIN_TIME_KEY]:   '1710000000000',
        [ADMIN_EXPIRY_KEY]: (Date.now() + 60_000).toString(),
      }),
    });
    document.documentElement.removeAttribute('data-theme');

    await TestBed.configureTestingModule({
      imports: [AdminShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AdminShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('forces data-theme="dark" while mounted', () => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('restores the prior data-theme on destroy', () => {
    fixture.destroy();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

    document.documentElement.setAttribute('data-theme', 'light');
    const next = TestBed.createComponent(AdminShellComponent);
    next.detectChanges();
    next.destroy();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('clears admin storage and navigates to login on sign out', () => {
    spyOn(router, 'navigate');

    component.signOut();

    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(ADMIN_HANDLE_KEY)).toBeNull();
    expect(localStorage.getItem(ADMIN_TIME_KEY)).toBeNull();
    expect(localStorage.getItem(ADMIN_EXPIRY_KEY)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('renders unimplemented reference rows as disabled non-links', () => {
    const disabledRows = fixture.nativeElement.querySelectorAll('.side-nav__row--disabled');
    expect(disabledRows.length).toBe(3);
    disabledRows.forEach((row: Element) => {
      expect(row.getAttribute('aria-disabled')).toBe('true');
      expect(row.getAttribute('href')).toBeNull();
      expect(row.getAttribute('routerLink')).toBeNull();
    });
  });
});
