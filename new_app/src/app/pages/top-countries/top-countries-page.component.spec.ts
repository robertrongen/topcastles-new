import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TopCountriesPageComponent } from './top-countries-page.component';
import { Castle } from '../../models/castle.model';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TopCountriesPageComponent);
    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/castles.json').flush(castles);
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

  it('should sort on header click', () => {
    fixture.componentInstance.onSort({ active: 'castleCount', direction: 'asc' });
    expect(fixture.componentInstance.sorted[0].country).toBe('Germany');
  });
});
