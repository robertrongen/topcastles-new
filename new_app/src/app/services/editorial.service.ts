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

export interface CountryEditorial {
  editorialNote?: string;
  definingTradition?: string;
  editorSleeper?: boolean;
}

export interface PeriodPick {
  code: string;
  name: string;
}

export interface BrowseBand {
  note?: string;
}

export interface RegionEditorial {
  description?: string;
  editorSleeper?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EditorialService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private _castleQuotes = signal<Record<string, CastleQuote>>({});
  readonly castleQuotes = this._castleQuotes.asReadonly();

  private _countries = signal<Record<string, CountryEditorial>>({});
  readonly countries = this._countries.asReadonly();

  private _periodPicks = signal<Record<string, PeriodPick>>({});
  readonly periodPicks = this._periodPicks.asReadonly();

  private _browseBands = signal<Record<string, BrowseBand>>({});
  readonly browseBands = this._browseBands.asReadonly();

  private _regions = signal<Record<string, RegionEditorial>>({});
  readonly regions = this._regions.asReadonly();

  private browseBandsLoaded = false;
  private regionsLoaded = false;

  constructor() {
    // Editorial overlay is runtime-only — skip during SSR/prerender.
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<Record<string, CastleQuote>>('/api/editorial/castle-quotes')
        .subscribe({
          next: data => this._castleQuotes.set(data ?? {}),
          error: () => {},
        });

      this.http.get<Record<string, CountryEditorial>>('/api/editorial/countries')
        .subscribe({
          next: data => this._countries.set(data ?? {}),
          error: () => {},
        });

      this.http.get<Record<string, PeriodPick>>('/api/editorial/period-picks')
        .subscribe({
          next: data => this._periodPicks.set(data ?? {}),
          error: () => {},
        });
    }
  }

  loadBrowseBands(): void {
    if (!isPlatformBrowser(this.platformId) || this.browseBandsLoaded) {
      return;
    }

    this.browseBandsLoaded = true;
    this.http.get<Record<string, BrowseBand>>('/api/editorial/browse-bands')
      .subscribe({
        next: data => this._browseBands.set(data ?? {}),
        error: () => {},
      });
  }

  loadRegions(): void {
    if (!isPlatformBrowser(this.platformId) || this.regionsLoaded) {
      return;
    }

    this.regionsLoaded = true;
    this.http.get<Record<string, RegionEditorial>>('/api/editorial/regions')
      .subscribe({
        next: data => this._regions.set(data ?? {}),
        error: () => {},
      });
  }
}
