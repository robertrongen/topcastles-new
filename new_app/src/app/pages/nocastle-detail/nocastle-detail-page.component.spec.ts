import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { NoCastleDetailPageComponent } from './nocastle-detail-page.component';
import { NoCastle } from '../../models/castle.model';

function makeNoCastle(overrides: Partial<NoCastle> = {}): NoCastle {
  return {
    castle_code: 'chambord',
    castle_name: 'Chambord',
    country: 'France',
    area: 'Holy Roman Empire',
    place: 'Chambord',
    region: 'Centre',
    region_code: 'centre',
    founder: 'Francis I',
    era: 16,
    castle_type: 'City castle',
    castle_concept: 'Rectangular or polygonal',
    condition: 'Intact',
    remarkable: 'Double helix staircase',
    description: 'Renaissance chateau, not a castle.',
    website: 'https://www.chambord.org',
    nocastle_type: 'Renaissance',
    score_visitors: 0,
    visitors: 0,
    ...overrides,
  };
}

describe('NoCastleDetailPageComponent', () => {
  let fixture: ComponentFixture<NoCastleDetailPageComponent>;
  let component: NoCastleDetailPageComponent;
  let httpTesting: HttpTestingController;

  const noCastles: NoCastle[] = [
    makeNoCastle(),
    makeNoCastle({ castle_code: 'neuschwanstein', castle_name: 'Neuschwanstein', country: 'Germany', nocastle_type: 'Romantic', era: 19 }),
  ];

  function setup(code = 'chambord') {
    TestBed.configureTestingModule({
      imports: [NoCastleDetailPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ code }) },
        },
      ],
    });

    fixture = TestBed.createComponent(NoCastleDetailPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpTesting.expectOne('/assets/data/no_castles.json').flush(noCastles);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpTesting?.verify();
  });

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should display the castle name', () => {
    setup();
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain('Chambord');
  });

  it('should display metadata fields', () => {
    setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('France');
    expect(text).toContain('Francis I');
    expect(text).toContain('16th century');
    expect(text).toContain('Renaissance');
    expect(text).toContain('Intact');
  });

  it('should display description', () => {
    setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Renaissance chateau, not a castle.');
  });

  it('should display remarkable text', () => {
    setup();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Double helix staircase');
  });

  it('should display website link', () => {
    setup();
    const link = fixture.nativeElement.querySelector('a[target="_blank"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://www.chambord.org');
  });

  it('should show not-found for unknown code', () => {
    setup('unknown');
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Not found');
    expect(text).toContain('"unknown"');
  });

  it('should load another no-castle by code', () => {
    setup('neuschwanstein');
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain('Neuschwanstein');
    expect(fixture.nativeElement.textContent).toContain('19th century');
    expect(fixture.nativeElement.textContent).toContain('Romantic');
  });

  it('should render image elements', () => {
    setup();
    const images = fixture.nativeElement.querySelectorAll('.nocastle-images img');
    expect(images.length).toBe(5);
    expect(images[0].getAttribute('src')).toBe('/images/castles/chambord.jpg');
    expect(images[1].getAttribute('src')).toBe('/images/castles/chambord2.jpg');
  });

  it('should hide broken images via onImageError', () => {
    setup();
    const img = document.createElement('img');
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img });
    component.onImageError(event);
    expect(img.style.display).toBe('none');
  });

  it('should have a back link to background', () => {
    setup();
    const links = fixture.nativeElement.querySelectorAll('a[href="/background"]');
    expect(links.length).toBeGreaterThan(0);
  });
});
