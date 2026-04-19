import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Castle, CountrySummary, RegionSummary } from '../models/castle.model';

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
    this.http.get<Castle[]>('/assets/data/castles_enriched.json').subscribe({
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

  getAllByScore(): Castle[] {
    return this.castles()
      .slice()
      .sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0));
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

  getCastleConcepts(): string[] {
    const concepts = new Set(
      this.castles()
        .map((c) => c.castle_concept)
        .filter(Boolean)
    );
    return [...concepts].sort();
  }

  getCastleConditions(): string[] {
    const conditions = new Set(
      this.castles()
        .map((c) => c.condition)
        .filter(Boolean)
    );
    return [...conditions].sort();
  }

  /** Get the previous castle in the top-100 ranking (lower position number). */
  getPreviousCastle(code: string): Castle | undefined {
    const sorted = this.getAllByScore();
    const idx = sorted.findIndex((c) => c.castle_code === code);
    return idx > 0 ? sorted[idx - 1] : undefined;
  }

  /** Get the next castle in the top-100 ranking (higher position number). */
  getNextCastle(code: string): Castle | undefined {
    const sorted = this.getAllByScore();
    const idx = sorted.findIndex((c) => c.castle_code === code);
    return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined;
  }

  /** Get the previous castle within the same country (by position). */
  getPreviousCastleInCountry(code: string): Castle | undefined {
    const castle = this.getCastleByCode(code);
    if (!castle) return undefined;
    const countryCastles = this.castles()
      .filter((c) => c.country === castle.country && (c.score_total ?? 0) > 0)
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    const idx = countryCastles.findIndex((c) => c.castle_code === code);
    return idx > 0 ? countryCastles[idx - 1] : undefined;
  }

  /** Get the next castle within the same country (by position). */
  getNextCastleInCountry(code: string): Castle | undefined {
    const castle = this.getCastleByCode(code);
    if (!castle) return undefined;
    const countryCastles = this.castles()
      .filter((c) => c.country === castle.country && (c.score_total ?? 0) > 0)
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    const idx = countryCastles.findIndex((c) => c.castle_code === code);
    return idx >= 0 && idx < countryCastles.length - 1 ? countryCastles[idx + 1] : undefined;
  }

  getCountrySummaries(): CountrySummary[] {
    const map = new Map<string, { count: number; totalScore: number }>();
    for (const c of this.castles()) {
      if (!c.country) continue;
      const entry = map.get(c.country) ?? { count: 0, totalScore: 0 };
      entry.count++;
      entry.totalScore += c.score_total ?? 0;
      map.set(c.country, entry);
    }
    return [...map.entries()]
      .map(([country, { count, totalScore }]) => ({ country, castleCount: count, totalScore }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  getRegionSummaries(): RegionSummary[] {
    const map = new Map<string, { country: string; region_code: string; count: number; totalScore: number }>();
    for (const c of this.castles()) {
      if (!c.region) continue;
      const entry = map.get(c.region) ?? { country: c.country, region_code: c.region_code || '', count: 0, totalScore: 0 };
      entry.count++;
      entry.totalScore += c.score_total ?? 0;
      map.set(c.region, entry);
    }
    return [...map.entries()]
      .map(([region, { country, region_code, count, totalScore }]) => ({ region, country, region_code, castleCount: count, totalScore }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  getAreas(): string[] {
    const areas = new Set<string>();
    for (const c of this.castles()) {
      if (c.area) {
        for (const part of c.area.split(',')) {
          const trimmed = part.trim();
          if (trimmed) areas.add(trimmed);
        }
      }
    }
    return [...areas].sort();
  }

  getEras(): number[] {
    const eras = new Set(
      this.castles()
        .map((c) => c.era)
        .filter((e): e is number => e != null && e > 0)
    );
    return [...eras].sort((a, b) => a - b);
  }

}
