import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-types-page',
  standalone: true,
  imports: [
    FormsModule,
    MatTabsModule, MatFormFieldModule, MatSelectModule,
    CastleGridComponent, CastleTableComponent, ViewToggleComponent,
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

  selectedType = signal('');
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

  typeColumns = ['position', 'score_total', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region'];
  conceptColumns = ['position', 'score_total', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type'];
  conditionColumns = ['position', 'score_total', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type'];

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.selectedType.set(params['type']);
      }
    });
  }
}
