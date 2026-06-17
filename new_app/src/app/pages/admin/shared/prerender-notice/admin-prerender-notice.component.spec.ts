import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPrerenderNoticeComponent, EditorialPublishStatus } from './admin-prerender-notice.component';

describe('AdminPrerenderNoticeComponent', () => {
  let fixture: ComponentFixture<AdminPrerenderNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPrerenderNoticeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPrerenderNoticeComponent);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('shows unknown build and no edit when publish status has not loaded', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('build date unknown');
    expect(text).toContain('none recorded');
  });

  it('shows build, edit, and deploy handoff when rebuild is required', () => {
    const status: EditorialPublishStatus = {
      lastBuildAt: '2026-05-01T00:00:00.000Z',
      lastEditAt: '2026-05-10T12:30:00.000Z',
      needsRebuild: true,
      deployCommand: 'npm run build && git push',
    };
    fixture.componentRef.setInput('publishStatus', status);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Changes not yet published');
    expect(text).toContain('Fri, 01 May 2026 00:00 UTC');
    expect(text).toContain('Sun, 10 May 2026 12:30 UTC');
    expect(text).toContain('npm run build && git push');
  });

  it('shows the published state when no rebuild is needed', () => {
    fixture.componentRef.setInput('publishStatus', {
      lastBuildAt: '2026-05-11T00:00:00.000Z',
      lastEditAt: '2026-05-10T12:30:00.000Z',
      needsRebuild: false,
      deployCommand: './deploy.sh',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Editorial overlay is fully published.');
  });
});
