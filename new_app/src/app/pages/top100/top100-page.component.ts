import { Component, computed, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';
import { CastleFilterComponent, FilterField } from '../../components/castle-filter/castle-filter.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-top100-page',
  standalone: true,
  imports: [CastleFilterComponent, CastleGridComponent, CastleTableComponent, ViewToggleComponent],
  templateUrl: './top100-page.component.html',
  styleUrl: './top100-page.component.scss',
})
export class Top100PageComponent implements OnInit {
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  top100 = computed(() => this.castleService.getAllByScore());
  loading = this.castleService.loading;

  displayedColumns = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];

  filterFields: FilterField[] = [
    { key: 'country', label: 'Country' },
    { key: 'castle_type', label: 'Location Type' },
    { key: 'castle_concept', label: 'Building Concept' },
    { key: 'condition', label: 'Condition' },
  ];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
