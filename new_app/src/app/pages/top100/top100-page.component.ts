import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CastleService } from '../../services/castle.service';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-top100-page',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatSortModule, CastleGridComponent],
  templateUrl: './top100-page.component.html',
  styleUrl: './top100-page.component.scss',
})
export class Top100PageComponent implements OnInit {
  private castleService = inject(CastleService);

  top100 = computed(() => this.castleService.getTop100());
  loading = this.castleService.loading;

  displayedColumns = ['position', 'score_total', 'castle_name', 'country', 'place', 'region'];
  sortedData: Castle[] = [];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }

  onSortChange(sort: Sort): void {
    const data = this.top100().slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = [];
      return;
    }
    this.sortedData = data.sort((a, b) => {
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

  get tableData(): Castle[] {
    return this.sortedData.length ? this.sortedData : this.top100();
  }
}
