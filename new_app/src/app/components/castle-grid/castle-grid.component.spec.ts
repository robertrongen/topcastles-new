import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CastleGridComponent } from './castle-grid.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'france',
    area: '',
    place: '',
    region: '',
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

describe('CastleGridComponent', () => {
  let fixture: ComponentFixture<CastleGridComponent>;
  let component: CastleGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastleGridComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CastleGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a tile for each castle', () => {
    component.castles = [
      makeCastle({ castle_code: 'a', castle_name: 'Castle A' }),
      makeCastle({ castle_code: 'b', castle_name: 'Castle B' }),
    ];
    fixture.detectChanges();
    const tiles = fixture.nativeElement.querySelectorAll('.castle-tile');
    expect(tiles.length).toBe(2);
  });

  it('should display castle name and country', () => {
    component.castles = [
      makeCastle({ castle_code: 'a', castle_name: 'Alhambra', country: 'Spain' }),
    ];
    fixture.detectChanges();
    const tile = fixture.nativeElement.querySelector('.castle-tile');
    expect(tile.textContent).toContain('Alhambra');
    expect(tile.textContent).toContain('Spain');
  });

  it('should link to castle detail page', () => {
    component.castles = [
      makeCastle({ castle_code: 'alhambra', castle_name: 'Alhambra' }),
    ];
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.castle-tile');
    expect(link.getAttribute('href')).toBe('/castles/alhambra');
  });
});
