import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TopRegionsPageComponent } from './top-regions-page.component';
import { Castle } from '../../models/castle.model';
import { CastleService } from '../../services/castle.service';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test', country: 'France',
    area: '', place: '', region: 'Loire', region_code: 'loire', latitude: 0, longitude: 0,
    founder: '', era: null, castle_type: '', castle_concept: '', condition: '',
    remarkable: '', description: '', website: '', score_total: 50,
    score_visitors: 7, visitors: 100, position_ref: null, score_ref: 50,
    ...overrides,
  };
}

const castles: Castle[] = [
  makeCastle({ castle_code: 'c1', country: 'France', region: 'Loire', region_code: 'loire', score_total: 100, score_ref: 80, visitors: 80 }),
  makeCastle({ castle_code: 'c2', country: 'France', region: 'Loire', region_code: 'loire', score_total: 90, score_ref: 70, visitors: 60 }),
  makeCastle({ castle_code: 'c3', country: 'Germany', region: 'Bavaria', region_code: 'bavaria', score_total: 80, score_ref: 90, visitors: 300 }),
  makeCastle({ castle_code: 'c4', country: 'Spain', region: 'Castilla y León', region_code: 'castilla_y_leon', score_total: 10, score_ref: 10, visitors: 10 }),
];

describe('TopRegionsPageComponent', () => {
  let fixture: ComponentFixture<TopRegionsPageComponent>;
  let httpTesting: HttpTestingController;

  function flushEditorial(regions: Record<string, unknown> = {}): void {
    httpTesting.expectOne('/api/editorial/castle-quotes').flush({});
    httpTesting.expectOne('/api/editorial/countries').flush({});
    httpTesting.expectOne('/api/editorial/period-picks').flush({});
    httpTesting.expectOne('/api/editorial/regions').flush(regions);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRegionsPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set(castles);
    fixture = TestBed.createComponent(TopRegionsPageComponent);
    fixture.detectChanges();
    flushEditorial();
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  it('should display the atlas heading', () => {
    const h1 = fixture.nativeElement.querySelector('h1.page-head');
    expect(h1?.textContent).toContain('Top regions');
  });

  it('should render one atlas card per country-scoped region', () => {
    const cards = fixture.nativeElement.querySelectorAll('mat-card.region-card');
    expect(cards.length).toBe(3);
  });

  it('should show catalogue numerals and rank pair data', () => {
    const card = fixture.nativeElement.querySelector('mat-card.region-card');
    expect(card.textContent).toContain('No. 01');
    expect(card.textContent).toContain('Editorial');
    expect(card.textContent).toContain('Visitor');
  });

  it('should load region maps using the jpg format', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.region-locator img');
    expect(img.getAttribute('src')).toBe('/images/maps/loire.jpg');
  });

  it('should use the exact region_code as the image filename', () => {
    const images = [...fixture.nativeElement.querySelectorAll('.region-locator img')] as HTMLImageElement[];
    expect(images.some(img => img.getAttribute('src') === '/images/maps/castilla_y_leon.jpg')).toBeTrue();
  });

  it('should compute editorial and visitor ranks independently', () => {
    const loire = fixture.componentInstance.rows().find(row => row.region === 'Loire')!;
    const bavaria = fixture.componentInstance.rows().find(row => row.region === 'Bavaria')!;

    expect(loire.editorialRank).toBe(1);
    expect(bavaria.visitorRank).toBe(1);
    expect(loire.visitorRank).toBe(2);
  });

  it('should default to editorial sort order', () => {
    const firstCard = fixture.nativeElement.querySelector('mat-card.region-card');
    expect(fixture.componentInstance.sortMode()).toBe('editorial');
    expect(firstCard.textContent).toContain('Loire');
  });

  it('should sort cards by visitor rank', () => {
    fixture.componentInstance.setSort('visitor');
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('mat-card.region-card');
    expect(firstCard.textContent).toContain('Bavaria');
  });

  it('should sort cards by highest rank disagreement first', () => {
    fixture.componentInstance.setSort('disagreement');
    fixture.detectChanges();

    const ordered = fixture.componentInstance.sortedRows();
    expect(ordered[0].disagreement).toBeGreaterThanOrEqual(ordered[ordered.length - 1].disagreement);
  });

  it('should gracefully omit editorial prose when the overlay is empty', () => {
    expect(fixture.nativeElement.querySelector('.editorial-note')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('2 entries');
  });

  it('should render editorial descriptions and sleeper badges from regions overlay', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [TopRegionsPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const http2 = TestBed.inject(HttpTestingController);
    TestBed.inject(CastleService).castles.set(castles);
    const f2 = TestBed.createComponent(TopRegionsPageComponent);
    f2.detectChanges();
    http2.expectOne('/api/editorial/castle-quotes').flush({});
    http2.expectOne('/api/editorial/countries').flush({});
    http2.expectOne('/api/editorial/period-picks').flush({});
    http2.expectOne('/api/editorial/regions').flush({
      loire: {
        description: 'A river catalogue of royal and defensive houses.',
        editorSleeper: true,
      },
    });
    f2.detectChanges();

    expect(f2.nativeElement.querySelector('.editorial-note')?.textContent)
      .toContain('A river catalogue');
    expect(f2.nativeElement.querySelector('.sleeper-tag')?.textContent.trim())
      .toBe('EDITOR\'S SLEEPER');
    http2.verify();
  });
});
