import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CastleService } from '../../services/castle.service';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleMapComponent } from '../../components/castle-map/castle-map.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-castles-page',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatIconModule, MatButtonModule,
    CastleTableComponent, CastleGridComponent, CastleMapComponent, ViewToggleComponent,
  ],
  templateUrl: './castles-page.component.html',
  styleUrl: './castles-page.component.scss',
})
export class CastlesPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  loading = this.castleService.loading;

  countries  = computed(() => this.castleService.getCountries());
  areas      = computed(() => this.castleService.getAreas());
  castleTypes    = computed(() => this.castleService.getCastleTypes());
  castleConcepts = computed(() => this.castleService.getCastleConcepts());
  conditions     = computed(() => this.castleService.getCastleConditions());
  eras           = computed(() => this.castleService.getEras());

  name        = signal('');
  description = signal('');
  place       = signal('');
  region      = signal('');
  country     = signal('');
  area        = signal('');
  castleType  = signal('');
  castleConcept = signal('');
  founder     = signal('');
  era         = signal<number | null>(null);
  condition   = signal('');
  sortKey     = signal('score_total');

  sortOptions = [
    { value: 'score_total', label: 'Total score' },
    { value: 'castle_name', label: 'Castle name' },
    { value: 'country', label: 'Country' },
    { value: 'region', label: 'Region' },
    { value: 'era', label: 'Era' },
  ];

  displayedColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];

  filteredCastles = computed(() => {
    let castles = this.castleService.castles()
      .filter(c => (c.score_total ?? 0) > 0);

    const name = this.name().toLowerCase();
    if (name) castles = castles.filter(c => c.castle_name?.toLowerCase().includes(name));

    const desc = this.description().toLowerCase();
    if (desc) castles = castles.filter(c => c.description?.toLowerCase().includes(desc));

    const place = this.place().toLowerCase();
    if (place) castles = castles.filter(c => c.place?.toLowerCase().includes(place));

    const region = this.region().toLowerCase();
    if (region) castles = castles.filter(c => c.region?.toLowerCase().includes(region));

    const country = this.country().toLowerCase();
    if (country) castles = castles.filter(c => c.country?.toLowerCase() === country);

    const area = this.area();
    if (area) castles = castles.filter(c => c.area === area);

    const castleType = this.castleType();
    if (castleType) castles = castles.filter(c => c.castle_type === castleType);

    const castleConcept = this.castleConcept();
    if (castleConcept) castles = castles.filter(c => c.castle_concept === castleConcept);

    const founder = this.founder().toLowerCase();
    if (founder) castles = castles.filter(c => c.founder?.toLowerCase().includes(founder));

    const era = this.era();
    if (era != null) castles = castles.filter(c => c.era === era);

    const condition = this.condition();
    if (condition) castles = castles.filter(c => c.condition === condition);

    const sort = this.sortKey();
    castles = [...castles].sort((a, b) => {
      if (sort === 'score_total') return (b.score_total ?? 0) - (a.score_total ?? 0);
      if (sort === 'era') return (a.era ?? 999) - (b.era ?? 999);
      const av = String(a[sort as keyof typeof a] ?? '');
      const bv = String(b[sort as keyof typeof b] ?? '');
      return av.localeCompare(bv);
    });

    return castles;
  });

  activeFilters = computed(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (this.name())        chips.push({ label: `Name: ${this.name()}`,               clear: () => this.name.set('') });
    if (this.description()) chips.push({ label: `Description: ${this.description()}`, clear: () => this.description.set('') });
    if (this.place())       chips.push({ label: `Place: ${this.place()}`,             clear: () => this.place.set('') });
    if (this.region())      chips.push({ label: `Region: ${this.region()}`,           clear: () => this.region.set('') });
    if (this.country())     chips.push({ label: `Country: ${this.country()}`,         clear: () => this.country.set('') });
    if (this.area())        chips.push({ label: `Area: ${this.area()}`,               clear: () => this.area.set('') });
    if (this.castleType())  chips.push({ label: `Type: ${this.castleType()}`,         clear: () => this.castleType.set('') });
    if (this.castleConcept()) chips.push({ label: `Structure: ${this.castleConcept()}`, clear: () => this.castleConcept.set('') });
    if (this.founder())     chips.push({ label: `Founder: ${this.founder()}`,         clear: () => this.founder.set('') });
    if (this.era() != null) chips.push({ label: `Era: ${this.era()}th century`,       clear: () => this.era.set(null) });
    if (this.condition())   chips.push({ label: `Condition: ${this.condition()}`,     clear: () => this.condition.set('') });
    return chips;
  });

  hasFilters = computed(() => this.activeFilters().length > 0);

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.queryParams.subscribe(params => {
      if (params['country']) this.country.set(params['country']);
    });
  }

  onReset(): void {
    this.name.set('');
    this.description.set('');
    this.place.set('');
    this.region.set('');
    this.country.set('');
    this.area.set('');
    this.castleType.set('');
    this.castleConcept.set('');
    this.founder.set('');
    this.era.set(null);
    this.condition.set('');
    this.sortKey.set('score_total');
  }
}
