import { Component, inject, input, OnDestroy, viewChild, ElementRef, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castle-map',
  standalone: true,
  imports: [],
  templateUrl: './castle-map.component.html',
  styleUrl: './castle-map.component.scss',
})
export class CastleMapComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  castles = input<Castle[]>([]);
  /** When true the map auto-fits bounds on every castles change. */
  autoFit = input(true);

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('castleMapContainer');

  private leafletMap: any = null;
  private markersLayer: any = null;

  constructor() {
    effect(() => {
      const container = this.mapContainer();
      const castles = this.castles();
      if (!container || !isPlatformBrowser(this.platformId)) return;
      this.initOrUpdate(castles);
    });
  }

  private async initOrUpdate(castles: Castle[]): Promise<void> {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const L = await import('leaflet');

    if (!this.leafletMap) {
      this.leafletMap = L.map(container, { scrollWheelZoom: true }).setView([48, 10], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.leafletMap);
      this.markersLayer = L.layerGroup().addTo(this.leafletMap);
      setTimeout(() => this.leafletMap?.invalidateSize(), 0);
    }

    this.markersLayer.clearLayers();

    const withCoords = castles.filter(c => c.latitude != null && c.longitude != null);

    for (const castle of withCoords) {
      const score = castle.score_total ?? 0;
      const radius = score > 800 ? 8 : score > 400 ? 6 : 5;
      const color  = score > 800 ? '#d62728' : score > 400 ? '#FF9900' : '#1f77b4';

      const marker = L.circleMarker([castle.latitude!, castle.longitude!], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindTooltip(
        `<strong>${castle.castle_name}</strong><br>${castle.country}` +
        (castle.position ? ` &middot; #${castle.position}` : ''),
        { direction: 'top', offset: [0, -4] }
      );

      marker.on('click', () => this.router.navigate(['/castles', castle.castle_code]));
      this.markersLayer.addLayer(marker);
    }

    if (this.autoFit() && withCoords.length > 0) {
      const bounds = (L as any).latLngBounds(withCoords.map((c: Castle) => [c.latitude!, c.longitude!]));
      this.leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }

  ngOnDestroy(): void {
    this.leafletMap?.remove();
    this.leafletMap = null;
  }
}
