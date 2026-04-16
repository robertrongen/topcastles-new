import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Castle } from '../models/castle.model';

@Injectable({ providedIn: 'root' })
export class CastleService {
  private http = inject(HttpClient);

  castles = signal<Castle[]>([]);
  loading = signal(false);

  loadCastles(): void {
    if (this.castles().length > 0) {
      return;
    }
    this.loading.set(true);
    this.http.get<Castle[]>('/assets/data/castles.json').subscribe({
      next: (data) => {
        this.castles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load castles:', err);
        this.loading.set(false);
      },
    });
  }

  getCastleByCode(code: string): Castle | undefined {
    return this.castles().find((c) => c.castle_code === code);
  }

  getTop100(): Castle[] {
    return this.castles()
      .slice()
      .sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0))
      .slice(0, 100);
  }

  getTopByScore(count: number): Castle[] {
    return this.castles()
      .slice()
      .sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0))
      .slice(0, count);
  }

  getTopByVisitors(count: number): Castle[] {
    return this.castles()
      .slice()
      .sort((a, b) => (b.score_visitors ?? 0) - (a.score_visitors ?? 0))
      .slice(0, count);
  }

  getTopByCountry(country: string, count: number): Castle[] {
    return this.castles()
      .filter((c) => c.country?.toLowerCase() === country.toLowerCase())
      .slice(0, count);
  }

  getCastlesByCountry(country: string): Castle[] {
    return this.castles().filter((c) => c.country === country);
  }

  getCountries(): string[] {
    const countries = new Set(this.castles().map((c) => c.country));
    return [...countries].sort();
  }

  getCastleTypes(): string[] {
    const types = new Set(
      this.castles()
        .map((c) => c.castle_type)
        .filter(Boolean)
    );
    return [...types].sort();
  }
}
