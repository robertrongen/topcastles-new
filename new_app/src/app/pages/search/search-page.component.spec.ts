import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageComponent } from './search-page.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'France',
    area: 'Alps',
    place: 'Paris',
    region: 'Ile-de-France',
    region_code: 'ile-de-france',
    latitude: 0,
    longitude: 0,
    founder: 'King Louis',
    era: 12,
    castle_type: 'Rock castle',
    castle_concept: 'Motte-and-bailey',
    condition: 'Intact',
    remarkable: '',
    description: 'A test castle',
    website: '',
    score_total: 50,
    score_visitors: 30,
    visitors: 10,
    ...overrides,
  };
}

describe('SearchPageComponent', () => {
  let fixture: ComponentFixture<SearchPageComponent>;
  let component: SearchPageComponent;
  let httpTesting: HttpTestingController;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alhambra', country: 'Spain', place: 'Granada', region: 'Andalucia', area: 'South Europe', castle_type: 'City castle', era: 13, founder: 'Muhammad I', score_total: 200 }),
    makeCastle({ castle_code: 'c2', castle_name: 'Carcassonne', country: 'France', place: 'Carcassonne', region: 'Languedoc', area: 'South Europe', castle_type: 'City castle', era: 12, founder: 'Trencavel', score_total: 180 }),
    makeCastle({ castle_code: 'c3', castle_name: 'Tower of London', country: 'England', place: 'London', region: 'London', area: 'British isles', castle_type: 'City castle', era: 11, founder: 'William I', score_total: 150, description: 'Famous prison' }),
    makeCastle({ castle_code: 'c4', castle_name: 'Muiderslot', country: 'Netherlands', place: 'Muiden', region: 'Noord-Holland', area: 'Benelux', castle_type: 'Water castle', castle_concept: 'Rectangular or polygonal', era: 13, founder: 'Floris V', condition: 'Rebuild/Restored', score_total: 100 }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/assets/data/castles.json');
    req.flush(castles);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the heading', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain('Search castles');
  });

  it('should not show results before searching', () => {
    expect(component.searched()).toBeFalse();
    const resultsSection = fixture.nativeElement.querySelector('.results-section');
    expect(resultsSection).toBeNull();
  });

  it('should search by name and show results', () => {
    component.name = 'Alhambra';
    component.onSearch();
    fixture.detectChanges();

    expect(component.searched()).toBeTrue();
    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c1');
  });

  it('should search by country', () => {
    component.country = 'France';
    component.onSearch();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c2');
  });

  it('should search by castle type', () => {
    component.castleType = 'Water castle';
    component.onSearch();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c4');
  });

  it('should search by era', () => {
    component.era = 11;
    component.onSearch();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c3');
  });

  it('should search by description text', () => {
    component.description = 'prison';
    component.onSearch();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c3');
  });

  it('should combine multiple criteria', () => {
    component.castleType = 'City castle';
    component.country = 'Spain';
    component.onSearch();

    expect(component.results().length).toBe(1);
    expect(component.results()[0].castle_code).toBe('c1');
  });

  it('should return empty results when nothing matches', () => {
    component.name = 'Nonexistent';
    component.onSearch();

    expect(component.results().length).toBe(0);
    fixture.detectChanges();
    const noResults = fixture.nativeElement.querySelector('.results-section p');
    expect(noResults.textContent).toContain('No castles found');
  });

  it('should reset all fields and results', () => {
    component.country = 'France';
    component.onSearch();
    expect(component.results().length).toBeGreaterThan(0);

    component.onReset();
    expect(component.name).toBe('');
    expect(component.country).toBe('');
    expect(component.era).toBeNull();
    expect(component.results().length).toBe(0);
    expect(component.searched()).toBeFalse();
  });

  it('should sort results by selected sort key', () => {
    component.castleType = 'City castle';
    component.sortKey = 'country';
    component.onSearch();

    expect(component.results().length).toBe(3);
    // Alphabetical by country: England, France, Spain
    expect(component.results()[0].country).toBe('England');
    expect(component.results()[1].country).toBe('France');
    expect(component.results()[2].country).toBe('Spain');
  });

  it('should populate country dropdown from data', () => {
    const countries = component.countries();
    expect(countries).toContain('France');
    expect(countries).toContain('Spain');
    expect(countries).toContain('England');
    expect(countries).toContain('Netherlands');
  });

  it('should populate castle type dropdown from data', () => {
    const types = component.castleTypes();
    expect(types).toContain('City castle');
    expect(types).toContain('Water castle');
  });
});
