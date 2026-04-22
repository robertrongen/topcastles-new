import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CastlesPageComponent } from './castles-page.component';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { ViewModeService } from '../../services/view-mode.service';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'France',
    area: '',
    place: 'Paris',
    region: '',
    region_code: '',
    latitude: 0,
    longitude: 0,
    founder: '',
    era: null,
    castle_type: 'Hilltop castle',
    castle_concept: '',
    condition: '',
    remarkable: '',
    description: '',
    website: '',
    score_total: 50,
    score_visitors: 30,
    visitors: 10,
    ...overrides,
  };
}

describe('CastlesPageComponent', () => {
  let component: CastlesPageComponent;
  let fixture: ComponentFixture<CastlesPageComponent>;

  const mockCastles: Castle[] = [
    makeCastle({ position: 1, castle_code: 'krak',        castle_name: 'Krak des Chevaliers', country: 'Syria',   score_total: 500 }),
    makeCastle({ position: 2, castle_code: 'carcassonne', castle_name: 'Carcassonne',          country: 'France',  score_total: 480 }),
    makeCastle({ position: 3, castle_code: 'malbork',     castle_name: 'Malbork Castle',       country: 'Poland',  score_total: 460 }),
    makeCastle({ position: 4, castle_code: 'bodiam',      castle_name: 'Bodiam Castle',        country: 'England', score_total: 300 }),
  ];

  function setup(queryParams: Record<string, string> = {}): void {
    TestBed.configureTestingModule({
      imports: [CastlesPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({}), queryParams: of(queryParams) },
        },
      ],
    }).compileComponents();

    // Pre-seed the service so no HTTP request is needed
    TestBed.inject(CastleService).castles.set(mockCastles);

    fixture = TestBed.createComponent(CastlesPageComponent);
    component = fixture.componentInstance;
    TestBed.inject(ViewModeService).setMode('list');

    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should display all castles with score > 0', () => {
    setup();
    expect(component.filteredCastles().length).toBe(4);
  });

  it('should display castle names as links', () => {
    setup();
    expect(component.filteredCastles()[0].castle_name).toContain('Krak des Chevaliers');
  });

  it('should filter by country from query params', () => {
    setup({ country: 'France' });
    expect(component.country()).toBe('France');
    expect(component.filteredCastles().length).toBe(1);
  });

  it('should filter by name', () => {
    setup();
    component.name.set('malbork');
    fixture.detectChanges();
    expect(component.filteredCastles().length).toBe(1);
  });

  it('should show result count', () => {
    setup();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('4 castles found');
  });

  it('should show filtered result count', () => {
    setup({ country: 'Syria' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 castles found');
  });

  it('should populate country dropdown', () => {
    setup();
    const countries = component.countries();
    expect(countries).toContain('France');
    expect(countries).toContain('Syria');
    expect(countries).toContain('Poland');
    expect(countries).toContain('England');
  });

  // ── Phase 3.1: filter chips ────────────────────────────────────────────────

  it('activeFilters should be empty when no filters are set', () => {
    setup();
    expect(component.activeFilters().length).toBe(0);
  });

  it('activeFilters should contain a chip for each active filter', () => {
    setup();
    component.name.set('Castle');
    component.country.set('France');
    fixture.detectChanges();
    const labels = component.activeFilters().map(f => f.label);
    expect(labels).toContain('Name: Castle');
    expect(labels).toContain('Country: France');
    expect(labels.length).toBe(2);
  });

  it('chip clear function should remove that filter', () => {
    setup();
    component.name.set('Castle');
    component.country.set('France');
    fixture.detectChanges();
    component.activeFilters().find(f => f.label.startsWith('Name'))?.clear();
    fixture.detectChanges();
    expect(component.name()).toBe('');
    expect(component.country()).toBe('France');
    expect(component.activeFilters().length).toBe(1);
  });

  it('onReset should clear all filters and chips', () => {
    setup();
    component.name.set('foo');
    component.country.set('France');
    component.era.set(12);
    fixture.detectChanges();
    component.onReset();
    fixture.detectChanges();
    expect(component.activeFilters().length).toBe(0);
  });

  it('should render filter chips in the DOM when filters are active', () => {
    setup();
    component.country.set('France');
    fixture.detectChanges();
    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(chips.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('Country: France');
  });

  it('should not render filter chip bar when no filters are active', () => {
    setup();
    const filterBar = fixture.nativeElement.querySelector('.active-filters');
    expect(filterBar).toBeNull();
  });
});
