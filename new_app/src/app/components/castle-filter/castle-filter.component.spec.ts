import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CastleFilterComponent, FilterField } from './castle-filter.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test Castle',
    country: 'France', area: '', place: '', region: '', region_code: '',
    latitude: 0, longitude: 0, founder: '', era: null,
    castle_type: '', castle_concept: '', condition: '', remarkable: '',
    description: '', website: '', score_total: 50, score_visitors: 30,
    visitors: 10, ...overrides,
  };
}

const castles: Castle[] = [
  makeCastle({ castle_code: 'a', country: 'France', castle_type: 'City castle', condition: 'Intact' }),
  makeCastle({ castle_code: 'b', country: 'Germany', castle_type: 'Rock castle', condition: 'Damaged' }),
  makeCastle({ castle_code: 'c', country: 'France', castle_type: 'Water castle', condition: 'Intact' }),
];

const fields: FilterField[] = [
  { key: 'country' as const, label: 'Country' },
  { key: 'castle_type' as const, label: 'Type' },
  { key: 'condition' as const, label: 'Condition' },
];

describe('CastleFilterComponent', () => {
  let fixture: ComponentFixture<CastleFilterComponent>;
  let component: CastleFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastleFilterComponent, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(CastleFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('castles', castles);
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render a dropdown per field', () => {
    const selects = fixture.nativeElement.querySelectorAll('mat-select');
    expect(selects.length).toBe(3);
  });

  it('filtered() returns all castles when no filter active', () => {
    expect(component.filtered().length).toBe(3);
  });

  it('filtered() returns matching castles after setFilter', () => {
    component.setFilter('country', 'France');
    expect(component.filtered().length).toBe(2);
    expect(component.filtered().every(c => c.country === 'France')).toBeTrue();
  });

  it('filtered() supports multiple simultaneous filters', () => {
    component.setFilter('country', 'France');
    component.setFilter('condition', 'Intact');
    expect(component.filtered().length).toBe(2);
  });

  it('clearFilters() resets all filters', () => {
    component.setFilter('country', 'France');
    component.clearFilters();
    expect(component.filtered().length).toBe(3);
    expect(component.hasActiveFilters()).toBeFalse();
  });

  it('allOptions computes unique sorted values per field', () => {
    const opts = component.allOptions();
    expect(opts['country']).toEqual(['France', 'Germany']);
    expect(opts['condition']).toEqual(['Damaged', 'Intact']);
  });

  it('does not show clear button when no filters active', () => {
    expect(fixture.nativeElement.querySelector('.clear-btn')).toBeNull();
  });

  it('shows clear button when a filter is active', () => {
    component.setFilter('country', 'France');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.clear-btn')).toBeTruthy();
  });
});
