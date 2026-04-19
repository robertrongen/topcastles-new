import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CastleMapComponent } from './castle-map.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'c1',
    castle_name: 'Castle One',
    country: 'France',
    area: '',
    place: 'Paris',
    region: '',
    region_code: '',
    latitude: 48.8,
    longitude: 2.3,
    founder: '',
    era: null,
    castle_type: '',
    castle_concept: '',
    condition: '',
    remarkable: '',
    description: '',
    website: '',
    score_total: 500,
    score_visitors: 7,
    visitors: 100,
    ...overrides,
  };
}

describe('CastleMapComponent', () => {
  let component: CastleMapComponent;
  let fixture: ComponentFixture<CastleMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastleMapComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CastleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render map container element', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.castle-map')).toBeTruthy();
  });

  it('should accept castles input without error', () => {
    const castles = [
      makeCastle({ castle_code: 'c1', score_total: 900, latitude: 48.8, longitude: 2.3 }),
      makeCastle({ castle_code: 'c2', score_total: 500, latitude: 49.0, longitude: 2.5 }),
      makeCastle({ castle_code: 'c3', score_total: 100, latitude: null!, longitude: null! }),
    ];
    fixture.componentRef.setInput('castles', castles);
    fixture.detectChanges();
    expect(component.castles().length).toBe(3);
  });

  it('should default autoFit to true', () => {
    expect(component.autoFit()).toBeTrue();
  });

  it('should accept autoFit false input', () => {
    fixture.componentRef.setInput('autoFit', false);
    fixture.detectChanges();
    expect(component.autoFit()).toBeFalse();
  });
});
