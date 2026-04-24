import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { FavoritesService, FavoriteSet } from './favorites.service';
import { UserService } from './user.service';

// Override the no-op global mock with a real in-memory store so that
// UserService can store and retrieve tokens needed for auth headers.
function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  } as Storage;
}

function setup(): {
  service: FavoritesService;
  userService: UserService;
  httpTesting: HttpTestingController;
} {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: makeLocalStorageMock() });
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });
  return {
    service: TestBed.inject(FavoritesService),
    userService: TestBed.inject(UserService),
    httpTesting: TestBed.inject(HttpTestingController),
  };
}

const mockSets: FavoriteSet[] = [
  { id: 's1', name: 'Favorites', castleIds: ['krak', 'malbork'] },
  { id: 's2', name: 'Wish list', castleIds: [] },
];

describe('FavoritesService', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ── loadFavorites ──────────────────────────────────────────────────────────

  describe('loadFavorites', () => {
    it('fetches favorites and populates the signal', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.loadFavorites();
      httpTesting.expectOne('/api/user/favorites').flush(mockSets);
      flushMicrotasks();
      expect(service.favorites()).toEqual(mockSets);
      expect(service.loading()).toBeFalse();
      httpTesting.verify();
    }));

    it('sets loading to true during the request and false on completion', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.loadFavorites();
      expect(service.loading()).toBeTrue();
      httpTesting.expectOne('/api/user/favorites').flush([]);
      flushMicrotasks();
      expect(service.loading()).toBeFalse();
      httpTesting.verify();
    }));

    it('sets favorites to [] on non-401 server error', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.favorites.set(mockSets);
      service.loadFavorites();
      httpTesting.expectOne('/api/user/favorites').flush(
        { error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }
      );
      flushMicrotasks();
      expect(service.favorites()).toEqual([]);
      httpTesting.verify();
    }));

    it('re-registers on 401 and retries the GET with the new token', fakeAsync(() => {
      // Model: anonymous identity — no stored token initially.
      // First GET returns 401 → withAuth calls handleUnauthorized → registers → retries.
      const { service, httpTesting } = setup();

      service.loadFavorites();

      // First GET /api/user/favorites — no auth header → 401
      httpTesting.expectOne('/api/user/favorites').flush(
        { error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
      );
      flushMicrotasks(); // catch handler runs, POST /api/user/register is queued

      // handleUnauthorized → registerAnonymousUser → POST /api/user/register
      httpTesting.expectOne('/api/user/register').flush({ token: 'fresh-tok' });
      flushMicrotasks(); // token stored, withAuth calls the lambda again → second GET queued

      // Retry GET /api/user/favorites with Authorization: Bearer fresh-tok
      const retryReq = httpTesting.expectOne('/api/user/favorites');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer fresh-tok');
      retryReq.flush(mockSets);
      flushMicrotasks(); // favorites signal updated

      expect(service.favorites()).toEqual(mockSets);
      httpTesting.verify();
    }));
  });

  // ── createSet ─────────────────────────────────────────────────────────────

  describe('createSet', () => {
    it('posts the new set and reloads favorites', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');

      service.createSet('New list', ['c1', 'c2']);

      // POST /api/user/favorites
      const postReq = httpTesting.expectOne(
        req => req.method === 'POST' && req.url === '/api/user/favorites'
      );
      expect(postReq.request.body).toEqual({ name: 'New list', castleIds: ['c1', 'c2'] });
      postReq.flush({ id: 's3', name: 'New list', castleIds: ['c1', 'c2'] });
      flushMicrotasks(); // createSet awaits POST, then calls loadFavorites

      // GET /api/user/favorites (reload after creation)
      httpTesting.expectOne(
        req => req.method === 'GET' && req.url === '/api/user/favorites'
      ).flush(mockSets);
      flushMicrotasks();

      expect(service.favorites()).toEqual(mockSets);
      httpTesting.verify();
    }));

    it('sends no castleIds when called with default empty array', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');

      service.createSet('Empty set');

      const postReq = httpTesting.expectOne(
        req => req.method === 'POST' && req.url === '/api/user/favorites'
      );
      expect(postReq.request.body).toEqual({ name: 'Empty set', castleIds: [] });
      postReq.flush({ id: 's4', name: 'Empty set', castleIds: [] });
      flushMicrotasks();

      httpTesting.expectOne(req => req.method === 'GET' && req.url === '/api/user/favorites').flush([]);
      flushMicrotasks();
      httpTesting.verify();
    }));
  });

  // ── deleteSet ─────────────────────────────────────────────────────────────

  describe('deleteSet', () => {
    it('sends DELETE and reloads favorites', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');

      service.deleteSet('s1');

      // DELETE /api/user/favorites/s1
      httpTesting.expectOne('/api/user/favorites/s1').flush(null, { status: 204, statusText: 'No Content' });
      flushMicrotasks(); // deleteSet awaits DELETE, then calls loadFavorites

      // GET /api/user/favorites (reload after deletion)
      httpTesting.expectOne('/api/user/favorites').flush([mockSets[1]]);
      flushMicrotasks();

      expect(service.favorites()).toEqual([mockSets[1]]);
      httpTesting.verify();
    }));
  });

  // ── updateSet ─────────────────────────────────────────────────────────────

  describe('updateSet', () => {
    it('sends PUT with updated name and castleIds and reloads favorites', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');

      service.updateSet('s1', 'Renamed', ['krak']);

      const putReq = httpTesting.expectOne('/api/user/favorites/s1');
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body).toEqual({ name: 'Renamed', castleIds: ['krak'] });
      putReq.flush({ id: 's1', name: 'Renamed', castleIds: ['krak'] });
      flushMicrotasks();

      httpTesting.expectOne('/api/user/favorites').flush(mockSets);
      flushMicrotasks();
      httpTesting.verify();
    }));
  });

  // ── addCastleToSet / removeCastleFromSet ──────────────────────────────────

  describe('addCastleToSet', () => {
    it('updates signal optimistically and sends PUT', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.favorites.set([{ id: 's1', name: 'Favorites', castleIds: ['krak'] }]);

      service.addCastleToSet('s1', 'malbork');

      // Optimistic update is immediate
      expect(service.favorites()[0].castleIds).toContain('malbork');

      httpTesting.expectOne('/api/user/favorites/s1').flush(
        { id: 's1', name: 'Favorites', castleIds: ['krak', 'malbork'] }
      );
      flushMicrotasks();
      httpTesting.verify();
    }));

    it('is a no-op when the castle is already in the set', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.favorites.set([{ id: 's1', name: 'Favorites', castleIds: ['krak'] }]);

      service.addCastleToSet('s1', 'krak');

      flushMicrotasks();
      // Signal unchanged — castle was already present, no PUT issued.
      expect(service.favorites()[0].castleIds).toEqual(['krak']);
      httpTesting.expectNone('/api/user/favorites/s1');
      httpTesting.verify();
    }));
  });

  describe('removeCastleFromSet', () => {
    it('updates signal optimistically and sends PUT', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.favorites.set([{ id: 's1', name: 'Favorites', castleIds: ['krak', 'malbork'] }]);

      service.removeCastleFromSet('s1', 'malbork');

      // Optimistic removal is immediate
      expect(service.favorites()[0].castleIds).not.toContain('malbork');

      httpTesting.expectOne('/api/user/favorites/s1').flush(
        { id: 's1', name: 'Favorites', castleIds: ['krak'] }
      );
      flushMicrotasks();
      httpTesting.verify();
    }));

    it('is a no-op when the castle is not in the set', fakeAsync(() => {
      const { service, userService, httpTesting } = setup();
      userService.importToken('tok');
      service.favorites.set([{ id: 's1', name: 'Favorites', castleIds: ['krak'] }]);

      service.removeCastleFromSet('s1', 'nonexistent');

      flushMicrotasks();
      // Signal unchanged — castle was not present, no PUT issued.
      expect(service.favorites()[0].castleIds).toEqual(['krak']);
      httpTesting.expectNone('/api/user/favorites/s1');
      httpTesting.verify();
    }));
  });
});
