import { Component, computed, inject, OnInit, OnDestroy, signal, effect, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CastleService } from '../../services/castle.service';
import { FavoritesService } from '../../services/favorites.service';
import { UserService } from '../../services/user.service';
import { ImageService } from '../../services/image.service';
import { Castle } from '../../models/castle.model';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Component({
  selector: 'app-castle-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatMenuModule],
  templateUrl: './castle-detail-page.component.html',
  styleUrl: './castle-detail-page.component.scss',
})
export class CastleDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  private userService = inject(UserService);
  favoritesService = inject(FavoritesService);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private meta = inject(Meta);
  private titleService = inject(Title);
  imageService = inject(ImageService);

  favoritesOpen = signal(false);

  code = signal('');
  loading = this.castleService.loading;

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private leafletMap: any = null;
  private leafletMarker: any = null;
  private nearbyMarkersLayer: any = null;
  private keyHandler?: (e: KeyboardEvent) => void;
  private imageLoadRun = 0;

  // Prefer enriched data once loaded; fall back to lean castle until then.
  castle = computed<Castle | undefined>(() => {
    const code = this.code();
    return this.castleService.getEnrichedCastle(code) ?? this.castleService.getCastleByCode(code);
  });

  prevCastle = computed(() => this.castleService.getPreviousCastle(this.code()));
  nextCastle = computed(() => this.castleService.getNextCastle(this.code()));
  prevInCountry = computed(() => this.castleService.getPreviousCastleInCountry(this.code()));
  nextInCountry = computed(() => this.castleService.getNextCastleInCountry(this.code()));

  hasCoordinates = computed(() => {
    const c = this.castle();
    return c?.latitude != null && c?.longitude != null;
  });

  // ── Star rating (2.5) ──────────────────────────────────────────────────────
  starSegments = computed(() => {
    const score = this.castle()?.score_visitors;
    if (!score || score <= 0) return [];
    const stars = score / 2; // 0–10 → 0–5
    return Array.from({ length: 5 }, (_, i) => {
      if (stars >= i + 1) return 'full';
      if (stars >= i + 0.5) return 'half';
      return 'empty';
    });
  });

  // ── Nearby castles (2.6) ───────────────────────────────────────────────────
  nearbyCastles = computed(() => {
    const c = this.castle();
    if (!c?.latitude || !c?.longitude) return [];
    return this.castleService.castles()
      .filter(x => x.castle_code !== c.castle_code && x.latitude != null && x.longitude != null)
      .map(x => ({
        castle: x,
        distanceKm: Math.round(haversineKm(c.latitude!, c.longitude!, x.latitude!, x.longitude!)),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  });

  // ── Nearby castle image fallback ──────────────────────────────────────────
  nearbyFailedLocal = signal(new Set<string>());
  nearbyFailedWiki  = signal(new Set<string>());

  onNearbyLocalError(code: string): void {
    this.nearbyFailedLocal.update(s => new Set(s).add(code));
  }

  onNearbyWikiError(code: string): void {
    this.nearbyFailedWiki.update(s => new Set(s).add(code));
  }

  // ── Image strip (2.4 / 6.2) ───────────────────────────────────────────────
  loadedImageUrls = signal<string[]>([]);
  selectedIndex  = signal(0);
  lightboxIndex  = signal<number | null>(null);

  selectImage(index: number): void {
    this.selectedIndex.set(index);
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  lightboxPrev(): void {
    const idx = this.lightboxIndex();
    if (idx === null) return;
    const len = this.loadedImageUrls().length;
    this.lightboxIndex.set((idx - 1 + len) % len);
  }

  lightboxNext(): void {
    const idx = this.lightboxIndex();
    if (idx === null) return;
    this.lightboxIndex.set((idx + 1) % this.loadedImageUrls().length);
  }

  constructor() {
    effect(() => {
      const castle = this.castle();
      if (!castle) return;
      const pageTitle = `${castle.castle_name} — Top Castles`;
      this.titleService.setTitle(pageTitle);
      const description = castle.wikipedia_extract
        ? castle.wikipedia_extract.slice(0, 160)
        : `${castle.castle_name} — ranked #${castle.position} in the Top Castles list. Located in ${castle.country}.`;
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: pageTitle });
      this.meta.updateTag({ property: 'og:description', content: description });
      if (castle.wikipedia_thumbnail) {
        this.meta.updateTag({ property: 'og:image', content: castle.wikipedia_thumbnail });
      }
    });

    // Reset loaded images, selection and nearby fallbacks when castle changes.
    effect(() => {
      const code = this.code();
      this.loadedImageUrls.set([]);
      this.selectedIndex.set(0);
      this.lightboxIndex.set(null);
      this.nearbyFailedLocal.set(new Set());
      this.nearbyFailedWiki.set(new Set());
      this.imageLoadRun += 1;

      if (code && isPlatformBrowser(this.platformId)) {
        void this.loadCastleImages(code, this.imageLoadRun);
      }
    });

    // Read castle(), nearbyCastles(), and mapContainer() as dependencies so the
    // effect re-runs once the view is initialised and when nearby data changes.
    effect(() => {
      const castle = this.castle();
      const container = this.mapContainer();
      const nearby = this.nearbyCastles();
      if (!container || !castle?.latitude || !castle?.longitude) return;
      if (!isPlatformBrowser(this.platformId)) return;
      this.initOrUpdateMap(castle.latitude, castle.longitude, castle.castle_name, nearby);
    });
  }

  private async loadCastleImages(code: string, run: number): Promise<void> {
    for (let i = 0; i < 25; i += 1) {
      const url = this.imageService.castlePhotoUrl(code, i);
      let exists = false;

      try {
        exists = (await fetch(url, { method: 'HEAD' })).ok;
      } catch {
        exists = false;
      }

      if (run !== this.imageLoadRun || code !== this.code()) return;
      if (!exists) return;

      this.loadedImageUrls.update(urls => urls.includes(url) ? urls : [...urls, url]);
    }
  }

  private async initOrUpdateMap(
    lat: number, lon: number, name: string,
    nearby: { castle: Castle; distanceKm: number }[],
  ): Promise<void> {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default ?? leafletModule;

    if (!this.leafletMap) {
      this.leafletMap = L.map(container, { scrollWheelZoom: false }).setView([lat, lon], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.leafletMap);

      this.nearbyMarkersLayer = L.layerGroup().addTo(this.leafletMap);

      const iconDefault = L.icon({
        iconUrl: '/leaflet/marker-icon.png',
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        shadowUrl: '/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      this.leafletMarker = L.marker([lat, lon], { icon: iconDefault })
        .addTo(this.leafletMap)
        .bindPopup(name);

      setTimeout(() => this.leafletMap?.invalidateSize(), 0);
    } else {
      this.leafletMap.setView([lat, lon], 10);
      this.leafletMarker?.setLatLng([lat, lon]).bindPopup(name);
    }

    this.nearbyMarkersLayer.clearLayers();
    for (const { castle, distanceKm } of nearby) {
      if (castle.latitude == null || castle.longitude == null) continue;
      L.circleMarker([castle.latitude, castle.longitude], {
        radius: 7,
        fillColor: '#ff7800',
        color: '#fff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.75,
      })
        .bindTooltip(
          `<strong>${castle.castle_name}</strong><br>${distanceKm} km away`,
          { direction: 'top', offset: [0, -4] },
        )
        .addTo(this.nearbyMarkersLayer);
    }
  }

  ngOnInit(): void {
    this.castleService.loadEnrichedData();

    this.route.params.subscribe((params) => {
      this.code.set(params['code'] ?? '');
    });

    if (isPlatformBrowser(this.platformId)) {
      this.userService.ensureUser().then(() => this.favoritesService.loadFavorites());
    }

    if (isPlatformBrowser(this.platformId)) {
      this.keyHandler = (e: KeyboardEvent) => {
        if (this.lightboxIndex() === null) return;
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.lightboxPrev();
        if (e.key === 'ArrowRight') this.lightboxNext();
      };
      document.addEventListener('keydown', this.keyHandler);
    }
  }

  toggleFavorites(): void {
    this.favoritesOpen.update(v => !v);
  }

  async addToSet(setId: string): Promise<void> {
    const set = this.favoritesService.favorites().find(s => s.id === setId);
    await this.favoritesService.addCastleToSet(setId, this.code());
    this.favoritesOpen.set(false);
    if (set) {
      this.snackBar.open(`Added to "${set.name}"`, 'OK', { duration: 2000 });
    }
  }

  isInSet(setId: string): boolean {
    const set = this.favoritesService.favorites().find(s => s.id === setId);
    return set?.castleIds.includes(this.code()) ?? false;
  }

  ngOnDestroy(): void {
    this.leafletMap?.remove();
    this.leafletMap = null;
    this.nearbyMarkersLayer = null;
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
  }

  // ── Share (9.3) ───────────────────────────────────────────────────────────
  shareCopied = signal(false);

  async share(): Promise<void> {
    const castle = this.castle();
    if (!castle) return;
    const url  = window.location.href;
    const text = `${castle.castle_name} — ranked #${castle.position} in Top Castles`;
    if (navigator.share) {
      await navigator.share({ title: castle.castle_name, text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2500);
    }
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
