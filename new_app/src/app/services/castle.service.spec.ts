import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CastleService } from './castle.service';
import { Castle } from '../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'c1',
    castle_name: 'Castle One',
    country: 'France',
    area: 'Loire',
    place: 'Amboise',
    region: 'Centre',
    region_code: 'centre',
    latitude: 47.4,
    longitude: 1.0,
    founder: '',
    era: 1200,
    castle_type: 'Mountain castle',
    castle_concept: 'Motte-and-bailey',
    condition: 'Intact',
    remarkable: '',
    description: '',
    website: '',
    score_total: 80,
    score_visitors: 40,
    visitors: 100,
    ...overrides,
  };
}

describe('CastleService', () => {
  let service: CastleService;
  let httpTesting: HttpTestingController;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', position: 1, score_total: 100, score_visitors: 60, country: 'France', region: 'Normandy', region_code: 'normandy', castle_type: 'Mountain castle', castle_concept: 'Motte-and-bailey', condition: 'Intact', era: 1100, area: 'Loire, Berry' }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta',  position: 2, score_total: 80,  score_visitors: 90, country: 'France', region: 'Normandy', region_code: 'normandy', castle_type: 'Water castle',    castle_concept: 'Ringwork',         condition: 'Ruined/Partly remained', era: 1300, area: 'Loire' }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', position: 3, score_total: 60,  score_visitors: 20, country: 'Germany', region: 'Bavaria',  region_code: 'bavaria',  castle_type: 'Rock castle',     castle_concept: 'Motte-and-bailey',  condition: 'Intact', era: 1100, area: '' }),
    makeCastle({ castle_code: 'c4', castle_name: 'Delta', position: 4, score_total: 40,  score_visitors: 10, country: 'Germany', region: 'Rhine',    region_code: 'rhine',    castle_type: '', castle_concept: '', condition: '', era: null, area: '' }),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CastleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('loadCastles', () => {
    it('loads castles from JSON and sets signal', () => {
      service.loadCastles();
      const req = httpTesting.expectOne('/assets/data/castles_enriched.json');
      req.flush(castles);
      expect(service.castles().length).toBe(4);
    });

    it('sets loading to true during request and false after', () => {
      service.loadCastles();
      expect(service.loading()).toBeTrue();
      httpTesting.expectOne('/assets/data/castles_enriched.json').flush(castles);
      expect(service.loading()).toBeFalse();
    });

    it('sets loading to false on error', () => {
      service.loadCastles();
      httpTesting.expectOne('/assets/data/castles_enriched.json').error(new ProgressEvent('network error'));
      expect(service.loading()).toBeFalse();
    });

    it('does not make a second request if castles already loaded', () => {
      service.loadCastles();
      httpTesting.expectOne('/assets/data/castles_enriched.json').flush(castles);
      service.loadCastles();
      httpTesting.expectNone('/assets/data/castles_enriched.json');
    });
  });

  describe('getCastleByCode', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns castle matching the code', () => {
      expect(service.getCastleByCode('c2')?.castle_name).toBe('Beta');
    });

    it('returns undefined for unknown code', () => {
      expect(service.getCastleByCode('unknown')).toBeUndefined();
    });
  });

  describe('getAllByScore', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns all castles sorted by score_total descending', () => {
      const result = service.getAllByScore();
      expect(result.map(c => c.castle_code)).toEqual(['c1', 'c2', 'c3', 'c4']);
    });
  });

  describe('getTopByScore', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns the top N castles by score_total', () => {
      const top2 = service.getTopByScore(2);
      expect(top2.length).toBe(2);
      expect(top2[0].castle_code).toBe('c1');
      expect(top2[1].castle_code).toBe('c2');
    });
  });

  describe('getTopByVisitors', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns the top N castles by score_visitors', () => {
      const top2 = service.getTopByVisitors(2);
      expect(top2.length).toBe(2);
      expect(top2[0].castle_code).toBe('c2');
      expect(top2[1].castle_code).toBe('c1');
    });
  });

  describe('getTopByCountry', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('filters by country case-insensitively and returns N', () => {
      const result = service.getTopByCountry('france', 1);
      expect(result.length).toBe(1);
    });

    it('matches regardless of input case', () => {
      const result = service.getTopByCountry('FRANCE', 10);
      expect(result.length).toBe(2);
    });
  });

  describe('getCastlesByCountry', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns castles for exact country match', () => {
      const result = service.getCastlesByCountry('France');
      expect(result.length).toBe(2);
    });

    it('returns empty for unknown country', () => {
      expect(service.getCastlesByCountry('Spain').length).toBe(0);
    });
  });

  describe('getCountries', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns unique countries sorted alphabetically', () => {
      expect(service.getCountries()).toEqual(['France', 'Germany']);
    });
  });

  describe('getCastleTypes', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns unique non-empty types sorted', () => {
      const types = service.getCastleTypes();
      expect(types).toContain('Mountain castle');
      expect(types).toContain('Rock castle');
      expect(types).toContain('Water castle');
      expect(types).not.toContain('');
    });
  });

  describe('getCastleConcepts', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns unique non-empty concepts sorted', () => {
      const concepts = service.getCastleConcepts();
      expect(concepts).toEqual(['Motte-and-bailey', 'Ringwork']);
    });
  });

  describe('getCastleConditions', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns unique non-empty conditions sorted', () => {
      const conditions = service.getCastleConditions();
      expect(conditions).toContain('Intact');
      expect(conditions).toContain('Ruined/Partly remained');
      expect(conditions).not.toContain('');
    });
  });

  describe('getPreviousCastle / getNextCastle', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('getPreviousCastle returns castle with higher score', () => {
      expect(service.getPreviousCastle('c2')?.castle_code).toBe('c1');
    });

    it('getPreviousCastle returns undefined for top castle', () => {
      expect(service.getPreviousCastle('c1')).toBeUndefined();
    });

    it('getNextCastle returns castle with lower score', () => {
      expect(service.getNextCastle('c1')?.castle_code).toBe('c2');
    });

    it('getNextCastle returns undefined for last castle', () => {
      expect(service.getNextCastle('c4')).toBeUndefined();
    });
  });

  describe('getPreviousCastleInCountry / getNextCastleInCountry', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('getPreviousCastleInCountry returns prev castle in same country by position', () => {
      expect(service.getPreviousCastleInCountry('c2')?.castle_code).toBe('c1');
    });

    it('getPreviousCastleInCountry returns undefined for first in country', () => {
      expect(service.getPreviousCastleInCountry('c1')).toBeUndefined();
    });

    it('getNextCastleInCountry returns next castle in same country by position', () => {
      expect(service.getNextCastleInCountry('c1')?.castle_code).toBe('c2');
    });

    it('getNextCastleInCountry returns undefined for last in country', () => {
      expect(service.getNextCastleInCountry('c2')).toBeUndefined();
    });

    it('returns undefined for unknown code', () => {
      expect(service.getPreviousCastleInCountry('unknown')).toBeUndefined();
      expect(service.getNextCastleInCountry('unknown')).toBeUndefined();
    });
  });

  describe('getCountrySummaries', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('aggregates castles by country sorted by totalScore descending', () => {
      const summaries = service.getCountrySummaries();
      expect(summaries[0].country).toBe('France');
      expect(summaries[0].castleCount).toBe(2);
      expect(summaries[0].totalScore).toBe(180);
      expect(summaries[1].country).toBe('Germany');
      expect(summaries[1].castleCount).toBe(2);
      expect(summaries[1].totalScore).toBe(100);
    });
  });

  describe('getRegionSummaries', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('aggregates castles by region sorted by totalScore descending', () => {
      const summaries = service.getRegionSummaries();
      const normandy = summaries.find(s => s.region === 'Normandy');
      expect(normandy?.castleCount).toBe(2);
      expect(normandy?.totalScore).toBe(180);
      expect(normandy?.country).toBe('France');
    });
  });

  describe('getAreas', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('splits comma-separated areas, deduplicates, and sorts', () => {
      const areas = service.getAreas();
      expect(areas).toEqual(['Berry', 'Loire']);
    });

    it('excludes empty area values', () => {
      expect(service.getAreas()).not.toContain('');
    });
  });

  describe('getEras', () => {
    beforeEach(() => { service.castles.set(castles); });

    it('returns unique non-null positive eras sorted ascending', () => {
      expect(service.getEras()).toEqual([1100, 1300]);
    });
  });
});
