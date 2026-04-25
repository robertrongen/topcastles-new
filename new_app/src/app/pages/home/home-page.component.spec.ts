import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomePageComponent } from './home-page.component';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'netherlands',
    area: '',
    place: '',
    region: '',
    region_code: '',
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

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let component: HomePageComponent;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', score_total: 100, score_visitors: 50, country: 'netherlands' }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta', score_total: 90, score_visitors: 60, country: 'france' }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', score_total: 80, score_visitors: 70, country: 'netherlands' }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // Pre-seed the service so no HTTP request is needed
    TestBed.inject(CastleService).castles.set(castles);

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display top 12 section heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    const headings = el.querySelectorAll('h2');
    expect(headings[0].textContent).toContain('top 1000 of medieval castles');
  });

  it('should render two castle grids (visitor rating and Netherlands)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const grids = el.querySelectorAll('app-castle-grid');
    expect(grids.length).toBe(2);
  });

  it('should render the top-ranking reference table', () => {
    const el: HTMLElement = fixture.nativeElement;
    const table = el.querySelector('table.ref-table');
    expect(table).toBeTruthy();
    const rows = table!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should compute top12 sorted by score_total desc', () => {
    const top = component.top12();
    expect(top[0].castle_code).toBe('c1');
    expect(top[1].castle_code).toBe('c2');
  });

  it('should compute topVisitors12 sorted by score_visitors desc', () => {
    const top = component.topVisitors12();
    expect(top[0].castle_code).toBe('c3');
    expect(top[1].castle_code).toBe('c2');
  });

  it('should compute topNetherlands12 filtered to netherlands', () => {
    const top = component.topNetherlands12();
    expect(top.length).toBe(2);
    expect(top.every((c) => c.country === 'netherlands')).toBeTrue();
  });
});
