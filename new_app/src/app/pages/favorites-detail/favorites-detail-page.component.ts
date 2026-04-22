import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CastleService } from '../../services/castle.service';
import { FavoritesService } from '../../services/favorites.service';
import { ViewModeService } from '../../services/view-mode.service';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';

@Component({
  selector: 'app-favorites-detail-page',
  standalone: true,
  imports: [
    RouterLink, MatIconModule, MatButtonModule,
    CastleGridComponent, CastleTableComponent, ViewToggleComponent,
  ],
  templateUrl: './favorites-detail-page.component.html',
  styleUrl: './favorites-detail-page.component.scss',
})
export class FavoritesDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  protected favoritesService = inject(FavoritesService);
  protected viewModeService = inject(ViewModeService);

  private routeId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') }
  );

  protected selectedSet = computed(() => {
    const id = this.routeId();
    return this.favoritesService.favorites().find(f => f.id === id) ?? null;
  });

  protected castlesInSet = computed(() => {
    const set = this.selectedSet();
    if (!set) return [];
    const idSet = new Set(set.castleIds);
    return this.castleService.getAllByScore().filter(c => idSet.has(c.castle_code));
  });

  protected displayedColumns = [
    'position', 'score_total', 'thumbnail', 'castle_name', 'country', 'place', 'castle_type', 'condition',
  ];

  async ngOnInit(): Promise<void> {
    await this.castleService.loadCastles();
  }

  protected removeCastle(castleCode: string): void {
    const set = this.selectedSet();
    if (!set) return;
    this.favoritesService.removeCastleFromSet(set.id, castleCode);
  }
}
