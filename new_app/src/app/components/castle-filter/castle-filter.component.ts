import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Castle } from '../../models/castle.model';

export interface FilterField {
  key: string;
  label: string;
}

@Component({
  selector: 'app-castle-filter',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './castle-filter.component.html',
  styleUrl: './castle-filter.component.scss',
})
export class CastleFilterComponent {
  castles = input<Castle[]>([]);
  fields = input<FilterField[]>([]);

  private activeFilters = signal<Record<string, string>>({});

  allOptions = computed<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    for (const field of this.fields()) {
      const vals = new Set<string>();
      for (const c of this.castles()) {
        const v = c[field.key as keyof Castle];
        if (v != null && v !== '') vals.add(String(v));
      }
      result[field.key] = [...vals].sort();
    }
    return result;
  });

  filtered = computed<Castle[]>(() => {
    const filters = this.activeFilters();
    const active = Object.entries(filters).filter(([, v]) => v !== '');
    if (!active.length) return this.castles();
    return this.castles().filter(c =>
      active.every(([key, val]) => {
        const cv = c[key as keyof Castle];
        return cv != null && String(cv) === val;
      })
    );
  });

  hasActiveFilters = computed(() =>
    Object.values(this.activeFilters()).some(v => v !== '')
  );

  getFilter(key: string): string {
    return this.activeFilters()[key] ?? '';
  }

  setFilter(key: string, value: string): void {
    this.activeFilters.update(f => ({ ...f, [key]: value }));
  }

  clearFilters(): void {
    this.activeFilters.set({});
  }
}
