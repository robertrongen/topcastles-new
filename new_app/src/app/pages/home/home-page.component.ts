import { Component, computed, inject, NgZone, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { CastleService } from '../../services/castle.service';
import { CastleMapComponent, RegionLabel } from '../../components/castle-map/castle-map.component';
import { ImageService } from '../../services/image.service';
import { haversineKm } from '../../utils/distance';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe, CastleMapComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  private castleService = inject(CastleService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  imageService = inject(ImageService);

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

  byPeriod = computed(() => {
    const castles = this.castleService.castles();
    const map = new Map<number, { count: number; exampleCastle: { castle_code: string; castle_name: string; position: number | null } }>();
    let total = 0;
    for (const c of castles) {
      if (c.era == null) continue;
      total++;
      if (!map.has(c.era)) {
        map.set(c.era, { count: 1, exampleCastle: { castle_code: c.castle_code, castle_name: c.castle_name, position: c.position ?? null } });
      } else {
        map.get(c.era)!.count++;
      }
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([era, { count, exampleCastle }]) => ({
        era,
        label: `${era}th c.`,
        count,
        share: total > 0 ? Math.round(count / total * 100) : 0,
        exampleCastle,
      }));
  });

  top10Countries = computed(() => {
    const summaries = this.castleService.getCountrySummaries().slice(0, 10);
    const castles = this.castleService.castles();
    const topByCountry = new Map<string, { castle_code: string; castle_name: string; position: number | null }>();
    for (const c of castles) {
      if (!c.country || topByCountry.has(c.country)) continue;
      topByCountry.set(c.country, { castle_code: c.castle_code, castle_name: c.castle_name, position: c.position ?? null });
    }
    return summaries.map(s => ({ ...s, topCastle: topByCountry.get(s.country) ?? null }));
  });
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

  readonly regionLabels: RegionLabel[] = [
    { name: 'British Isles', lat: 52.8, lng: -2.4, path: ['/top1000'], queryParams: { countries: 'England,Wales' } },
    { name: 'Rhine & Moselle', lat: 50.2, lng: 7.5, path: ['/top1000'], queryParams: { regionCodes: 'rheinland-pfalz,hessen,baden-wurtenberg' } },
    { name: 'Loire Valley', lat: 47.6, lng: 0.9, path: ['/top1000'], queryParams: { regionCodes: 'ile-de-france,centre' } },
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

  nearMeState = signal<'idle' | 'loading' | 'error'>('idle');

  goToNearestCastle(): void {
    if (!navigator.geolocation) { this.nearMeState.set('error'); return; }
    this.nearMeState.set('loading');
    navigator.geolocation.getCurrentPosition(
      pos => this.ngZone.run(() => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const nearest = [...this.castleService.castles()]
          .filter(c => c.latitude != null && c.longitude != null)
          .sort((a, b) =>
            haversineKm(lat, lon, a.latitude!, a.longitude!) -
            haversineKm(lat, lon, b.latitude!, b.longitude!)
          )
          .slice(0, 20)
          .sort((a, b) =>
            (a.position ?? Number.MAX_SAFE_INTEGER) -
            (b.position ?? Number.MAX_SAFE_INTEGER)
          )[0];
        if (nearest) {
          this.nearMeState.set('idle');
          this.router.navigate(['/castles', nearest.castle_code]);
        } else {
          this.nearMeState.set('error');
        }
      }),
      () => this.ngZone.run(() => this.nearMeState.set('error')),
      { timeout: 8000 },
    );
  }

}
