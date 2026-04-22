import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Meta, Title } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { CastleDetailPageComponent } from './castle-detail-page.component';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { createActivatedRouteMock } from '../../../testing/activated-route.mock';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'krak',
    castle_name: 'Krak des Chevaliers',
    country: 'Syria',
    area: 'Asia, Outside Europe, Crusades',
    place: 'Homs',
    region: 'Homs Governorate',
    region_code: 'homs-governorate',
    latitude: 34.7575,
    longitude: 36.2937,
    founder: 'Knights Hospitaller',
    era: 12,
    castle_type: 'Hilltop castle',
    castle_concept: 'Concentric castle',
    condition: 'Damaged',
    remarkable: 'Best preserved Crusader castle',
    description: 'The most famous Crusader castle in the world.',
    website: 'https://example.com',
    score_total: 500,
    score_visitors: 8.5,
    visitors: 120,
    ...overrides,
  };
}

describe('CastleDetailPageComponent', () => {
  let component: CastleDetailPageComponent;
  let fixture: ComponentFixture<CastleDetailPageComponent>;
  let httpTesting: HttpTestingController;

  const mockCastles: Castle[] = [
    makeCastle({ position: 1, castle_code: 'krak',        castle_name: 'Krak des Chevaliers', country: 'Syria',   score_total: 500, latitude: 34.76, longitude: 36.29 }),
    makeCastle({ position: 2, castle_code: 'carcassonne', castle_name: 'Carcassonne',          country: 'France',  score_total: 480, latitude: 43.21, longitude: 2.36  }),
    makeCastle({ position: 3, castle_code: 'malbork',     castle_name: 'Malbork Castle',       country: 'Poland',  score_total: 460, latitude: 54.04, longitude: 19.03 }),
    makeCastle({ position: 4, castle_code: 'aleppo',      castle_name: 'Citadel of Aleppo',    country: 'Syria',   score_total: 440, latitude: 36.20, longitude: 37.16 }),
  ];

  function setupWithCode(code: string, castlesData = mockCastles): void {
    TestBed.configureTestingModule({
      imports: [CastleDetailPageComponent, MatSnackBarModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        // Use 'server' to skip isPlatformBrowser guards (Leaflet, user/favorites in component)
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMock({ code }),
        },
      ],
    });

    // Pre-seed castles so getCastleByCode works without HTTP loading
    const castleService = TestBed.inject(CastleService);
    castleService.castles.set(castlesData);

    fixture = TestBed.createComponent(CastleDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    // Handle loadEnrichedData() which runs regardless of platform
    httpTesting.match('/assets/data/castles_delta.json').forEach(r => r.flush([]));
    fixture.detectChanges();
  }

  afterEach(() => {
    httpTesting?.verify();
  });

  it('should create', () => {
    setupWithCode('krak');
    expect(component).toBeTruthy();
  });

  it('should display the castle name', () => {
    setupWithCode('krak');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Krak des Chevaliers');
  });

  it('should display metadata fields', () => {
    setupWithCode('krak');
    const text: string = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('position 1');
    expect(text).toContain('500');
    expect(text).toContain('Syria');
    expect(text).toContain('Knights Hospitaller');
    expect(text).toContain('Hilltop castle');
    expect(text).toContain('Concentric castle');
    expect(text).toContain('12th century');
    expect(text).toContain('Damaged');
  });

  it('should display description and remarkable sections', () => {
    setupWithCode('krak');
    const text: string = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('The most famous Crusader castle');
    expect(text).toContain('Best preserved Crusader castle');
  });

  it('should show Google Maps link when coordinates exist', () => {
    setupWithCode('krak');
    expect(fixture.nativeElement.querySelector('a[href*="maps.google"]')).toBeTruthy();
  });

  it('should show website link', () => {
    setupWithCode('krak');
    expect(fixture.nativeElement.querySelector('a[href="https://example.com"]')).toBeTruthy();
  });

  it('should show "not found" for unknown castle code', () => {
    setupWithCode('nonexistent');
    expect(fixture.nativeElement.textContent).toContain('Castle not found');
  });

  it('should compute prev/next castles in top 100', () => {
    setupWithCode('carcassonne');
    expect(component.prevCastle()?.castle_code).toBe('krak');
    expect(component.nextCastle()?.castle_code).toBe('malbork');
  });

  it('should compute prev/next castles within same country', () => {
    setupWithCode('aleppo');
    expect(component.prevInCountry()?.castle_code).toBe('krak');
    expect(component.nextInCountry()).toBeUndefined();
  });

  it('should show navigation links', () => {
    setupWithCode('carcassonne');
    expect(fixture.nativeElement.querySelectorAll('.castle-nav a').length).toBeGreaterThan(0);
  });

  // ── Phase 2.5: star rating ─────────────────────────────────────────────────

  it('starSegments should produce 5 segments for any score > 0', () => {
    setupWithCode('krak');
    expect(component.starSegments().length).toBe(5);
  });

  it('starSegments should be all full stars for score 10', () => {
    const castles = [makeCastle({ castle_code: 'krak', score_visitors: 10, visitors: 1 })];
    setupWithCode('krak', castles);
    expect(component.starSegments().every(s => s === 'full')).toBeTrue();
  });

  it('starSegments should be empty for score 0', () => {
    setupWithCode('krak', [makeCastle({ castle_code: 'krak', score_visitors: 0, visitors: 0 })]);
    expect(component.starSegments().length).toBe(0);
  });

  it('should show star icons in DOM when visitors > 0', () => {
    setupWithCode('krak');
    const stars = fixture.nativeElement.querySelectorAll('.star-rating mat-icon');
    expect(stars.length).toBe(5);
  });

  it('should show "No rating" when visitors is 0', () => {
    setupWithCode('krak', [makeCastle({ castle_code: 'krak', visitors: 0, score_visitors: 0 })]);
    expect(fixture.nativeElement.textContent).toContain('No rating');
  });

  // ── Phase 2.6: nearby castles ──────────────────────────────────────────────

  it('nearbyCastles should exclude the current castle', () => {
    setupWithCode('krak');
    const codes = component.nearbyCastles().map(n => n.castle.castle_code);
    expect(codes).not.toContain('krak');
  });

  it('nearbyCastles should return at most 5 results', () => {
    setupWithCode('krak');
    expect(component.nearbyCastles().length).toBeLessThanOrEqual(5);
  });

  it('nearbyCastles should be sorted by distance ascending', () => {
    setupWithCode('krak');
    const distances = component.nearbyCastles().map(n => n.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('nearbyCastles should return empty array when castle has no coordinates', () => {
    setupWithCode('krak', [makeCastle({ castle_code: 'krak', latitude: null as any, longitude: null as any })]);
    expect(component.nearbyCastles().length).toBe(0);
  });

  // ── Phase 2.2: Wikipedia section ──────────────────────────────────────────

  it('should show Wikipedia section when extract is present', () => {
    const castles = [makeCastle({ castle_code: 'krak', wikipedia_extract: 'A great castle.', wikipedia_url: 'https://en.wikipedia.org/wiki/Krak' })];
    setupWithCode('krak', castles);
    expect(fixture.nativeElement.textContent).toContain('A great castle.');
    expect(fixture.nativeElement.querySelector('a[href*="wikipedia.org"]')).toBeTruthy();
  });

  it('should not show Wikipedia section when extract is absent', () => {
    setupWithCode('krak');
    expect(fixture.nativeElement.textContent).not.toContain('From Wikipedia');
  });

  // ── Phase 2.3: enrichment badges ──────────────────────────────────────────

  it('should show heritage badge when heritage_status is present', () => {
    const castles = [makeCastle({ castle_code: 'krak', heritage_status: 'UNESCO World Heritage Site' })];
    setupWithCode('krak', castles);
    expect(fixture.nativeElement.textContent).toContain('UNESCO World Heritage Site');
  });

  it('should show architectural style badge when present', () => {
    const castles = [makeCastle({ castle_code: 'krak', architectural_style: 'Romanesque' })];
    setupWithCode('krak', castles);
    expect(fixture.nativeElement.textContent).toContain('Romanesque');
  });

  it('should not show badge row when no enrichment data', () => {
    setupWithCode('krak');
    expect(fixture.nativeElement.querySelector('.badge-row')).toBeNull();
  });

  // ── Phase 4.1: breadcrumb ──────────────────────────────────────────────────

  it('should show breadcrumb with Home, Castles, country and castle name', () => {
    setupWithCode('krak');
    const breadcrumb = fixture.nativeElement.querySelector('nav.breadcrumb');
    expect(breadcrumb).toBeTruthy();
    const text: string = breadcrumb.textContent ?? '';
    expect(text).toContain('Home');
    expect(text).toContain('Castles');
    expect(text).toContain('Syria');
    expect(text).toContain('Krak des Chevaliers');
  });

  // ── Phase 4.2: SEO meta tags ───────────────────────────────────────────────

  it('should set page title from castle name', () => {
    setupWithCode('krak');
    const title = TestBed.inject(Title);
    expect(title.getTitle()).toContain('Krak des Chevaliers');
  });

  it('should set og:title meta tag', () => {
    setupWithCode('krak');
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('property="og:title"')?.content).toContain('Krak des Chevaliers');
  });

  it('should set description from wikipedia_extract when present', () => {
    const castles = [makeCastle({ castle_code: 'krak', wikipedia_extract: 'A famous Crusader fortress built in the 12th century.' })];
    setupWithCode('krak', castles);
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="description"')?.content).toContain('Crusader fortress');
  });

  it('should set og:image when wikipedia_thumbnail is present', () => {
    const castles = [makeCastle({ castle_code: 'krak', wikipedia_thumbnail: 'https://example.com/img.jpg' })];
    setupWithCode('krak', castles);
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('property="og:image"')?.content).toBe('https://example.com/img.jpg');
  });
});
