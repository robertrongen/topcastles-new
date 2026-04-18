import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { CastleFilterComponent, FilterField } from '../../components/castle-filter/castle-filter.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-types-page',
  standalone: true,
  imports: [
    FormsModule,
    MatTabsModule, MatFormFieldModule, MatSelectModule, MatCardModule,
    CastleFilterComponent, CastleGridComponent, CastleTableComponent, ViewToggleComponent,
  ],
  templateUrl: './types-page.component.html',
  styleUrl: './types-page.component.scss',
})
export class TypesPageComponent implements OnInit {
  private castleService = inject(CastleService);
  private route = inject(ActivatedRoute);
  protected viewModeService = inject(ViewModeService);

  castleTypes = computed(() => this.castleService.getCastleTypes());
  castleConcepts = computed(() => this.castleService.getCastleConcepts());
  castleConditions = computed(() => this.castleService.getCastleConditions());

  selectedType = signal('City castle');
  selectedConcept = signal('');
  selectedCondition = signal('');

  filteredByType = computed<Castle[]>(() => {
    const t = this.selectedType();
    return t ? this.castleService.getCastlesByType(t) : [];
  });

  filteredByConcept = computed<Castle[]>(() => {
    const c = this.selectedConcept();
    return c ? this.castleService.getCastlesByConcept(c) : [];
  });

  filteredByCondition = computed<Castle[]>(() => {
    const c = this.selectedCondition();
    return c ? this.castleService.getCastlesByCondition(c) : [];
  });

  typeColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'condition'];

  typeFilterFields: FilterField[] = [
    { key: 'country', label: 'Country' },
    { key: 'condition', label: 'Condition' },
  ];
  conceptColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];
  conditionColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type'];

  typeDescriptions: Record<string, { description: string }> = {
    'Mountain castle': {
      description: 'Höhenburgen: The approach to the castle is hampered by its high position. Siege engines cannot reach the castle.',
    },
    'Rock castle': {
      description: 'Felsenburgen: Castles that are built on top of a mountain rock. Parts of the castle, including its main entrance, can be inside the rock. The Wasgau border region of France and Germany is famous for its rock castles. The rock defends the castle against sapping and is considered to be the strongest castle type.',
    },
    'Water castle': {
      description: 'Wasserburgen: Surrounded by water in a moat or a lake. The water defends the castle against siege engines and sapping. In long sieges a moat can be filled with earth.',
    },
    'Harbour castle': {
      description: 'Hafenburgen: One side is defended by water of a river or sea. Mostly used to defend a harbour.',
    },
    'City castle': {
      description: 'Stadtburgen: Castles built to defend or control a town. The castle can be shut off from the town. Because of its location against a town only one or two sides of the castle can be defended by height or water. Sir Oman defines a city castle as: "A castle is a military structure larger than a tower but smaller than a fortified town, it is residential but is also defensible in character. However complicated internally it must be a complete unit unto itself and not part of a town. A castle may exist inside a town but must be able to be cut off by the closing of a gate or the raising of a drawbridge."',
    },
  };

  conceptDescriptions: Record<string, { description: string; image?: string }> = {
    'Motte-and-bailey': {
      description: 'A central tower or donjon on an artificial hill, defended by a curtain wall. This castle type was introduced by Scandinavian invaders in England and France in the 10th and 11th century.',
      image: 'concept_motte.jpg',
    },
    'Later norman': {
      description: 'A motte-and-bailey castle that is afterwards enclosed by or connected to a new curtain wall with flanking towers.',
      image: 'concept_gisors.jpg',
    },
    'Ringwork': {
      description: 'Or shell keep: A round or multi-angular castle, located on a hill, without a separate tower or donjon without towers in the curtain wall.',
      image: 'castle_concept2.jpg',
    },
    'Tower or compact castle': {
      description: 'Stand-alone tower or donjon, compact castles without a bailey, can be equipped with small flanking towers in the outer wall.',
      image: 'castle_concept4.jpg',
    },
    'Rectangular or polygonal': {
      description: 'Rectangular or polygonal shaped castle with flanking towers in the curtain walls but without a central tower or donjon.',
      image: 'castle_concept3.jpg',
    },
    'Donjon inside curtain wall': {
      description: 'Rectangular shaped classical castle with flanking towers in the curtain walls and a central tower or donjon positioned inside the curtain wall. The central tower or donjon cannot assist in defending the curtain walls directly and cannot be accessed from the curtain walls.',
      image: 'castle_concept5.jpg',
    },
    'Donjon in curtain wall': {
      description: 'Rectangular shaped classical castle with flanking towers and a central tower or donjon positioned in the curtain wall. The central tower or donjon can assist in defending the curtain walls directly and can be accessed from the curtain walls.',
      image: 'concept_kenilworth.jpg',
    },
    'Donjon outside curtain wall': {
      description: 'Rectangular shaped classical castle with flanking towers and a central tower or donjon positioned outside the curtain wall. The central tower or donjon can assist in defending the curtain walls directly but cannot be accessed from the curtain walls.',
      image: 'concept_bellver.jpg',
    },
  };

  conditionDescriptions: Record<string, { description: string }> = {
    'Intact': {
      description: 'The castle is mostly intact; all characteristic parts of the castle (gate, donjon, moat, defence works) are intact and accessible.',
    },
    'Rebuild/Restored': {
      description: 'The castle appears intact but some or all characteristic parts of the castle have been rebuilt or restored.',
    },
    'Damaged': {
      description: 'The castle is not intact but the characteristic parts of the castle (gate, donjon, moat, defence works) are still recognisable.',
    },
    'Ruined/Partly remained': {
      description: 'Some characteristic parts of the castle (gate, donjon, moat, defence works) are lost. Some parts like the donjon can still be intact, rebuilt or restored.',
    },
    'Destroyed': {
      description: 'All characteristic parts of the castle (gate, donjon, moat, defence works) are lost.',
    },
  };

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.selectedType.set(params['type']);
      }
    });
  }
}
