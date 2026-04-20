import { Component, Input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castle-table',
  standalone: true,
  imports: [DecimalPipe, RouterLink, MatTableModule, MatSortModule, MatIconModule],
  templateUrl: './castle-table.component.html',
  styleUrl: './castle-table.component.scss',
})
export class CastleTableComponent {
  @Input({ required: true }) castles: Castle[] = [];
  @Input({ required: true }) columns: string[] = [];

  sortedData: Castle[] = [];

  get tableData(): Castle[] {
    return this.sortedData.length ? this.sortedData : this.castles;
  }

  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortedData = [];
      return;
    }
    this.sortedData = [...this.castles].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const key = sort.active as keyof Castle;
      const valA = a[key];
      const valB = b[key];
      if (valA == null && valB == null) return 0;
      if (valA == null) return isAsc ? -1 : 1;
      if (valB == null) return isAsc ? 1 : -1;
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * (isAsc ? 1 : -1);
    });
  }

  eraLabel(era: number | null): string {
    if (era == null) return '';
    const n = era % 100;
    const m = era % 10;
    const suffix = (n >= 11 && n <= 13) ? 'th' : (m === 1 ? 'st' : m === 2 ? 'nd' : m === 3 ? 'rd' : 'th');
    return `${era}${suffix} c.`;
  }

  failedLocal = signal(new Set<string>());
  failedWiki  = signal(new Set<string>());

  onLocalError(castle: Castle): void {
    this.failedLocal.update(s => new Set(s).add(castle.castle_code));
  }

  onWikiError(castle: Castle): void {
    this.failedWiki.update(s => new Set(s).add(castle.castle_code));
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
