import { Component, input, computed } from '@angular/core';

export interface EditorialPublishStatus {
  lastBuildAt: string | null;
  lastEditAt: string | null;
  needsRebuild: boolean;
  deployCommand: string;
}

@Component({
  selector: 'app-admin-prerender-notice',
  standalone: true,
  template: `
    <aside
      class="prerender-notice"
      [class.prerender-notice--published]="publishStatus() !== null && !needsRebuild()"
      role="note"
      aria-label="Prerender publishing notice"
    >
      <div class="prerender-notice__left">
        <span class="prerender-notice__eyebrow">PRERENDER NOTICE</span>
        @if (publishStatus() === null) {
          <p class="prerender-notice__body">
            Changes to overlay files take effect immediately via the runtime API but do not appear in
            prerendered pages until the next full build and deployment.
          </p>
        } @else if (needsRebuild()) {
          <p class="prerender-notice__body">
            Changes not yet published to prerendered pages. Prerendered pages will show
            the previous state until the next full build and deployment.
          </p>
        } @else {
          <p class="prerender-notice__body prerender-notice__body--ok">
            Editorial overlay is fully published.
          </p>
        }
      </div>
      <div class="prerender-notice__right">
        <span class="prerender-notice__last-label">LAST BUILD</span>
        <span class="prerender-notice__date">{{ buildDateDisplay() }}</span>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; }
    .prerender-notice {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      padding: 18px 20px;
      background: var(--ink-card);
      border: 1px solid var(--ink-line-2);
      border-left: 3px solid var(--heraldic-red);
      margin-bottom: 16px;
    }
    .prerender-notice--published {
      border-left-color: var(--ochre);
    }
    .prerender-notice__eyebrow {
      display: block;
      font: 600 10px/1 var(--tk-font-sans);
      text-transform: uppercase;
      letter-spacing: .16em;
      color: var(--heraldic-red);
      margin-bottom: 8px;
    }
    .prerender-notice--published .prerender-notice__eyebrow {
      color: var(--ochre);
    }
    .prerender-notice__body {
      font: 400 13px/1.6 var(--tk-font-sans);
      color: var(--text-3);
      margin: 0;
    }
    .prerender-notice__body--ok {
      color: var(--text-4);
    }
    .prerender-notice__right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      white-space: nowrap;
    }
    .prerender-notice__last-label {
      font: 600 10px/1 var(--tk-font-sans);
      text-transform: uppercase;
      letter-spacing: .16em;
      color: var(--text-5);
    }
    .prerender-notice__date {
      font: 400 12px/1 var(--tk-font-mono, 'JetBrains Mono', monospace);
      color: var(--text-4);
    }
  `],
})
export class AdminPrerenderNoticeComponent {
  readonly publishStatus = input<EditorialPublishStatus | null>(null);

  readonly needsRebuild = computed(() => this.publishStatus()?.needsRebuild ?? false);

  readonly buildDateDisplay = computed(() => {
    const s = this.publishStatus();
    if (!s?.lastBuildAt) return 'build date unknown';
    const d = new Date(s.lastBuildAt);
    if (isNaN(d.getTime())) return s.lastBuildAt;
    return d.toUTCString().replace(/:\d{2} GMT$/, ' UTC');
  });
}
