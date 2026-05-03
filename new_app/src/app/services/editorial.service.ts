import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface CastleQuote {
  quote: string;
  author: string;
  role: string;
  date: string;
  featuredUntil?: string;
}

@Injectable({ providedIn: 'root' })
export class EditorialService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private _castleQuotes = signal<Record<string, CastleQuote>>({});
  readonly castleQuotes = this._castleQuotes.asReadonly();

  constructor() {
    // Editorial overlay is runtime-only — skip during SSR/prerender.
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<Record<string, CastleQuote>>('/api/editorial/castle-quotes')
        .subscribe({
          next: data => this._castleQuotes.set(data ?? {}),
          error: () => {},
        });
    }
  }
}
