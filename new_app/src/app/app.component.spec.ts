import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { CastleService } from './services/castle.service';
import { Castle } from './models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test Castle',
    country: 'netherlands', area: '', place: '', region: '', region_code: '',
    latitude: 0, longitude: 0, founder: '', era: null, castle_type: '',
    castle_concept: '', condition: '', remarkable: '', description: '',
    website: '', score_total: 50, score_visitors: null,
    wikidata_image: null, wikipedia_thumbnail: null, wikipedia_extract: null,
    ...overrides,
  };
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, MatSnackBarModule, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have the "Top Castles" title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('Top Castles');
  });



  it('should render primary nav links in the site-nav', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.site-nav');
    expect(nav).toBeTruthy();
    expect(nav.textContent).toContain('Top 1000');
    expect(nav.textContent).toContain('Background');
  });

  it('should have a navigation toggle button in the site-nav', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[aria-label="Toggle navigation"]');
    expect(btn).toBeTruthy();
  });

  it('should render nearest castle button in the site-nav icon group', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.site-nav__icons button[aria-label="Nearest top castle"]');
    expect(btn).toBeTruthy();
  });

  // ── goToNearestCastle ──────────────────────────────────────────────────────

  describe('goToNearestCastle', () => {
    let castleService: CastleService;
    let router: Router;
    let navigateSpy: jasmine.Spy;

    beforeEach(() => {
      castleService = TestBed.inject(CastleService);
      router = TestBed.inject(Router);
      navigateSpy = spyOn(router, 'navigate');
    });

    it('navigates to /castles/:code of the nearest castle on geolocation success', () => {
      castleService.castles.set([
        makeCastle({ castle_code: 'c_far',  position: 2, latitude: 48, longitude: 2 }),
        makeCastle({ castle_code: 'c_near', position: 1, latitude: 51, longitude: 4 }),
      ]);
      const fixture = TestBed.createComponent(AppComponent);
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (success: PositionCallback) => success({
          coords: { latitude: 51, longitude: 4.01, accuracy: 1,
                    altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
        } as GeolocationPosition)
      );
      fixture.componentInstance.goToNearestCastle();
      fixture.detectChanges();
      expect(navigateSpy).toHaveBeenCalledWith(['/castles', 'c_near']);
    });

    it('sets nearMeState to error on geolocation failure and does not navigate', () => {
      const fixture = TestBed.createComponent(AppComponent);
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        (_success: PositionCallback, error?: PositionErrorCallback | null) =>
          error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
      );
      fixture.componentInstance.goToNearestCastle();
      fixture.detectChanges();
      expect(fixture.componentInstance.nearMeState()).toBe('error');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('does not use /top1000?sort=near-me', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const legacyLink: HTMLElement = fixture.nativeElement.querySelector('[href*="near-me"]');
      expect(legacyLink).toBeNull();
    });
  });
});
