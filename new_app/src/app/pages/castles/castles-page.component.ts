import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CastleService } from '../../services/castle.service';
import { CastleFilterComponent, FilterField } from '../../components/castle-filter/castle-filter.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-castles-page',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule,
    CastleFilterComponent, CastleTableComponent, CastleGridComponent, ViewToggleComponent,
  ],
  templateUrl: './castles-page.component.html',
  styleUrl: './castles-page.component.scss',
})
export class CastlesPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  loading = this.castleService.loading;
  countries = computed(() => this.castleService.getCountries());

  filterName = signal('');
  filterCountry = signal('');

  displayedColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];

  filterFields: FilterField[] = [
    { key: 'castle_type', label: 'Castle Type' },
    { key: 'condition', label: 'Condition' },
  ];

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
}
