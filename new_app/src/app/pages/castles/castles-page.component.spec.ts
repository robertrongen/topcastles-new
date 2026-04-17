import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CastlesPageComponent } from './castles-page.component';
import { Castle } from '../../models/castle.model';

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
  let httpTesting: HttpTestingController;

  const mockCastles: Castle[] = [
    makeCastle({ position: 1, castle_code: 'krak', castle_name: 'Krak des Chevaliers', country: 'Syria', score_total: 500 }),
    makeCastle({ position: 2, castle_code: 'carcassonne', castle_name: 'Carcassonne', country: 'France', score_total: 480 }),
    makeCastle({ position: 3, castle_code: 'malbork', castle_name: 'Malbork Castle', country: 'Poland', score_total: 460 }),
    makeCastle({ position: 4, castle_code: 'bodiam', castle_name: 'Bodiam Castle', country: 'England', score_total: 300 }),
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

    fixture = TestBed.createComponent(CastlesPageComponent);
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
    setup();
    expect(component).toBeTruthy();
  });

  it('should display all castles with score > 0', () => {
    setup();
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(4);
  });

  it('should display castle names as links', () => {
    setup();
    const nameLinks = fixture.nativeElement.querySelectorAll('td.mat-column-castle_name a');
    expect(nameLinks.length).toBe(4);
    expect(nameLinks[0].textContent?.trim()).toContain('Krak des Chevaliers');
  });

  it('should filter by country from query params', () => {
    setup({ country: 'France' });
    expect(component.filterCountry()).toBe('France');
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
  });

  it('should filter by name', () => {
    setup();
    component.filterName.set('malbork');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
  });

  it('should show result count', () => {
    setup();
    expect(fixture.nativeElement.textContent).toContain('4 castles found');
  });

  it('should show filtered result count', () => {
    setup({ country: 'Syria' });
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
});
