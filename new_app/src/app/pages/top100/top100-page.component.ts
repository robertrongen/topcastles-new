import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CastleService } from '../../services/castle.service';
import { CastleFilterComponent, FilterField } from '../../components/castle-filter/castle-filter.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { CastleMapComponent } from '../../components/castle-map/castle-map.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-top100-page',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    CastleFilterComponent, CastleGridComponent, CastleTableComponent, CastleMapComponent, ViewToggleComponent,
  ],
  templateUrl: './top100-page.component.html',
  styleUrl: './top100-page.component.scss',
})
export class Top100PageComponent implements OnInit {
  private castleService = inject(CastleService);
  private route = inject(ActivatedRoute);
  protected viewModeService = inject(ViewModeService);

  loading = this.castleService.loading;
  searchQuery  = signal('');
  initialFilters = signal<Record<string, string>>({});

  allCastles = computed(() => this.castleService.getAllByScore());

  mapVisible = signal(true);
  toggleMap(): void { this.mapVisible.update(v => !v); }

  searchedCastles = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.allCastles();
    return this.allCastles().filter(c =>
      c.search_text ? c.search_text.includes(q) : c.castle_name?.toLowerCase().includes(q)
    );
  });

  displayedColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];

  filterFields: FilterField[] = [
    { key: 'country',        label: 'Country' },
    { key: 'region',         label: 'Region' },
    { key: 'castle_type',    label: 'Location Type' },
    { key: 'castle_concept', label: 'Building Concept' },
    { key: 'condition',      label: 'Condition' },
  ];

  typeDescriptions: Record<string, { description: string }> = {
    'Mountain castle': { description: 'Höhenburgen: The approach to the castle is hampered by its high position. Siege engines cannot reach the castle.' },
    'Rock castle': { description: 'Felsenburgen: Castles built on top of a mountain rock. Parts of the castle can be inside the rock. The Wasgau border region is famous for rock castles.' },
    'Water castle': { description: 'Wasserburgen: Surrounded by water in a moat or lake. The water defends against siege engines and sapping.' },
    'Harbour castle': { description: 'Hafenburgen: One side defended by water of a river or sea. Mostly used to defend a harbour.' },
    'City castle': { description: 'Stadtburgen: Castles built to defend or control a town. Can be shut off from the town.' },
  };

  conceptDescriptions: Record<string, { description: string; image?: string }> = {
    'Motte-and-bailey': { description: 'A central tower on an artificial hill, defended by a curtain wall.', image: 'concept_motte.jpg' },
    'Later norman': { description: 'A motte-and-bailey enclosed by a new curtain wall with flanking towers.', image: 'concept_gisors.jpg' },
    'Ringwork': { description: 'Or shell keep: A round castle on a hill, without a separate tower or donjon.', image: 'castle_concept2.jpg' },
    'Tower or compact castle': { description: 'Stand-alone tower or donjon, compact castle without a bailey.', image: 'castle_concept4.jpg' },
    'Rectangular or polygonal': { description: 'Rectangular or polygonal castle with flanking towers but without a central tower.', image: 'castle_concept3.jpg' },
    'Donjon inside curtain wall': { description: 'Classical castle with flanking towers and a central donjon inside the curtain wall.', image: 'castle_concept5.jpg' },
    'Donjon in curtain wall': { description: 'Classical castle with a central donjon positioned in the curtain wall.', image: 'concept_kenilworth.jpg' },
    'Donjon outside curtain wall': { description: 'Classical castle with a central donjon positioned outside the curtain wall.', image: 'concept_bellver.jpg' },
  };

  conditionDescriptions: Record<string, { description: string }> = {
    'Intact': { description: 'All characteristic parts (gate, donjon, moat, defence works) are intact and accessible.' },
    'Rebuild/Restored': { description: 'Appears intact but some parts have been rebuilt or restored.' },
    'Damaged': { description: 'Not intact but characteristic parts are still recognisable.' },
    'Ruined/Partly remained': { description: 'Some characteristic parts are lost; some like the donjon can still be intact.' },
    'Destroyed': { description: 'All characteristic parts are lost.' },
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const filters: Record<string, string> = {};
      if (params['country'])       filters['country']        = params['country'];
      if (params['region'])        filters['region']         = params['region'];
      if (params['castleType'])    filters['castle_type']    = params['castleType'];
      if (params['castleConcept']) filters['castle_concept'] = params['castleConcept'];
      if (params['condition'])     filters['condition']      = params['condition'];
      if (Object.keys(filters).length) this.initialFilters.set(filters);
    });
  }
}
