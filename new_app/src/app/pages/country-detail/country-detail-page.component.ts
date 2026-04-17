import { Component, computed, inject, OnInit, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';

@Component({
  selector: 'app-country-detail-page',
  standalone: true,
  imports: [RouterLink, CastleGridComponent, CastleTableComponent],
  templateUrl: './country-detail-page.component.html',
  styleUrl: './country-detail-page.component.scss',
})
export class CountryDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  private platformId = inject(PLATFORM_ID);

  country = signal('');
  loading = this.castleService.loading;

  castles = computed<Castle[]>(() =>
    this.castleService.getCastlesByCountry(this.country())
  );

  displayedColumns = ['position', 'score_total', 'thumbnail', 'castle_name', 'place', 'region', 'castle_type'];

  constructor() {
    effect(() => {
      const c = this.country();
      if (c && isPlatformBrowser(this.platformId)) {
        document.title = `Castles in ${c} — Top Castles`;
      }
    });
  }

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.params.subscribe((params) => {
      this.country.set(params['country'] ?? '');
    });
  }
}
