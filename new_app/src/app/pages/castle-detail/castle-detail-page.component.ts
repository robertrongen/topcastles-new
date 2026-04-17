import { Component, computed, inject, OnInit, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castle-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './castle-detail-page.component.html',
  styleUrl: './castle-detail-page.component.scss',
})
export class CastleDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  private platformId = inject(PLATFORM_ID);

  code = signal('');
  loading = this.castleService.loading;

  castle = computed<Castle | undefined>(() =>
    this.castleService.getCastleByCode(this.code())
  );

  prevCastle = computed(() => this.castleService.getPreviousCastle(this.code()));
  nextCastle = computed(() => this.castleService.getNextCastle(this.code()));
  prevInCountry = computed(() => this.castleService.getPreviousCastleInCountry(this.code()));
  nextInCountry = computed(() => this.castleService.getNextCastleInCountry(this.code()));

  /** Candidate image URLs: {code}.jpg, {code}2.jpg … {code}25.jpg */
  imageUrls = computed(() => {
    const c = this.code();
    if (!c) return [];
    return Array.from({ length: 25 }, (_, i) =>
      `/images/castles/${c}${i === 0 ? '' : i + 1}.jpg`
    );
  });

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  constructor() {
    effect(() => {
      const castle = this.castle();
      if (castle && isPlatformBrowser(this.platformId)) {
        document.title = `${castle.castle_name} — Top Castles`;
      }
    });
  }

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.params.subscribe((params) => {
      this.code.set(params['code'] ?? '');
    });
  }

  googleMapsUrl(): string {
    const c = this.castle();
    if (!c?.latitude || !c?.longitude) return '';
    const lat = c.latitude;
    const lon = c.longitude;
    const name = c.castle_name?.split('(')[0]?.trim() ?? '';
    return `https://maps.google.com/maps?q=${lat},${lon}+(${encodeURIComponent(name)})&t=k&z=16`;
  }
}
