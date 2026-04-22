import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CastleTableComponent } from './castle-table.component';
import { Castle } from '../../models/castle.model';

function makeCastle(overrides: Partial<Castle> = {}): Castle {
  return {
    position: 1, castle_code: 'test', castle_name: 'Test Castle',
    country: 'France', area: '', place: 'Paris',
    region: 'Ile-de-France', region_code: 'ile-de-france',
    latitude: 0, longitude: 0, founder: '', era: null,
    castle_type: 'City castle', castle_concept: '', condition: '',
    remarkable: '', description: '', website: '',
    score_total: 50.7, score_visitors: 30, visitors: 10,
    ...overrides,
  };
}

/** Set a real height on the CDK virtual scroll viewport so items render in tests. */
function renderVirtualScroll(fixture: ComponentFixture<CastleTableComponent>): void {
  fixture.detectChanges();
  const vpEl = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
  if (vpEl) {
    Object.defineProperty(vpEl, 'clientHeight', { get: () => 600, configurable: true });
    Object.defineProperty(vpEl, 'clientWidth',  { get: () => 1200, configurable: true });
    const vpInstance = fixture.debugElement.query(By.directive(CdkVirtualScrollViewport))?.componentInstance as CdkVirtualScrollViewport | undefined;
    vpInstance?.checkViewportSize();
  }
  flush();
  fixture.detectChanges();
}

function bodyCell(fixture: ComponentFixture<CastleTableComponent>, col: string): HTMLElement {
  return fixture.nativeElement.querySelector(`.body-row .col-${col}`) as HTMLElement;
}

describe('CastleTableComponent', () => {
  let fixture: ComponentFixture<CastleTableComponent>;
  let component: CastleTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastleTableComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(CastleTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.castles = []; component.columns = ['position', 'castle_name'];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a header cell for each visible column', () => {
    component.castles = [makeCastle()];
    component.columns = ['position', 'score_total', 'castle_name', 'country'];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.header-cell').length).toBe(4);
  });

  it('should display castle data in body rows', fakeAsync(() => {
    component.castles = [
      makeCastle({ position: 1, castle_name: 'Alpha' }),
      makeCastle({ position: 2, castle_name: 'Beta' }),
    ];
    component.columns = ['position', 'castle_name'];
    renderVirtualScroll(fixture);
    expect(fixture.nativeElement.querySelectorAll('.body-row').length).toBe(2);
  }));

  it('should round score_total to whole number', fakeAsync(() => {
    component.castles = [makeCastle({ score_total: 123.456 })];
    component.columns = ['score_total'];
    renderVirtualScroll(fixture);
    expect(bodyCell(fixture, 'score_total').textContent?.trim()).toBe('123');
  }));

  it('should show thumbnail image', fakeAsync(() => {
    component.castles = [makeCastle({ castle_code: 'tower' })];
    component.columns = ['thumbnail'];
    renderVirtualScroll(fixture);
    const img = fixture.nativeElement.querySelector('.col-thumbnail img') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src') || img?.src).toContain('tower_small.jpg');
  }));

  it('should show region map image when region_code exists', fakeAsync(() => {
    component.castles = [makeCastle({ region: 'Bayern', region_code: 'bayern' })];
    component.columns = ['region'];
    renderVirtualScroll(fixture);
    const cell = bodyCell(fixture, 'region');
    expect(cell.textContent).toContain('Bayern');
    const img = cell.querySelector('img.region-map') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src') || img?.src).toContain('bayern.jpg');
  }));

  it('should not show region map image when region_code is empty', () => {
    component.castles = [makeCastle({ region: 'Unknown', region_code: '' })];
    component.columns = ['region'];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.col-region img.region-map')).toBeNull();
  });

  it('should sort ascending when sortBy is called', () => {
    component.castles = [makeCastle({ position: 2 }), makeCastle({ position: 1 })];
    component.columns = ['position'];
    fixture.detectChanges();
    component.sortBy('position');
    expect(component.displayData()[0].position).toBe(1);
    expect(component.displayData()[1].position).toBe(2);
  });

  it('should toggle sort direction on repeated sortBy call', () => {
    component.castles = [makeCastle()];
    component.columns = ['position'];
    fixture.detectChanges();
    component.sortBy('position');
    expect(component.sortDir()).toBe('asc');
    component.sortBy('position');
    expect(component.sortDir()).toBe('desc');
  });

  it('should hide broken images via onImgError', () => {
    const img = document.createElement('img');
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img });
    component.onImgError(event);
    expect(img.style.display).toBe('none');
  });

  it('should show castle_type as plain text without a link', fakeAsync(() => {
    component.castles = [makeCastle({ castle_type: 'Water castle' })];
    component.columns = ['castle_type'];
    renderVirtualScroll(fixture);
    const cell = bodyCell(fixture, 'castle_type');
    expect(cell.textContent?.trim()).toBe('Water castle');
    expect(cell.querySelector('a')).toBeNull();
  }));

  it('should link country to filtered castle list', fakeAsync(() => {
    component.castles = [makeCastle({ country: 'Germany' })];
    component.columns = ['country'];
    renderVirtualScroll(fixture);
    const link = fixture.nativeElement.querySelector('.col-country a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('Germany');
  }));
});
