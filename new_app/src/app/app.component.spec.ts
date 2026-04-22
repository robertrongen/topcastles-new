import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have the "Top Castles" title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('Top Castles');
  });

  it('should render the banner image in the toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('mat-toolbar img.tk-logo') as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.src).toContain('banner_en.gif');
  });

  it('should render primary nav links in the toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.tk-toolbar-nav');
    expect(nav).toBeTruthy();
    expect(nav.textContent).toContain('Top 1000');
    expect(nav.textContent).toContain('Background');
    expect(nav.textContent).toContain('Search');
  });

  it('should have a navigation toggle button in the toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('mat-toolbar button[aria-label="Toggle navigation"]');
    expect(btn).toBeTruthy();
  });
});
