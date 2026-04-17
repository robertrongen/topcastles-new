import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CastleDetailPageComponent } from './castle-detail-page.component';
import { Castle } from '../../models/castle.model';

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
    makeCastle({ position: 1, castle_code: 'krak', castle_name: 'Krak des Chevaliers', country: 'Syria', score_total: 500 }),
    makeCastle({ position: 2, castle_code: 'carcassonne', castle_name: 'Carcassonne', country: 'France', score_total: 480 }),
    makeCastle({ position: 3, castle_code: 'malbork', castle_name: 'Malbork Castle', country: 'Poland', score_total: 460 }),
    makeCastle({ position: 4, castle_code: 'aleppo', castle_name: 'Citadel of Aleppo', country: 'Syria', score_total: 440 }),
  ];

  function setupWithCode(code: string): void {
    TestBed.configureTestingModule({
      imports: [CastleDetailPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ code }), queryParams: of({}) },
        },
      ],
    });

    fixture = TestBed.createComponent(CastleDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/castles.json').flush(mockCastles);
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
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Krak des Chevaliers');
  });

  it('should display metadata fields', () => {
    setupWithCode('krak');
    const el: HTMLElement = fixture.nativeElement;
    const text = el.textContent ?? '';
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
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('The most famous Crusader castle');
    expect(el.textContent).toContain('Best preserved Crusader castle');
  });

  it('should show Google Maps link when coordinates exist', () => {
    setupWithCode('krak');
    const el: HTMLElement = fixture.nativeElement;
    const mapLink = el.querySelector('a[href*="maps.google"]');
    expect(mapLink).toBeTruthy();
  });

  it('should show website link', () => {
    setupWithCode('krak');
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('a[href="https://example.com"]');
    expect(link).toBeTruthy();
  });

  it('should show "not found" for unknown castle code', () => {
    setupWithCode('nonexistent');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Castle not found');
  });

  it('should compute prev/next castles in top 100', () => {
    setupWithCode('carcassonne');
    expect(component.prevCastle()?.castle_code).toBe('krak');
    expect(component.nextCastle()?.castle_code).toBe('malbork');
  });

  it('should compute prev/next castles within same country', () => {
    setupWithCode('aleppo');
    // Krak and Aleppo are both in Syria
    expect(component.prevInCountry()?.castle_code).toBe('krak');
    expect(component.nextInCountry()).toBeUndefined();
  });

  it('should show navigation links', () => {
    setupWithCode('carcassonne');
    const el: HTMLElement = fixture.nativeElement;
    const navLinks = el.querySelectorAll('.castle-nav a');
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it('should show visitor rating when visitors > 0', () => {
    setupWithCode('krak');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('120 visitors');
  });

  it('should show "No rating" when visitors is 0', () => {
    setupWithCode('krak');
    // Override the data with 0 visitors
    const noVisitorCastles = mockCastles.map(c =>
      c.castle_code === 'malbork' ? { ...c, visitors: 0, score_visitors: 0 } : c
    );
    // Re-setup with malbork
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CastleDetailPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ code: 'malbork' }), queryParams: of({}) },
        },
      ],
    });
    fixture = TestBed.createComponent(CastleDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/castles.json').flush(noVisitorCastles);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No rating');
  });
});
