import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoCastleService } from './no-castle.service';
import { NoCastle } from '../models/castle.model';

function makeNoCastle(overrides: Partial<NoCastle> = {}): NoCastle {
  return {
    castle_code: 'nc1',
    castle_name: 'No Castle One',
    country: 'France',
    area: '',
    place: 'Paris',
    region: '',
    region_code: '',
    founder: '',
    era: null,
    castle_type: 'City castle',
    castle_concept: '',
    condition: '',
    remarkable: '',
    description: '',
    website: '',
    nocastle_type: 'City',
    score_visitors: null,
    visitors: null,
    ...overrides,
  };
}

describe('NoCastleService', () => {
  let service: NoCastleService;
  let httpTesting: HttpTestingController;

  const noCastles: NoCastle[] = [
    makeNoCastle({ castle_code: 'nc1', castle_name: 'Alpha' }),
    makeNoCastle({ castle_code: 'nc2', castle_name: 'Beta' }),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NoCastleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('loadNoCastles', () => {
    it('loads no-castles from JSON and sets signal', () => {
      service.loadNoCastles();
      httpTesting.expectOne('/assets/data/no_castles.json').flush(noCastles);
      expect(service.noCastles().length).toBe(2);
    });

    it('sets loading to true during request and false after', () => {
      service.loadNoCastles();
      expect(service.loading()).toBeTrue();
      httpTesting.expectOne('/assets/data/no_castles.json').flush(noCastles);
      expect(service.loading()).toBeFalse();
    });

    it('sets loading to false on error', () => {
      service.loadNoCastles();
      httpTesting.expectOne('/assets/data/no_castles.json').error(new ProgressEvent('error'));
      expect(service.loading()).toBeFalse();
    });

    it('does not make a second request if already loaded', () => {
      service.loadNoCastles();
      httpTesting.expectOne('/assets/data/no_castles.json').flush(noCastles);
      service.loadNoCastles();
      httpTesting.expectNone('/assets/data/no_castles.json');
    });
  });

  describe('getByCode', () => {
    beforeEach(() => { service.noCastles.set(noCastles); });

    it('returns the no-castle matching the code', () => {
      expect(service.getByCode('nc2')?.castle_name).toBe('Beta');
    });

    it('returns undefined for unknown code', () => {
      expect(service.getByCode('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    beforeEach(() => { service.noCastles.set(noCastles); });

    it('returns all no-castles', () => {
      expect(service.getAll().length).toBe(2);
    });
  });
});
