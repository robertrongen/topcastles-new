import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Top Castles' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Top Castles');
  });

  it('should render the banner image in the toolbar without a text title span', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar?.querySelector('img.tk-logo')).toBeTruthy();
    expect(toolbar?.querySelector('.tk-title')).toBeNull();
  });

  it('should render the logo image in the masthead', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('mat-toolbar img.tk-logo') as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.src).toContain('banner_en.gif');
    expect(logo.alt).toBe('Topcastles logo');
  });

  it('should have a navigation toggle button in the toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('mat-toolbar button[aria-label="Toggle navigation"]');
    expect(btn).toBeTruthy();
  });
});
