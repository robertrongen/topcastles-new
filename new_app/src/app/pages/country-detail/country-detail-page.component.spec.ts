import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CountryDetailPageComponent } from './country-detail-page.component';
import { Castle } from '../../models/castle.model';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ViewModeService } from '../../services/view-mode.service';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'France',
    area: '',
    place: 'Paris',
    region: 'Ile-de-France',
    region_code: 'ile-de-france',
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

describe('CountryDetailPageComponent', () => {
  let fixture: ComponentFixture<CountryDetailPageComponent>;
  let component: CountryDetailPageComponent;
  let httpTesting: HttpTestingController;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Château de Chambord', country: 'France', place: 'Chambord', region: 'Loire', score_total: 100 }),
    makeCastle({ castle_code: 'c2', castle_name: 'Mont Saint-Michel', country: 'France', place: 'Mont Saint-Michel', region: 'Normandy', score_total: 95 }),
    makeCastle({ castle_code: 'c3', castle_name: 'Neuschwanstein', country: 'Germany', place: 'Schwangau', region: 'Bavaria', score_total: 90 }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryDetailPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ country: 'France' }), queryParams: of({}) },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CountryDetailPageComponent);
    component = fixture.componentInstance;
    TestBed.inject(ViewModeService).setMode('list');
    fixture.detectChanges();

    const req = httpTesting.expectOne('/assets/data/castles_enriched.json');
    req.flush(castles);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the country name in heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    const heading = el.querySelector('h2');
    expect(heading?.textContent).toContain('Castles in France');
  });

  it('should show the castle count', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('2 castles found');
  });

  it('should render the view toggle', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-view-toggle')).toBeTruthy();
  });

  it('should render table with only French castles', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should show castle names as links', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('td.mat-column-castle_name a');
    expect(links.length).toBe(2);
    expect(links[0].textContent?.trim()).toBe('Château de Chambord');
  });

  it('should filter only castles for the route country', () => {
    const data = component.castles();
    expect(data.length).toBe(2);
    expect(data.every(c => c.country === 'France')).toBeTrue();
  });
});
