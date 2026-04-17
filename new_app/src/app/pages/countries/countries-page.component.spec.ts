import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CountriesPageComponent } from './countries-page.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test Castle', country: 'Netherlands',
    area: '', place: 'Amsterdam', region: 'Noord-Holland', region_code: '', latitude: 0,
    longitude: 0, founder: '', era: null, castle_type: '', castle_concept: '', condition: '',
    remarkable: '', description: '', website: '', score_total: 50,
    score_visitors: null, visitors: null, ...overrides,
  };
}

const castles: Castle[] = [
  makeCastle({ castle_code: 'c1', country: 'Netherlands', castle_name: 'Muiderslot', score_total: 100 }),
  makeCastle({ castle_code: 'c2', country: 'Netherlands', castle_name: 'Duurstede', score_total: 80 }),
  makeCastle({ castle_code: 'c3', country: 'France', castle_name: 'Carcassonne', score_total: 200 }),
];

describe('CountriesPageComponent', () => {
  let fixture: ComponentFixture<CountriesPageComponent>;
  let component: CountriesPageComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CountriesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/castles.json').flush(castles);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => expect(component).toBeTruthy());

  it('should display the page heading', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('Castles by Country');
  });

  it('should default to Netherlands', () => {
    expect(component.selectedCountry()).toBe('Netherlands');
  });

  it('should show Netherlands castles by default', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should update castles when country changes', () => {
    component.selectedCountry.set('France');
    fixture.detectChanges();
    expect(component.castles().length).toBe(1);
    expect(component.castles()[0].castle_name).toBe('Carcassonne');
  });

  it('should render the view toggle', () => {
    expect(fixture.nativeElement.querySelector('app-view-toggle')).toBeTruthy();
  });
});
