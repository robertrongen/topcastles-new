import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CountriesPageComponent } from './countries-page.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'france',
    area: '',
    place: 'Paris',
    region: 'Ile-de-France',
    latitude: 0,
    longitude: 0,
    founder: '',
    era: null,
    castle_type: '',
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

describe('CountriesPageComponent', () => {
  let fixture: ComponentFixture<CountriesPageComponent>;
  let component: CountriesPageComponent;
  let httpTesting: HttpTestingController;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', country: 'France', region: 'Loire', score_total: 100 }),
    makeCastle({ castle_code: 'c2', country: 'France', region: 'Loire', score_total: 90 }),
    makeCastle({ castle_code: 'c3', country: 'Germany', region: 'Bavaria', score_total: 80 }),
    makeCastle({ castle_code: 'c4', country: 'Germany', region: 'Rhineland', score_total: 70 }),
    makeCastle({ castle_code: 'c5', country: 'Spain', region: 'Castilla', score_total: 60 }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CountriesPageComponent);
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

  it('should display the top countries heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    const heading = el.querySelector('h2');
    expect(heading?.textContent).toContain('countries with the most top castles');
  });

  it('should render country rows in the table', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tables = el.querySelectorAll('table');
    const countryRows = tables[0]?.querySelectorAll('tr.mat-mdc-row');
    expect(countryRows?.length).toBe(3); // France, Germany, Spain
  });

  it('should show country names as links', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tables = el.querySelectorAll('table');
    const links = tables[0]?.querySelectorAll('td.mat-column-country a');
    expect(links?.length).toBe(3);
  });

  it('should render region rows in the second table', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tables = el.querySelectorAll('table');
    const regionRows = tables[1]?.querySelectorAll('tr.mat-mdc-row');
    expect(regionRows?.length).toBe(4); // Loire, Bavaria, Rhineland, Castilla
  });

  it('should compute country summaries sorted by totalScore desc', () => {
    const summaries = component.countrySummaries();
    expect(summaries[0].country).toBe('France');
    expect(summaries[0].castleCount).toBe(2);
    expect(summaries[0].totalScore).toBe(190);
    expect(summaries[1].country).toBe('Germany');
  });

  it('should sort countries when onCountrySort is called', () => {
    component.onCountrySort({ active: 'castleCount', direction: 'asc' });
    expect(component.sortedCountries[0].country).toBe('Spain');
  });

  it('should reset sortedCountries when sort is cleared', () => {
    component.onCountrySort({ active: 'castleCount', direction: 'asc' });
    expect(component.sortedCountries.length).toBe(3);
    component.onCountrySort({ active: '', direction: '' });
    expect(component.sortedCountries.length).toBe(0);
  });
});
