import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { AdminCastlesComponent, CastleLookupResult } from './admin-castles.component';
import { AdminAuthService } from '../admin-auth.service';

describe('AdminCastlesComponent', () => {
  let component: AdminCastlesComponent;
  let fixture: ComponentFixture<AdminCastlesComponent>;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AdminAuthService>;

  const mockLookupResults: CastleLookupResult[] = [
    {
      code: 'tower',
      name: 'Tower of London',
      country: 'England',
      editorialRank: 1,
      visitorRank: 10,
    },
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AdminAuthService', ['getAuthHeaders']);
    authServiceSpy.getAuthHeaders.and.returnValue({ Authorization: 'Bearer test-token' });

    await TestBed.configureTestingModule({
      imports: [AdminCastlesComponent, HttpClientTestingModule],
      providers: [
        { provide: AdminAuthService, useValue: authServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    authService = TestBed.inject(AdminAuthService) as jasmine.SpyObj<AdminAuthService>;
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(AdminCastlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Mock the loadOverrideCount call in ngOnInit
    const overrideCountReq = httpMock.expectOne('/api/admin/castles');
    overrideCountReq.flush({});
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('search', () => {
    it('should fetch results when user types a query', fakeAsync(() => {
      component.onSearchInput('london');
      tick(220); // debounce time
      tick(); // microtask queue

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/lookup?q=london')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockLookupResults);
      tick(); // microtask for promise resolution

      expect(component.searchResults()).toEqual(mockLookupResults);
      expect(component.searchMessage()).toBe(null);
      expect(component.searchLoading()).toBeFalse();
    }));

    it('should not fetch results for queries shorter than 2 characters', fakeAsync(() => {
      component.onSearchInput('l');
      tick(220);

      httpMock.expectNone((request) =>
        request.url.includes('/api/admin/castles/lookup')
      );
      expect(component.searchResults()).toEqual([]);
    }));

    it('should allow repeated searches for the same query (regression test)', fakeAsync(() => {
      // First search for "london"
      component.onSearchInput('london');
      tick(220);
      tick(); // microtask

      let req = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/lookup?q=london')
      );
      req.flush(mockLookupResults);
      tick(); // microtask for promise

      expect(component.searchResults()).toEqual(mockLookupResults);

      // Simulate user selecting a result (which clears results)
      // selectCastle will make another HTTP request for GET /api/admin/castles/:code
      component.selectCastle('tower');
      tick(); // microtask

      // Mock the GET for the detail request
      const detailReq = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/tower')
      );
      detailReq.flush({ code: 'tower', enriched: mockLookupResults[0], override: null });
      tick(); // microtask

      // After selecting, results are cleared
      expect(component.searchResults()).toEqual([]);

      // Now search for "london" AGAIN - this should work (no distinctUntilChanged blocking)
      component.onSearchInput('london');
      tick(220);
      tick(); // microtask

      req = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/lookup?q=london')
      );
      req.flush(mockLookupResults);
      tick(); // microtask for promise

      expect(component.searchResults()).toEqual(mockLookupResults);
    }));

    it('should clear results on API error', fakeAsync(() => {
      component.onSearchInput('london');
      tick(220);
      tick(); // microtask

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/lookup?q=london')
      );
      req.error(new ErrorEvent('Network error'));
      tick(); // microtask for promise rejection

      expect(component.searchResults()).toEqual([]);
      expect(component.searchMessage()).toBe('Lookup failed. Check your token or connection.');
      expect(component.searchLoading()).toBeFalse();
    }));

    it('should show a helpful message when no castles match', fakeAsync(() => {
      component.onSearchInput('missing');
      tick(220);
      tick();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/admin/castles/lookup?q=missing')
      );
      req.flush([]);
      tick();

      expect(component.searchResults()).toEqual([]);
      expect(component.searchMessage()).toBe('No castles matched "missing".');
    }));

    it('should update searchQuery signal when user types', () => {
      component.onSearchInput('london');
      expect(component.searchQuery()).toBe('london');

      component.onSearchInput('paris');
      expect(component.searchQuery()).toBe('paris');
    });
  });

  describe('saveOverride', () => {
    it('should keep success feedback and update selected override after save', fakeAsync(() => {
      component.selected.set({
        code: 'tower',
        enriched: { castle_name: 'Tower of London', country: 'England' },
        override: null,
      });
      component.editFields.set({ castle_name: 'Tower corrected' });
      component.overrideCount.set(0);

      component.saveOverride();

      const req = httpMock.expectOne('/api/admin/castles/tower');
      expect(req.request.method).toBe('PUT');
      req.flush({ code: 'tower', override: { castle_name: 'Tower corrected' } });
      tick();

      expect(component.saveSuccess()).toBeTrue();
      expect(component.selected()?.override).toEqual({ castle_name: 'Tower corrected' });
      expect(component.overrideCount()).toBe(1);
    }));
  });

  describe('saveNewCastle', () => {
    it('should reject invalid castle codes before POSTing', fakeAsync(() => {
      component.startNewCastle();
      component.newCastleCode.set('UPPERCASE');
      component.newCastleFields.set({
        castle_name: 'New Castle',
        country: 'Ireland',
        place: 'Kilkenny',
        latitude: 52.654,
        longitude: -7.254,
      });

      component.saveNewCastle();
      tick();

      httpMock.expectNone('/api/admin/castles');
      expect(component.newSaveError()).toBe('Castle code must be a lowercase slug using letters, digits, and hyphens.');
      expect(component.newSaving()).toBeFalse();
    }));

    it('should reject missing required draft fields before POSTing', fakeAsync(() => {
      component.startNewCastle();
      component.newCastleCode.set('new-castle');
      component.newCastleFields.set({
        castle_name: 'New Castle',
        country: 'Ireland',
        latitude: 52.654,
        longitude: -7.254,
      });

      component.saveNewCastle();
      tick();

      httpMock.expectNone('/api/admin/castles');
      expect(component.newSaveError()).toBe('Place is required.');
      expect(component.newSaving()).toBeFalse();
    }));

    it('should post a trimmed draft code and select the created castle', fakeAsync(() => {
      component.startNewCastle();
      component.overrideCount.set(0);
      component.newCastleCode.set(' new-castle ');
      component.newCastleFields.set({
        castle_name: 'New Castle',
        country: 'Ireland',
        place: 'Kilkenny',
        latitude: 52.654,
        longitude: -7.254,
      });

      component.saveNewCastle();

      const postReq = httpMock.expectOne('/api/admin/castles');
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body.castle_code).toBe('new-castle');
      postReq.flush({
        code: 'new-castle',
        override: {
          castle_name: 'New Castle',
          country: 'Ireland',
          place: 'Kilkenny',
          latitude: 52.654,
          longitude: -7.254,
        },
      });
      tick();

      const detailReq = httpMock.expectOne('/api/admin/castles/new-castle');
      expect(detailReq.request.method).toBe('GET');
      detailReq.flush({
        code: 'new-castle',
        enriched: null,
        override: {
          castle_name: 'New Castle',
          country: 'Ireland',
          place: 'Kilkenny',
          latitude: 52.654,
          longitude: -7.254,
        },
      });
      tick();

      expect(component.mode()).toBe('edit');
      expect(component.selected()?.code).toBe('new-castle');
      expect(component.overrideCount()).toBe(1);
      expect(component.saveSuccess()).toBeTrue();
      expect(component.newSaveSuccess()).toBeTrue();
      expect(component.newSaving()).toBeFalse();
    }));
  });

  describe('clearSelection', () => {
    it('should reset search query mode and selected', () => {
      component.searchQuery.set('london');
      component.selected.set({ code: 'test', enriched: null, override: null });
      component.mode.set('edit');

      component.clearSelection();

      expect(component.searchQuery()).toBe('');
      expect(component.selected()).toBe(null);
      expect(component.mode()).toBe('none');
    });
  });

  describe('subscription cleanup', () => {
    it('should unsubscribe on component destroy', () => {
      const subscription = component['searchSubscription'];
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
