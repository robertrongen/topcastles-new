import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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

/** Build a pool of N distinct castles ordered by descending score (index 0 = rank 1). */
function makePool(n: number): Castle[] {
  return Array.from({ length: n }, (_, i) =>
    makeCastle({ castle_code: `c${i}`, position: i + 1, score_total: 1000 - i }),
  );
}

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let component: HomePageComponent;
  let castleService: CastleService;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', score_total: 100, score_visitors: 50, country: 'netherlands' }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta',  score_total: 90,  score_visitors: 60, country: 'france' }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', score_total: 80,  score_visitors: 70, country: 'netherlands' }),
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

    castleService = TestBed.inject(CastleService);
    castleService.castles.set(castles);

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Basic rendering ────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  it('should render the top-ranking reference table', () => {
    const table = fixture.nativeElement.querySelector('table.ref-table');
    expect(table).toBeTruthy();
    const rows = table!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should render visitor ranking as a lead card and compact list', () => {
    const lead = fixture.nativeElement.querySelector('.visitor-lead');
    const rows = fixture.nativeElement.querySelectorAll('.visitor-list tbody tr');
    expect(lead).toBeTruthy();
    expect(rows.length).toBe(2);
  });

  it('should not render the postponed country exploration section', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Explore by country');
  });

  // ── Computed sorted lists ──────────────────────────────────────────────────

  it('should compute top10 sorted by score_total desc', () => {
    const top = component.top10();
    expect(top[0].castle_code).toBe('c1');
    expect(top[1].castle_code).toBe('c2');
  });

  it('should compute topVisitors12 sorted by score_visitors desc', () => {
    const top = component.topVisitors12();
    expect(top[0].castle_code).toBe('c3');
    expect(top[1].castle_code).toBe('c2');
  });

  it('should derive the #1 visitor castle and #2-#5 runner-up list', () => {
    expect(component.topVisitorLead()?.castle_code).toBe('c3');
    expect(component.topVisitorRunnersUp().map(c => c.castle_code)).toEqual(['c2', 'c1']);
  });

  // ── todaysCastle: daily selection ──────────────────────────────────────────
  //
  // Selection formula (evaluated once at component construction):
  //
  //   todayIndex = Math.floor(Date.now() / 86_400_000) % 100
  //   todaysCastle = castles.slice(0, 100)[todayIndex % pool.length]
  //
  // • Date.now() / 86_400_000 converts ms to whole days since Unix epoch.
  // • % 100 rotates through positions 0–99 over a 100-day cycle.
  // • The result is stable for the entire calendar day and changes at UTC midnight.

  it('should return null when no castles are loaded', () => {
    castleService.castles.set([]);
    fixture.detectChanges();
    expect(component.todaysCastle()).toBeNull();
  });

  it('should return a castle from within the top-100 pool', () => {
    castleService.castles.set(makePool(150));
    const castle = component.todaysCastle();
    expect(castle).toBeTruthy();
    // position is 1-based; top-100 pool = positions 1–100
    expect(castle!.position).toBeLessThanOrEqual(100);
  });

  it('should cap pool at 100 even when more castles are loaded', () => {
    castleService.castles.set(makePool(150));
    fixture.detectChanges();
    // Regardless of todayIndex the selected castle must be in the top 100
    expect(component.todaysCastle()!.position).toBeLessThanOrEqual(100);
  });

  it('should select different castles on different days (100-castle pool)', () => {
    // With a 100-castle pool each day maps to a unique castle.
    // We create two components, each constructed while Date.now() is mocked
    // to a different day, and verify the selections differ.
    const pool = makePool(100);
    castleService.castles.set(pool);

    // Day 0 (epoch)
    spyOn(Date, 'now').and.returnValue(0);
    const compDay0 = TestBed.createComponent(HomePageComponent).componentInstance;

    // Day 1 (one day later)
    (Date.now as jasmine.Spy).and.returnValue(86_400_000);
    const compDay1 = TestBed.createComponent(HomePageComponent).componentInstance;

    expect(compDay0.todaysCastle()?.castle_code)
      .not.toBe(compDay1.todaysCastle()?.castle_code);
  });

  it('should return the same castle across multiple reads on the same day', () => {
    // todayIndex is computed once at construction; repeated reads are stable.
    const a = component.todaysCastle();
    const b = component.todaysCastle();
    expect(a?.castle_code).toBe(b?.castle_code);
  });

  // ── Atlas region links ─────────────────────────────────────────────────────

  describe('atlas region links', () => {
    it('renders three atlas callout anchors on the map', () => {
      expect(fixture.nativeElement.querySelectorAll('.atlas-callout').length).toBe(3);
    });

    it('Rhine & Moselle callout href contains regionCodes with rheinland-pfalz', () => {
      const el = fixture.nativeElement.querySelector('.atlas-callout--rhine') as HTMLAnchorElement;
      expect(el).toBeTruthy();
      expect(decodeURIComponent(el.href)).toContain('regionCodes');
      expect(decodeURIComponent(el.href)).toContain('rheinland-pfalz');
    });

    it('Loire Valley callout href contains regionCodes with ile-de-france', () => {
      const el = fixture.nativeElement.querySelector('.atlas-callout--loire') as HTMLAnchorElement;
      expect(el).toBeTruthy();
      expect(decodeURIComponent(el.href)).toContain('regionCodes');
      expect(decodeURIComponent(el.href)).toContain('ile-de-france');
    });

    it('British Isles callout href contains countries with England and Wales', () => {
      const el = fixture.nativeElement.querySelector('.atlas-callout--british') as HTMLAnchorElement;
      expect(el).toBeTruthy();
      expect(decodeURIComponent(el.href)).toContain('countries');
      expect(decodeURIComponent(el.href)).toContain('England');
      expect(decodeURIComponent(el.href)).toContain('Wales');
    });

    it('atlas note headings are wrapped in anchor links', () => {
      const noteLinks = fixture.nativeElement.querySelectorAll('.atlas-note__region a') as NodeListOf<HTMLAnchorElement>;
      expect(noteLinks.length).toBe(3);
    });
  });

  it('should cycle back to position 0 after 100 days', () => {
    const pool = makePool(100);
    castleService.castles.set(pool);

    spyOn(Date, 'now').and.returnValue(0);
    const compDay0 = TestBed.createComponent(HomePageComponent).componentInstance;

    (Date.now as jasmine.Spy).and.returnValue(100 * 86_400_000); // day 100 ≡ day 0 mod 100
    const compDay100 = TestBed.createComponent(HomePageComponent).componentInstance;

    expect(compDay0.todaysCastle()?.castle_code)
      .toBe(compDay100.todaysCastle()?.castle_code);
  });

  // ── goToNearestCastle ──────────────────────────────────────────────────────

  describe('goToNearestCastle', () => {
    let router: Router;
    let navigateSpy: jasmine.Spy;

    beforeEach(() => {
      router = TestBed.inject(Router);
      navigateSpy = spyOn(router, 'navigate');
    });

    it('navigates to /castles/:code of the nearest castle on geolocation success', async () => {
      // c_near is at (51, 4) — close to user at (51, 4.01), best rank
      // c_far is at (48, 2) — far from user, weaker rank
      castleService.castles.set([
        makeCastle({ castle_code: 'c_far',  position: 2,  latitude: 48,  longitude: 2 }),
        makeCastle({ castle_code: 'c_near', position: 1,  latitude: 51,  longitude: 4 }),
      ]);

      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (success: PositionCallback) => success({
          coords: { latitude: 51, longitude: 4.01, accuracy: 1,
                    altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
        } as GeolocationPosition)
      );

      component.goToNearestCastle();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/castles', 'c_near']);
    });

    it('picks the highest-ranked castle among the 20 nearest, not just the closest', async () => {
      // Castles at varying distances from (0, 0); positions reflect editorial rank
      const nearby = Array.from({ length: 20 }, (_, i) =>
        makeCastle({ castle_code: `near_${i}`, position: i + 2, latitude: 0.01 * (i + 1), longitude: 0 })
      );
      // Best-ranked castle is at position 1, slightly further than the closest
      nearby.push(makeCastle({ castle_code: 'best_rank', position: 1, latitude: 0.15, longitude: 0 }));

      castleService.castles.set(nearby);

      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (success: PositionCallback) => success({
          coords: { latitude: 0, longitude: 0, accuracy: 1,
                    altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
        } as GeolocationPosition)
      );

      component.goToNearestCastle();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/castles', 'best_rank']);
    });

    it('sets nearMeState to error on geolocation failure and does not navigate', () => {
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error?: PositionErrorCallback | null) =>
          error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
      );

      component.goToNearestCastle();
      fixture.detectChanges();

      expect(component.nearMeState()).toBe('error');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('does not use /top1000?sort=near-me', () => {
      // The near-me entry must be a button, not an anchor pointing to /top1000?sort=near-me
      const allBtns = Array.from(fixture.nativeElement.querySelectorAll('button.sidebar-widget__refresh')) as HTMLButtonElement[];
      const nearMeBtn = allBtns.find(b => b.textContent?.includes('Top castle near me'));
      expect(nearMeBtn).toBeTruthy();
      const legacyLink: HTMLElement = fixture.nativeElement.querySelector('[href*="near-me"]');
      expect(legacyLink).toBeNull();
    });
  });
});
