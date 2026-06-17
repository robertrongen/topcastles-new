import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AdminEditorialOverviewComponent } from './admin-editorial-overview.component';
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

describe('AdminEditorialOverviewComponent', () => {
  let fixture: ComponentFixture<AdminEditorialOverviewComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: makeLocalStorageMock({ [ADMIN_TOKEN_KEY]: 'admin-token' }),
    });

    await TestBed.configureTestingModule({
      imports: [AdminEditorialOverviewComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminEditorialOverviewComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  it('loads publish status and renders recent edit summaries with editor links', () => {
    httpTesting.expectOne('/api/editorial/countries').flush({ france: {} });
    httpTesting.expectOne('/api/editorial/regions').flush({ rhine: {} });
    httpTesting.expectOne('/api/editorial/castle-quotes').flush({ krak: {} });
    httpTesting.expectOne('/api/editorial/period-picks').flush({ century12: {} });
    httpTesting.expectOne('/api/editorial/browse-bands').flush({ top100: {} });
    httpTesting.expectOne(req =>
      req.url === '/api/admin/backups' &&
      req.headers.get('Authorization') === 'Bearer admin-token'
    ).flush([
      {
        file: 'countries',
        timestamp: Date.parse('2026-05-10T12:30:00.000Z'),
        filename: 'countries-2026-05-10T12-30-00.json',
      },
    ]);
    httpTesting.expectOne(req =>
      req.url === '/api/admin/editorial/publish-status' &&
      req.headers.get('Authorization') === 'Bearer admin-token'
    ).flush({
      lastBuildAt: '2026-05-01T00:00:00.000Z',
      lastEditAt: '2026-05-10T12:30:00.000Z',
      needsRebuild: true,
      deployCommand: 'npm run build && git push',
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Snapshot saved before Countries was overwritten');
    expect(text).toContain('countries-2026-05-10T12-30-00.json');
    expect(text).toContain('system backup');
    expect(text).toContain('npm run build && git push');

    const recentLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('.recent-row__open');
    expect(recentLink?.getAttribute('ng-reflect-router-link')).toContain('/admin/editorial,countries');
  });
});
