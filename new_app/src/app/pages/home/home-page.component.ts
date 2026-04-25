import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { CastleService } from '../../services/castle.service';
import { CastleMapComponent } from '../../components/castle-map/castle-map.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe, CastleMapComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  private castleService = inject(CastleService);

  private surpriseIndex = signal(Math.floor(Math.random() * 900));

  deepSurpriseCastle = computed(() => {
    const pool = this.castleService.castles().slice(99, 999);
    if (!pool.length) return null;
    return pool[this.surpriseIndex() % pool.length];
  });

  private readonly todayIndex = Math.floor(Date.now() / 86_400_000) % 100;

  todaysCastle = computed(() => {
    const top100 = this.castleService.castles().slice(0, 100);
    return top100.length ? top100[this.todayIndex % top100.length] : null;
  });

  todaysCastleEnriched = computed(() => {
    const castle = this.todaysCastle();
    if (!castle) return null;
    return { ...castle, ...this.castleService.getEnrichedCastle(castle.castle_code) };
  });

  ngOnInit(): void {
    this.castleService.loadEnrichedData();
  }

  allCastles = this.castleService.castles;
  top10 = computed(() => this.castleService.getTopByScore(10));
  topVisitors12 = computed(() => this.castleService.getTopByVisitors(12));
  topVisitorLead = computed(() => this.topVisitors12()[0] ?? null);
  topVisitorRunnersUp = computed(() => this.topVisitors12().slice(1, 5));
  loading = this.castleService.loading;

  readonly stats = [
    { value: '1,000', label: 'castles ranked' },
    { value: '56', label: 'countries' },
    { value: '63,800', label: 'visitor ratings' },
    { value: '2004', label: 'established' },
  ];

  onImageError(event: Event, fallbackSrc: string | null | undefined): void {
    const img = event.target as HTMLImageElement;
    if (fallbackSrc) {
      img.src = fallbackSrc;
    }
    img.onerror = null;
  }

  refreshDeepSurprise(): void {
    this.surpriseIndex.set(Math.floor(Math.random() * 900));
  }

}
