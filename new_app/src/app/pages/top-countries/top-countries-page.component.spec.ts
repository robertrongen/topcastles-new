import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TopCountriesPageComponent } from './top-countries-page.component';
import { Castle } from '../../models/castle.model';
import { CastleService } from '../../services/castle.service';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test', country: 'France',
    area: '', place: '', region: 'Loire', region_code: '', latitude: 0, longitude: 0,
    founder: '', era: null, castle_type: '', castle_concept: '', condition: '',
    remarkable: '', description: '', website: '', score_total: 50,
    score_visitors: null, visitors: null, ...overrides,
  };
}

const castles: Castle[] = [
  makeCastle({ castle_code: 'c1', country: 'France', score_total: 100 }),
  makeCastle({ castle_code: 'c2', country: 'France', score_total: 90 }),
  makeCastle({ castle_code: 'c3', country: 'Germany', score_total: 80 }),
];

describe('TopCountriesPageComponent', () => {
  let fixture: ComponentFixture<TopCountriesPageComponent>;
  let httpTesting: HttpTestingController;

  function flushEditorial(data: Record<string, unknown> = {}): void {
    httpTesting.expectOne('/api/editorial/castle-quotes').flush({});
    httpTesting.expectOne('/api/editorial/countries').flush(data);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set(castles);
    fixture = TestBed.createComponent(TopCountriesPageComponent);
    fixture.detectChanges();
    flushEditorial();
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  it('should display the heading', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('countries with the most top castles');
  });

  it('should render one row per country', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should sort by visitor rank when visitor button is clicked', () => {
    fixture.componentInstance.setSort('visitor');
    fixture.detectChanges();
    expect(fixture.componentInstance.rows()[0].country).toBe('France');
    expect(fixture.componentInstance.rows()[1].country).toBe('Germany');
  });

  it('should show sleeper badge when editorSleeper is true', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [TopCountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http2 = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set([
      makeCastle({ castle_code: 's1', country: 'Syria', score_total: 5 }),
    ]);
    const f2 = TestBed.createComponent(TopCountriesPageComponent);
    f2.detectChanges();
    http2.expectOne('/api/editorial/castle-quotes').flush({});
    http2.expectOne('/api/editorial/countries').flush({
      'Syria': { editorialRank: 1, editorSleeper: true, topEntry: 'sy001' },
    });
    f2.detectChanges();
    const badge = f2.nativeElement.querySelector('.sleeper-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('Sleeper');
    http2.verify();
  });

  it('should compute meanScore from scored castles only', () => {
    const rows = fixture.componentInstance.rows();
    const france = rows.find(r => r.country === 'France')!;
    // Both France castles have score_total > 0: (100 + 90) / 2 = 95
    expect(france.meanScore).toBeCloseTo(95);
  });

  it('should compute disagreement when editorial rank is set', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [TopCountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http2 = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set(castles);
    const f2 = TestBed.createComponent(TopCountriesPageComponent);
    f2.detectChanges();
    http2.expectOne('/api/editorial/castle-quotes').flush({});
    // France is visitor rank 1; editorial rank 3 → disagreement = 2
    http2.expectOne('/api/editorial/countries').flush({
      'France': { editorialRank: 3 },
    });
    f2.detectChanges();
    const france = f2.componentInstance.rows().find(r => r.country === 'France')!;
    expect(france.disagreement).toBe(2);
    http2.verify();
  });
});
