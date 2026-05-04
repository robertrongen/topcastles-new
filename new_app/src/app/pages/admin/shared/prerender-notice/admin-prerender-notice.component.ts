import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-prerender-notice',
  standalone: true,
  template: `
    <aside class="prerender-notice" role="note" aria-label="Prerender publishing notice">
      <div class="prerender-notice__left">
        <span class="prerender-notice__eyebrow">PRERENDER NOTICE</span>
        <p class="prerender-notice__body">
          Changes to overlay files take effect immediately via the runtime API but do not appear in
          prerendered pages until the next full build and deployment. Prerendered pages will continue
          to show the previous state until then.
        </p>
      </div>
      <div class="prerender-notice__right">
        <span class="prerender-notice__last-label">LAST BUILD</span>
        <span class="prerender-notice__date">{{ buildDate() }}</span>
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
      margin-bottom: 32px;
    }
    .prerender-notice__eyebrow {
      display: block;
      font: 600 10px/1 var(--tk-font-sans);
      text-transform: uppercase;
      letter-spacing: .16em;
      color: var(--heraldic-red);
      margin-bottom: 8px;
    }
    .prerender-notice__body {
      font: 400 13px/1.6 var(--tk-font-sans);
      color: var(--text-3);
      margin: 0;
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
  readonly buildDate = input<string>('build date unknown');
}
