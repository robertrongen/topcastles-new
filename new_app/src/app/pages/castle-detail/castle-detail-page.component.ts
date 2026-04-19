import { Component, computed, inject, OnInit, OnDestroy, signal, effect, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CastleService } from '../../services/castle.service';
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
  imports: [RouterLink, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './castle-detail-page.component.html',
  styleUrl: './castle-detail-page.component.scss',
})
export class CastleDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);
  private platformId = inject(PLATFORM_ID);

  code = signal('');
  loading = this.castleService.loading;

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private leafletMap: any = null;
  private leafletMarker: any = null;
  private keyHandler?: (e: KeyboardEvent) => void;

  castle = computed<Castle | undefined>(() =>
    this.castleService.getCastleByCode(this.code())
  );

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
      .slice(0, 5);
  });

  // ── Image lightbox (2.4) ───────────────────────────────────────────────────
  loadedImageUrls = signal<string[]>([]);
  lightboxIndex = signal<number | null>(null);

  /** Candidate image URLs: {code}.jpg, {code}2.jpg … {code}25.jpg */
  imageUrls = computed(() => {
    const c = this.code();
    if (!c) return [];
    return Array.from({ length: 25 }, (_, i) =>
      `/images/castles/${c}${i === 0 ? '' : i + 1}.jpg`
    );
  });

  onImageLoad(url: string): void {
    this.loadedImageUrls.update(urls => urls.includes(url) ? urls : [...urls, url]);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
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
      if (castle && isPlatformBrowser(this.platformId)) {
        document.title = `${castle.castle_name} — Top Castles`;
      }
    });

    // Reset loaded images when castle changes
    effect(() => {
      this.code();
      this.loadedImageUrls.set([]);
      this.lightboxIndex.set(null);
    });

    // Read both castle() and mapContainer() as dependencies so the effect
    // re-runs once the view is initialised (mapContainer goes undefined → ElementRef).
    effect(() => {
      const castle = this.castle();
      const container = this.mapContainer();
      if (!container || !castle?.latitude || !castle?.longitude) return;
      if (!isPlatformBrowser(this.platformId)) return;
      this.initOrUpdateMap(castle.latitude, castle.longitude, castle.castle_name);
    });
  }

  private async initOrUpdateMap(lat: number, lon: number, name: string): Promise<void> {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const L = await import('leaflet');

    if (!this.leafletMap) {
      this.leafletMap = L.map(container, { scrollWheelZoom: false }).setView([lat, lon], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.leafletMap);

      const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
      this.leafletMap.setView([lat, lon], 14);
      this.leafletMarker?.setLatLng([lat, lon]).bindPopup(name);
    }
  }

  ngOnInit(): void {
    this.castleService.loadCastles();
    this.route.params.subscribe((params) => {
      this.code.set(params['code'] ?? '');
    });

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

  ngOnDestroy(): void {
    this.leafletMap?.remove();
    this.leafletMap = null;
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
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
