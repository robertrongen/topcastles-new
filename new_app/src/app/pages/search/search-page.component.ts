import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CastleService } from '../../services/castle.service';
import { Castle, SearchCriteria } from '../../models/castle.model';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    CastleTableComponent, CastleGridComponent, ViewToggleComponent,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent implements OnInit {
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  countries = computed(() => this.castleService.getCountries());
  areas = computed(() => this.castleService.getAreas());
  castleTypes = computed(() => this.castleService.getCastleTypes());
  castleConcepts = computed(() => this.castleService.getCastleConcepts());
  castleConditions = computed(() => this.castleService.getCastleConditions());
  eras = computed(() => this.castleService.getEras());

  // Form fields
  name = '';
  description = '';
  place = '';
  region = '';
  country = '';
  area = '';
  castleType = '';
  castleConcept = '';
  founder = '';
  era: number | null = null;
  condition = '';
  sortKey = 'score_total';

  results = signal<Castle[]>([]);
  searched = signal(false);

  displayedColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];

  sortOptions = [
    { value: 'score_total', label: 'Total score' },
    { value: 'castle_code', label: 'Castle code' },
    { value: 'country', label: 'Country' },
    { value: 'region', label: 'Region' },
    { value: 'era', label: 'Era' },
  ];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }

  onSearch(): void {
    const criteria: SearchCriteria = {};
    if (this.name) criteria.name = this.name;
    if (this.description) criteria.description = this.description;
    if (this.place) criteria.place = this.place;
    if (this.region) criteria.region = this.region;
    if (this.country) criteria.country = this.country;
    if (this.area) criteria.area = this.area;
    if (this.castleType) criteria.castleType = this.castleType;
    if (this.castleConcept) criteria.castleConcept = this.castleConcept;
    if (this.founder) criteria.founder = this.founder;
    if (this.era != null) criteria.era = this.era;
    if (this.condition) criteria.condition = this.condition;
    criteria.sortKey = this.sortKey;

    this.results.set(this.castleService.search(criteria));
    this.searched.set(true);
  }

  onReset(): void {
    this.name = '';
    this.description = '';
    this.place = '';
    this.region = '';
    this.country = '';
    this.area = '';
    this.castleType = '';
    this.castleConcept = '';
    this.founder = '';
    this.era = null;
    this.condition = '';
    this.sortKey = 'score_total';
    this.results.set([]);
    this.searched.set(false);
  }
}
