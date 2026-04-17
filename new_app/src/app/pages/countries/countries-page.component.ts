import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CastleService } from '../../services/castle.service';
import { CountrySummary, RegionSummary } from '../../models/castle.model';

@Component({
  selector: 'app-countries-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatTableModule, MatSortModule],
  templateUrl: './countries-page.component.html',
  styleUrl: './countries-page.component.scss',
})
export class CountriesPageComponent implements OnInit {
  private castleService = inject(CastleService);

  countrySummaries = computed(() => this.sortedCountries.length ? this.sortedCountries : this.castleService.getCountrySummaries());
  regionSummaries = computed(() => this.sortedRegions.length ? this.sortedRegions : this.castleService.getRegionSummaries());

  countryColumns = ['rank', 'country', 'castleCount', 'totalScore'];
  regionColumns = ['rank', 'region', 'country', 'castleCount', 'totalScore'];

  sortedCountries: CountrySummary[] = [];
  sortedRegions: RegionSummary[] = [];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }

  onCountrySort(sort: Sort): void {
    const data = this.castleService.getCountrySummaries();
    if (!sort.active || sort.direction === '') {
      this.sortedCountries = [];
      return;
    }
    this.sortedCountries = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const key = sort.active as keyof CountrySummary;
      const valA = a[key];
      const valB = b[key];
      if (valA == null && valB == null) return 0;
      if (valA == null) return isAsc ? -1 : 1;
      if (valB == null) return isAsc ? 1 : -1;
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * (isAsc ? 1 : -1);
    });
  }

  onRegionSort(sort: Sort): void {
    const data = this.castleService.getRegionSummaries();
    if (!sort.active || sort.direction === '') {
      this.sortedRegions = [];
      return;
    }
    this.sortedRegions = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const key = sort.active as keyof RegionSummary;
      const valA = a[key];
      const valB = b[key];
      if (valA == null && valB == null) return 0;
      if (valA == null) return isAsc ? -1 : 1;
      if (valB == null) return isAsc ? 1 : -1;
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * (isAsc ? 1 : -1);
    });
  }
}
