import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castles-page',
  standalone: true,
  imports: [
    RouterLink, DecimalPipe, MatTableModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule,
  ],
  templateUrl: './castles-page.component.html',
  styleUrl: './castles-page.component.scss',
})
export class CastlesPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);

  loading = this.castleService.loading;
  countries = computed(() => this.castleService.getCountries());

  filterName = signal('');
  filterCountry = signal('');

  displayedColumns = ['position', 'castle_name', 'country', 'place', 'castle_type', 'score_total'];
  sortedData: Castle[] = [];

  filteredCastles = computed(() => {
    let castles = this.castleService.castles()
      .filter((c) => (c.score_total ?? 0) > 0)
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    const name = this.filterName().toLowerCase();
    if (name) {
      castles = castles.filter((c) => c.castle_name?.toLowerCase().includes(name));
    }
    const country = this.filterCountry();
    if (country) {
      castles = castles.filter((c) => c.country === country);
    }
    return castles;
  });

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.queryParams.subscribe((params) => {
      if (params['country']) {
        this.filterCountry.set(params['country']);
      }
    });
  }

  onSortChange(sort: Sort): void {
    const data = this.filteredCastles().slice();
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
    return this.sortedData.length ? this.sortedData : this.filteredCastles();
  }
}
