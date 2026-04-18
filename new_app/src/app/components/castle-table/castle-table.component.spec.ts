import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CastleTableComponent } from './castle-table.component';
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
    castle_type: 'City castle',
    castle_concept: '',
    condition: '',
    remarkable: '',
    description: '',
    website: '',
    score_total: 50.7,
    score_visitors: 30,
    visitors: 10,
    ...overrides,
  };
}

describe('CastleTableComponent', () => {
  let fixture: ComponentFixture<CastleTableComponent>;
  let component: CastleTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastleTableComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CastleTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.castles = [];
    component.columns = ['position', 'castle_name'];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the specified columns', () => {
    component.castles = [makeCastle()];
    component.columns = ['position', 'score_total', 'castle_name', 'country'];
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(4);
  });

  it('should display castle data in rows', () => {
    component.castles = [
      makeCastle({ position: 1, castle_name: 'Alpha', score_total: 100 }),
      makeCastle({ position: 2, castle_name: 'Beta', score_total: 80 }),
    ];
    component.columns = ['position', 'castle_name', 'score_total'];
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should round score_total to whole number', () => {
    component.castles = [makeCastle({ score_total: 123.456 })];
    component.columns = ['score_total'];
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('td.mat-column-score_total');
    expect(cell.textContent.trim()).toBe('123');
  });

  it('should show thumbnail image', () => {
    component.castles = [makeCastle({ castle_code: 'tower' })];
    component.columns = ['thumbnail'];
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('td.mat-column-thumbnail img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src') || img.src).toContain('tower_small.jpg');
  });

  it('should show region map image when region_code exists', () => {
    component.castles = [makeCastle({ region: 'Bayern', region_code: 'bayern' })];
    component.columns = ['region'];
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('td.mat-column-region');
    expect(cell.textContent).toContain('Bayern');
    const img = cell.querySelector('img.region-map');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src') || img.src).toContain('bayern.jpg');
  });

  it('should not show region map image when region_code is empty', () => {
    component.castles = [makeCastle({ region: 'Unknown', region_code: '' })];
    component.columns = ['region'];
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('td.mat-column-region img.region-map');
    expect(img).toBeNull();
  });

  it('should sort data when onSortChange is called', () => {
    component.castles = [
      makeCastle({ position: 2, castle_name: 'Beta' }),
      makeCastle({ position: 1, castle_name: 'Alpha' }),
    ];
    component.columns = ['position', 'castle_name'];
    fixture.detectChanges();

    component.onSortChange({ active: 'position', direction: 'asc' });
    expect(component.tableData[0].position).toBe(1);
    expect(component.tableData[1].position).toBe(2);
  });

  it('should reset sort when direction is empty', () => {
    component.castles = [makeCastle({ position: 2 }), makeCastle({ position: 1 })];
    component.columns = ['position'];

    component.onSortChange({ active: 'position', direction: 'asc' });
    expect(component.sortedData.length).toBe(2);

    component.onSortChange({ active: 'position', direction: '' });
    expect(component.sortedData.length).toBe(0);
  });

  it('should hide broken images via onImgError', () => {
    const img = document.createElement('img');
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img });
    component.onImgError(event);
    expect(img.style.display).toBe('none');
  });

  it('should show castle_type column when included', () => {
    component.castles = [makeCastle({ castle_type: 'Water castle' })];
    component.columns = ['castle_type'];
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('td.mat-column-castle_type');
    expect(cell.textContent.trim()).toBe('Water castle');
  });

  it('should link country to country detail page', () => {
    component.castles = [makeCastle({ country: 'Germany' })];
    component.columns = ['country'];
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('td.mat-column-country a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/countries/Germany');
  });

  it('should display castle_type as plain text', () => {
    component.castles = [makeCastle({ castle_type: 'Hilltop castle' })];
    component.columns = ['castle_type'];
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('td.mat-column-castle_type');
    expect(cell.textContent?.trim()).toBe('Hilltop castle');
    expect(cell.querySelector('a')).toBeNull();
  });
});
