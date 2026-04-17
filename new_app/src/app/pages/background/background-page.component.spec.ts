import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundPageComponent } from './background-page.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BackgroundPageComponent', () => {
  function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [BackgroundPageComponent, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of(queryParams) } },
      ],
    });

    const fixture: ComponentFixture<BackgroundPageComponent> = TestBed.createComponent(BackgroundPageComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    const { fixture } = setup();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Background');
  });

  it('should have 7 tabs', () => {
    const { fixture } = setup();
    const tabs = fixture.nativeElement.querySelectorAll('.mdc-tab');
    expect(tabs.length).toBe(7);
  });

  it('should display Definition tab by default', () => {
    const { component } = setup();
    expect(component.selectedIndex()).toBe(0);
  });

  it('should switch to Scores tab when sub=scores query param', () => {
    const { component } = setup({ sub: 'scores' });
    expect(component.selectedIndex()).toBe(1);
  });

  it('should switch to Resources tab when sub=referenties query param', () => {
    const { component } = setup({ sub: 'referenties' });
    expect(component.selectedIndex()).toBe(2);
  });

  it('should switch to Castle types tab when sub=soorten query param', () => {
    const { component } = setup({ sub: 'soorten' });
    expect(component.selectedIndex()).toBe(3);
  });

  it('should switch to Photographers tab when sub=bijdragen query param', () => {
    const { component } = setup({ sub: 'bijdragen' });
    expect(component.selectedIndex()).toBe(6);
  });

  it('should default to index 0 for unknown sub param', () => {
    const { component } = setup({ sub: 'unknown' });
    expect(component.selectedIndex()).toBe(0);
  });

  it('should contain castle definition blockquote', () => {
    const { fixture } = setup();
    const blockquote = fixture.nativeElement.querySelector('blockquote');
    expect(blockquote?.textContent).toContain('medieval building');
  });

  it('should contain links to nocastle pages', () => {
    const { fixture } = setup();
    const links = fixture.nativeElement.querySelectorAll('a[href*="/nocastle/"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should update selectedIndex on onTabChange', () => {
    const { component } = setup();
    component.onTabChange(3);
    expect(component.selectedIndex()).toBe(3);
  });

  it('should not contain an email or contribute link', () => {
    const { fixture } = setup({ sub: 'bijdragen' });
    fixture.detectChanges();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a[href^="mailto:"]');
    expect(links.length).toBe(0);
  });

  it('should not contain "Want to contribute" text', () => {
    const { fixture } = setup({ sub: 'bijdragen' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Want to contribute');
  });
});
