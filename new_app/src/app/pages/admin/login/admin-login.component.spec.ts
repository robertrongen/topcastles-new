import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID, Component } from '@angular/core';
import { AdminLoginComponent } from './admin-login.component';

@Component({ template: '', standalone: true })
class StubComponent {}

function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  } as Storage;
}

describe('AdminLoginComponent', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;
  let component: AdminLoginComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock() });
    document.documentElement.removeAttribute('data-theme');

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'admin/editorial', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forces data-theme="dark" on the document root on init', () => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('removes data-theme when no prior theme was set, on destroy', () => {
    fixture.destroy();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('restores the previous data-theme on destroy', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const f2 = TestBed.createComponent(AdminLoginComponent);
    f2.detectChanges(); // ngOnInit sets dark and records 'light'
    f2.destroy();       // ngOnDestroy restores 'light'
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  // ── Successful sign-in ────────────────────────────────────────────────────

  it('navigates to /admin/editorial on successful sign-in', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.passphrase = 'good-token';
    component.handle = 'Robert';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
    flushMicrotasks();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/editorial']);
  }));

  it('does not show an error after a successful sign-in', fakeAsync(() => {
    component.passphrase = 'good-token';
    component.handle = 'Robert';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
    flushMicrotasks();
    expect(component.error()).toBeNull();
  }));

  // ── Failed sign-in ────────────────────────────────────────────────────────

  it('sets an error signal on 401', fakeAsync(() => {
    component.passphrase = 'wrong-token';
    component.handle = 'Robert';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush(
      { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' },
    );
    flushMicrotasks();
    expect(component.error()).toContain('Unrecognised');
  }));

  it('sets an error signal on network failure', fakeAsync(() => {
    component.passphrase = 'any-token';
    component.submit();
    httpTesting.expectOne('/api/admin/health').error(new ProgressEvent('network error'));
    flushMicrotasks();
    expect(component.error()).toContain('Could not reach');
  }));

  it('does not navigate on a failed sign-in', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.passphrase = 'wrong-token';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush(
      { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' },
    );
    flushMicrotasks();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  // ── Error clearing ────────────────────────────────────────────────────────

  it('clears the error when the user edits the passphrase after a failure', fakeAsync(() => {
    component.passphrase = 'wrong-token';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush(
      { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' },
    );
    flushMicrotasks();
    expect(component.error()).toBeTruthy();
    component.onPassphraseInput();
    expect(component.error()).toBeNull();
  }));

  it('does nothing in onPassphraseInput when there is no error', () => {
    expect(component.error()).toBeNull();
    component.onPassphraseInput();
    expect(component.error()).toBeNull();
  });

  // ── Loading guard ─────────────────────────────────────────────────────────

  it('does not fire a second request while a sign-in is in flight', fakeAsync(() => {
    component.passphrase = 'tok';
    component.submit(); // starts first request
    expect(component.loading()).toBe(true);
    component.submit(); // ignored — loading is true
    // expectOne throws if 0 or more-than-1 requests are pending
    httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
    flushMicrotasks();
  }));

  it('resets loading to false after a successful sign-in', fakeAsync(() => {
    component.passphrase = 'tok';
    component.submit();
    expect(component.loading()).toBe(true);
    httpTesting.expectOne('/api/admin/health').flush({ status: 'ok', auth: 'admin' });
    flushMicrotasks();
    expect(component.loading()).toBe(false);
  }));

  it('resets loading to false after a failed sign-in', fakeAsync(() => {
    component.passphrase = 'tok';
    component.submit();
    httpTesting.expectOne('/api/admin/health').flush(
      { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' },
    );
    flushMicrotasks();
    expect(component.loading()).toBe(false);
  }));
});
