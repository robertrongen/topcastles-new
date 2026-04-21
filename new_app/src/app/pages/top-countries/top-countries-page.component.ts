import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CastleService } from '../../services/castle.service';
import { CountrySummary } from '../../models/castle.model';

@Component({
  selector: 'app-top-countries-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatTableModule, MatSortModule],
  templateUrl: './top-countries-page.component.html',
  styleUrl: './top-countries-page.component.scss',
})
export class TopCountriesPageComponent {
  private castleService = inject(CastleService);

  summaries = computed(() =>
    this.sorted.length ? this.sorted : this.castleService.getCountrySummaries()
  );
  columns = ['rank', 'country', 'castleCount', 'totalScore'];
  sorted: CountrySummary[] = [];

  onSort(sort: Sort): void {
    const data = this.castleService.getCountrySummaries();
    if (!sort.active || sort.direction === '') { this.sorted = []; return; }
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.active as keyof CountrySummary;
    this.sorted = [...data].sort((a, b) => {
      const va = a[key], vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return -dir;
      if (vb == null) return dir;
      return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
    });
  }
}
