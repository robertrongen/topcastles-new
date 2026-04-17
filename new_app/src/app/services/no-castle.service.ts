import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NoCastle } from '../models/castle.model';

@Injectable({ providedIn: 'root' })
export class NoCastleService {
  private http = inject(HttpClient);

  noCastles = signal<NoCastle[]>([]);
  loading = signal(false);

  loadNoCastles(): void {
    if (this.noCastles().length > 0) {
      return;
    }
    this.loading.set(true);
    this.http.get<NoCastle[]>('/assets/data/no_castles.json').subscribe({
      next: (data) => {
        this.noCastles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load no_castles:', err);
        this.loading.set(false);
      },
    });
  }

  getByCode(code: string): NoCastle | undefined {
    return this.noCastles().find((c) => c.castle_code === code);
  }

  getAll(): NoCastle[] {
    return this.noCastles();
  }
}
