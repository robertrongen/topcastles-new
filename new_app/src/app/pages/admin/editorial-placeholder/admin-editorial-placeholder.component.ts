import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-editorial-placeholder',
  imports: [RouterLink],
  template: `
    <nav class="crumbs">
      <span class="crumbs__seg">Editorial annex</span>
      <span class="crumbs__chev">›</span>
      <a class="crumbs__seg" routerLink="/admin/editorial">Overview</a>
      <span class="crumbs__chev">›</span>
      <span class="crumbs__seg crumbs__seg--current">Editor</span>
    </nav>
    <p class="placeholder-note">Editor coming in next gate.</p>
  `,
  styles: [`
    :host { display: block; }
    .crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
    .crumbs__seg { font: 600 11px/1 var(--tk-font-sans); text-transform: uppercase; letter-spacing: .10em; color: var(--text-5); text-decoration: none; }
    .crumbs__seg--current { color: var(--text-2); }
    .crumbs__seg[href]:hover { color: var(--ochre); }
    .crumbs__chev { font: 400 11px/1 var(--tk-font-sans); color: var(--text-6); }
    .placeholder-note { font: italic 400 15px/1.6 var(--tk-font-serif); color: var(--text-4); }
  `],
})
export class AdminEditorialPlaceholderComponent {}
