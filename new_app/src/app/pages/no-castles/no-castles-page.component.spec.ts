import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoCastlesPageComponent } from './no-castles-page.component';
import { NoCastle } from '../../models/castle.model';

function makeNoCastle(overrides: Partial<NoCastle> = {}): NoCastle {
  return {
    castle_code: 'test', castle_name: 'Test Palace', country: 'France',
    area: '', place: 'Paris', region: 'Ile-de-France', region_code: '',
    founder: '', era: null, castle_type: '', castle_concept: '', condition: '',
    remarkable: '', description: 'Not a castle', website: '',
    nocastle_type: 'Palace', score_visitors: null, visitors: null, ...overrides,
  };
}

const noCastles: NoCastle[] = [
  makeNoCastle({ castle_code: 'versailles', castle_name: 'Versailles', country: 'France', nocastle_type: 'Palace' }),
  makeNoCastle({ castle_code: 'aachen', castle_name: 'Pfalz Aachen', country: 'Germany', nocastle_type: 'Imperial palace' }),
];

describe('NoCastlesPageComponent', () => {
  let fixture: ComponentFixture<NoCastlesPageComponent>;
  let component: NoCastlesPageComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoCastlesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NoCastlesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/no_castles.json').flush(noCastles);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => expect(component).toBeTruthy());

  it('should display the page heading', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('No Castles');
  });

  it('should render one row per entry', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should show castle name as a link', () => {
    const nameLinks = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2) a');
    expect(nameLinks.length).toBe(2);
    expect(nameLinks[0].textContent.trim()).toBe('Versailles');
  });

  it('should show the nocastle_type column', () => {
    const cells = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(cells[0].textContent).toContain('Palace');
    expect(cells[1].textContent).toContain('Imperial palace');
  });

  it('should show loading state before data arrives', async () => {
    // fresh fixture before flush
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoCastlesPageComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const ht = TestBed.inject(HttpTestingController);
    const f = TestBed.createComponent(NoCastlesPageComponent);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Loading');
    ht.expectOne('/assets/data/no_castles.json').flush([]);
  });
});
