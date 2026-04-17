import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TypesPageComponent } from './types-page.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1,
    castle_code: 'test',
    castle_name: 'Test Castle',
    country: 'France',
    area: '',
    place: 'Paris',
    region: 'Ile-de-France',
    region_code: 'ile-de-france',
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

describe('TypesPageComponent', () => {
  let fixture: ComponentFixture<TypesPageComponent>;
  let component: TypesPageComponent;
  let httpTesting: HttpTestingController;

  const castles: Castle[] = [
    makeCastle({ castle_code: 'c1', castle_name: 'Alpha', castle_type: 'Rock castle', castle_concept: 'Motte-and-bailey', condition: 'Intact', score_total: 100 }),
    makeCastle({ castle_code: 'c2', castle_name: 'Beta', castle_type: 'Rock castle', castle_concept: 'Rectangular or polygonal', condition: 'Damaged', score_total: 90 }),
    makeCastle({ castle_code: 'c3', castle_name: 'Gamma', castle_type: 'Water castle', castle_concept: 'Motte-and-bailey', condition: 'Intact', score_total: 80 }),
    makeCastle({ castle_code: 'c4', castle_name: 'Delta', castle_type: '', castle_concept: '', condition: '', score_total: 70 }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypesPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TypesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/assets/data/castles.json');
    req.flush(castles);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    const heading = el.querySelector('h2');
    expect(heading?.textContent).toContain('Castle Types');
  });

  it('should compute castle types excluding empty values', () => {
    const types = component.castleTypes();
    expect(types).toContain('Rock castle');
    expect(types).toContain('Water castle');
    expect(types.length).toBe(2);
  });

  it('should compute castle concepts excluding empty values', () => {
    const concepts = component.castleConcepts();
    expect(concepts).toContain('Motte-and-bailey');
    expect(concepts).toContain('Rectangular or polygonal');
    expect(concepts.length).toBe(2);
  });

  it('should compute castle conditions excluding empty values', () => {
    const conditions = component.castleConditions();
    expect(conditions).toContain('Intact');
    expect(conditions).toContain('Damaged');
    expect(conditions.length).toBe(2);
  });

  it('should filter castles by type', () => {
    component.selectedType.set('Rock castle');
    const results = component.filteredByType();
    expect(results.length).toBe(2);
    expect(results[0].castle_name).toBe('Alpha');
    expect(results[1].castle_name).toBe('Beta');
  });

  it('should filter castles by concept', () => {
    component.selectedConcept.set('Motte-and-bailey');
    const results = component.filteredByConcept();
    expect(results.length).toBe(2);
    expect(results[0].score_total ?? 0).toBeGreaterThan(results[1].score_total ?? 0);
  });

  it('should filter castles by condition', () => {
    component.selectedCondition.set('Intact');
    const results = component.filteredByCondition();
    expect(results.length).toBe(2);
  });

  it('should return empty array when no type selected', () => {
    expect(component.filteredByType().length).toBe(0);
  });

  it('should render three tabs', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tabs = el.querySelectorAll('.mat-mdc-tab');
    expect(tabs.length).toBe(3);
  });
});
