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
    position: 1, castle_code: 'test', castle_name: 'Test Castle', country: 'France',
    area: '', place: '', region: '', region_code: '', latitude: 0, longitude: 0,
    founder: '', era: null, castle_type: '', castle_concept: '', condition: '',
    score_total: 50, score_visitors: 7.0, visitors: 100,
    position_ref: null, score_ref: null,
    ...overrides,
  };
}

const castles: Castle[] = [
  makeCastle({ castle_code: 'c1', castle_name: 'Chateau A', country: 'France', score_total: 100, score_ref: 80, visitors: 200, score_visitors: 8.0 }),
  makeCastle({ castle_code: 'c2', castle_name: 'Chateau B', country: 'France', score_total: 90,  score_ref: 70, visitors: 150, score_visitors: 7.5 }),
  makeCastle({ castle_code: 'c3', castle_name: 'Burg C',    country: 'Germany', score_total: 80, score_ref: 90, visitors: 50,  score_visitors: 6.0 }),
];

describe('TopCountriesPageComponent', () => {
  let fixture: ComponentFixture<TopCountriesPageComponent>;
  let httpTesting: HttpTestingController;

  function flushEditorial(data: Record<string, unknown> = {}): void {
    httpTesting.expectOne('/api/editorial/castle-quotes').flush({});
    httpTesting.expectOne('/api/editorial/countries').flush(data);
    httpTesting.expectOne('/api/editorial/period-picks').flush({});
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
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Top countries');
  });

  it('should render one row per country', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should default sort by editorial rank — France first', () => {
    const first = fixture.componentInstance.rows()[0];
    expect(first.country).toBe('France');
    expect(first.overallRank).toBe(1);
  });

  it('should compute editorial rank from sum(score_ref)', () => {
    const rows = fixture.componentInstance.rows();
    // Germany: sumScoreRef=90 > France: sumScoreRef=150 — France has higher sumScoreRef
    // France: 80+70=150, Germany: 90 → France editorial rank 1, Germany 2
    const france = rows.find(r => r.country === 'France')!;
    const germany = rows.find(r => r.country === 'Germany')!;
    expect(france.editorialRank).toBe(1);
    expect(germany.editorialRank).toBe(2);
  });

  it('should compute visitor rank from sum(visitors)', () => {
    const rows = fixture.componentInstance.rows();
    // France: 200+150=350, Germany: 50 → France visitor rank 1
    const france = rows.find(r => r.country === 'France')!;
    expect(france.visitorRank).toBe(1);
  });

  it('should compute disagreement as |visitorRank - editorialRank|', () => {
    const rows = fixture.componentInstance.rows();
    // Both France and Germany rank 1/2 in both dimensions → disagreement 0
    const france = rows.find(r => r.country === 'France')!;
    expect(france.disagreement).toBe(0);
  });

  it('should sort by editorial rank when button clicked', () => {
    fixture.componentInstance.setSort('editorial');
    fixture.detectChanges();
    expect(fixture.componentInstance.rows()[0].country).toBe('France');
  });

  it('should sort by visitor rank when button clicked', () => {
    fixture.componentInstance.setSort('visitor');
    fixture.detectChanges();
    expect(fixture.componentInstance.rows()[0].country).toBe('France');
  });

  it('should identify top entry as highest score_total castle in country', () => {
    const france = fixture.componentInstance.rows().find(r => r.country === 'France')!;
    expect(france.topCastleCode).toBe('c1');
    expect(france.topCastleName).toBe('Chateau A');
  });

  it('should compute meanVisitorScore as weighted average', () => {
    const france = fixture.componentInstance.rows().find(r => r.country === 'France')!;
    // (8.0*200 + 7.5*150) / (200+150) = (1600+1125)/350 = 2725/350 ≈ 7.786
    expect(france.meanVisitorScore).toBeCloseTo(7.786, 2);
  });

  it('should show sleeper badge when editorSleeper is true', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [TopCountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http2 = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set([
      makeCastle({ castle_code: 's1', castle_name: 'Krak', country: 'Syria', score_total: 5 }),
    ]);
    const f2 = TestBed.createComponent(TopCountriesPageComponent);
    f2.detectChanges();
    http2.expectOne('/api/editorial/castle-quotes').flush({});
    http2.expectOne('/api/editorial/countries').flush({ 'Syria': { editorSleeper: true } });
    http2.expectOne('/api/editorial/period-picks').flush({});
    f2.detectChanges();
    const badge = f2.nativeElement.querySelector('.sleeper-tag');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('EDITOR\'S SLEEPER');
    http2.verify();
  });

  it('should not show flag or country code in country cell', () => {
    const cell = fixture.nativeElement.querySelector('td a');
    expect(cell?.textContent?.trim()).toBe('France');
  });

  it('should apply top-rank class to first 3 rows', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    // We only have 2 countries in test data, so only those 2 should have class if i < 3 condition applies
    const topRankRows = fixture.nativeElement.querySelectorAll('tbody tr.top-rank');
    expect(topRankRows.length).toBe(Math.min(2, 3)); // min(2 actual rows, 3 top rank limit)
  });
});
