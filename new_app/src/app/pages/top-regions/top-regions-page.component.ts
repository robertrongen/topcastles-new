import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CastleService } from '../../services/castle.service';
import { RegionSummary } from '../../models/castle.model';

@Component({
  selector: 'app-top-regions-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatTableModule, MatSortModule],
  templateUrl: './top-regions-page.component.html',
  styleUrl: './top-regions-page.component.scss',
})
export class TopRegionsPageComponent implements OnInit {
  private castleService = inject(CastleService);

  summaries = computed(() =>
    this.sorted.length ? this.sorted : this.castleService.getRegionSummaries()
  );
  columns = ['rank', 'region', 'country', 'castleCount', 'totalScore'];
  sorted: RegionSummary[] = [];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }

  onSort(sort: Sort): void {
    const data = this.castleService.getRegionSummaries();
    if (!sort.active || sort.direction === '') { this.sorted = []; return; }
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.active as keyof RegionSummary;
    this.sorted = [...data].sort((a, b) => {
      const va = a[key], vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return -dir;
      if (vb == null) return dir;
      return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
    });
  }
}
