import { Component, computed, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';

@Component({
  selector: 'app-top100-page',
  standalone: true,
  imports: [CastleGridComponent, CastleTableComponent],
  templateUrl: './top100-page.component.html',
  styleUrl: './top100-page.component.scss',
})
export class Top100PageComponent implements OnInit {
  private castleService = inject(CastleService);

  top100 = computed(() => this.castleService.getTop100());
  loading = this.castleService.loading;

  displayedColumns = ['position', 'score_total', 'thumbnail', 'castle_name', 'country', 'place', 'region', 'castle_type'];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
