import { Component, computed, inject, OnInit, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';

@Component({
  selector: 'app-country-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatTableModule, MatSortModule, CastleGridComponent],
  templateUrl: './country-detail-page.component.html',
  styleUrl: './country-detail-page.component.scss',
})
export class CountryDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  private platformId = inject(PLATFORM_ID);

  country = signal('');
  loading = this.castleService.loading;

  castles = computed<Castle[]>(() =>
    this.castleService.getCastlesByCountry(this.country())
  );

  displayedColumns = ['position', 'castle_name', 'place', 'region', 'castle_type', 'score_total'];

  sortedData: Castle[] = [];
  tableData = computed(() => this.sortedData.length ? this.sortedData : this.castles());

  constructor() {
    effect(() => {
      const c = this.country();
      if (c && isPlatformBrowser(this.platformId)) {
        document.title = `Castles in ${c} — Top Castles`;
      }
    });
  }

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.params.subscribe((params) => {
      this.country.set(params['country'] ?? '');
    });
  }

  onSortChange(sort: Sort): void {
    const data = [...this.castles()];
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
}
