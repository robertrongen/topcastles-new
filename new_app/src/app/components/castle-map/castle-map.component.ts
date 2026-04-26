import { Component, inject, input, OnDestroy, viewChild, ElementRef, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Castle } from '../../models/castle.model';

export interface RegionLabel {
  name: string;
  lat: number;
  lng: number;
  path?: string[];
  queryParams?: Record<string, string>;
}

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
  autoFit = input(true);
  regionLabels = input<RegionLabel[]>([]);

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('castleMapContainer');

  private leafletMap: any = null;
  private markersLayer: any = null;
  private labelsLayer: any = null;

  constructor() {
    effect(() => {
      const container = this.mapContainer();
      const castles = this.castles();
      const regionLabels = this.regionLabels();
      if (!container || !isPlatformBrowser(this.platformId)) return;
      this.initOrUpdate(castles, regionLabels);
    });
  }

  private async initOrUpdate(castles: Castle[], regionLabels: RegionLabel[]): Promise<void> {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default ?? leafletModule;

    if (!this.leafletMap) {
      this.leafletMap = L.map(container, { scrollWheelZoom: true }).setView([48, 10], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.leafletMap);
      this.markersLayer = L.layerGroup().addTo(this.leafletMap);
      this.labelsLayer = L.layerGroup().addTo(this.leafletMap);
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

    this.labelsLayer.clearLayers();
    for (const region of regionLabels) {
      const icon = L.divIcon({
        className: 'atlas-label',
        html: `<span class="atlas-label__text">${region.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      const m = L.marker([region.lat, region.lng], { icon, interactive: !!region.path, zIndexOffset: 1000 });
      if (region.path) {
        m.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          this.router.navigate(region.path!, { queryParams: region.queryParams });
        });
      }
      this.labelsLayer.addLayer(m);
    }
  }

  ngOnDestroy(): void {
    this.leafletMap?.remove();
    this.leafletMap = null;
  }
}
