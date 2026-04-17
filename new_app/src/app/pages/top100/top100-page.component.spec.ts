import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Top100PageComponent } from './top100-page.component';
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

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', position: 1, score_total: 100, country: 'france', place: 'Lyon', region: 'Rhone' }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta', position: 2, score_total: 90, country: 'germany', place: 'Berlin', region: 'Brandenburg' }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', position: 3, score_total: 80, country: 'spain', place: 'Madrid', region: 'Castilla' }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top100PageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Top100PageComponent);
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
    const el: HTMLElement = fixture.nativeElement;
    const heading = el.querySelector('h2');
    expect(heading?.textContent).toContain('top 100 of medieval castles');
  });

  it('should render a castle grid', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-castle-grid')).toBeTruthy();
  });

  it('should render table with 3 data rows', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(3);
  });

  it('should show castle names as links in the table', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('td.mat-column-castle_name a');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0].textContent?.trim()).toBe('Alpha');
  });

  it('should compute top100 sorted by score_total desc', () => {
    const top = component.top100();
    expect(top[0].castle_code).toBe('c1');
    expect(top[1].castle_code).toBe('c2');
    expect(top[2].castle_code).toBe('c3');
  });


});
