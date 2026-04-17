import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitorsPageComponent } from './visitors-page.component';
import { CastleService } from '../../services/castle.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

const mockCastles = [
  { position: 1, castle_code: 'foo', castle_name: 'Foo', country: 'Bar', area: '', place: 'Baz', region: 'Qux', region_code: '', latitude: null, longitude: null, founder: '', era: null, castle_type: '', castle_concept: '', condition: '', remarkable: '', description: '', website: '', score_total: 100, score_visitors: null, visitors: null },
  { position: 2, castle_code: 'bar', castle_name: 'Bar', country: 'Baz', area: '', place: 'Qux', region: 'Quux', region_code: '', latitude: null, longitude: null, founder: '', era: null, castle_type: '', castle_concept: '', condition: '', remarkable: '', description: '', website: '', score_total: 200, score_visitors: null, visitors: null },
];


import { signal } from '@angular/core';

class MockCastleService {
  castles = signal(mockCastles);
}

describe('VisitorsPageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VisitorsPageComponent, NoopAnimationsModule],
      providers: [
        { provide: CastleService, useClass: MockCastleService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(VisitorsPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the page title', () => {
    const fixture = TestBed.createComponent(VisitorsPageComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Castles without a photo');
  });

  it('should render a table of castles without photos', () => {
    const fixture = TestBed.createComponent(VisitorsPageComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
