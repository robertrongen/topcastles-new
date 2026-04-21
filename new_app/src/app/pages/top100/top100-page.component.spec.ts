import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Top100PageComponent } from './top100-page.component';
import { ViewModeService } from '../../services/view-mode.service';
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

describe('Top100PageComponent', () => {
  let fixture: ComponentFixture<Top100PageComponent>;
  let component: Top100PageComponent;
  let httpTesting: HttpTestingController;
  let viewModeService: ViewModeService;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', position: 1, score_total: 100, country: 'france', place: 'Lyon', region: 'Rhone' }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta', position: 2, score_total: 90, country: 'germany', place: 'Berlin', region: 'Brandenburg' }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', position: 3, score_total: 80, country: 'spain', place: 'Madrid', region: 'Castilla' }),
  ];

  beforeEach(async () => {
    localStorage.removeItem('castle-view-mode');

    await TestBed.configureTestingModule({
      imports: [Top100PageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    viewModeService = TestBed.inject(ViewModeService);
    fixture = TestBed.createComponent(Top100PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/assets/data/castles_enriched.json');
    req.flush(castles);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.removeItem('castle-view-mode');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the heading', () => {
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading?.textContent).toContain('top 1000 of medieval castles');
  });

  it('should render the view toggle', () => {
    expect(fixture.nativeElement.querySelector('app-view-toggle')).toBeTruthy();
  });

  it('should show table in list mode (default)', () => {
    viewModeService.setMode('list');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-castle-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-castle-grid')).toBeNull();
  });

  it('should show grid when mode is grid', () => {
    viewModeService.setMode('grid');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-castle-grid')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-castle-table')).toBeNull();
  });

  it('should render table with 3 data rows in list mode', () => {
    viewModeService.setMode('list');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(3);
  });

  it('should show castle names as links in the table', () => {
    viewModeService.setMode('list');
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('td.mat-column-castle_name a');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0].textContent?.trim()).toBe('Alpha');
  });

  it('should compute allCastles sorted by score_total desc', () => {
    const top = component.allCastles();
    expect(top[0].castle_code).toBe('c1');
    expect(top[1].castle_code).toBe('c2');
    expect(top[2].castle_code).toBe('c3');
  });
});
