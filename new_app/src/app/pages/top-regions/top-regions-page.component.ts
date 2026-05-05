import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CastleService } from '../../services/castle.service';
import { Castle } from '../../models/castle.model';
import { EditorialService } from '../../services/editorial.service';

interface RegionAtlasRow {
  catalogueNumber: string;
  region: string;
  country: string;
  slug: string;
  legacyMapFormat: 'jpg' | 'png';
  castleCount: number;
  totalScore: number;
  sumScoreRef: number;
  sumVisitors: number;
  meanScore: number;
  editorialRank: number;
  visitorRank: number;
  disagreement: number;
  description?: string;
  editorSleeper: boolean;
}

@Component({
  selector: 'app-top-regions-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCardModule],
  templateUrl: './top-regions-page.component.html',
  styleUrl: './top-regions-page.component.scss',
})
export class TopRegionsPageComponent {
  private castleService = inject(CastleService);
  private editorialService = inject(EditorialService);

  constructor() {
    this.editorialService.loadRegions();
  }

  readonly rows = computed((): RegionAtlasRow[] => {
    const editorial = this.editorialService.regions();
    const statsMap = new Map<string, {
      region: string;
      country: string;
      slug: string;
      castleCount: number;
      totalScore: number;
      sumScoreRef: number;
      sumVisitors: number;
      sumWeightedVisitorScore: number;
    }>();

    for (const castle of this.castleService.castles()) {
      if (!castle.region || !castle.country) continue;
      const slug = regionSlug(castle);
      const key = `${castle.country}::${slug}`;
      const stats = statsMap.get(key) ?? {
        region: castle.region,
        country: castle.country,
        slug,
        castleCount: 0,
        totalScore: 0,
        sumScoreRef: 0,
        sumVisitors: 0,
        sumWeightedVisitorScore: 0,
      };

      stats.castleCount++;
      stats.totalScore += castle.score_total ?? 0;
      stats.sumScoreRef += castle.score_ref ?? castle.score_total ?? 0;
      const visitors = castle.visitors ?? 0;
      stats.sumVisitors += visitors;
      stats.sumWeightedVisitorScore += (castle.score_visitors ?? 0) * visitors;
      statsMap.set(key, stats);
    }

    const baseRows = [...statsMap.values()];
    const byEditorial = [...baseRows].sort((a, b) =>
      b.sumScoreRef !== a.sumScoreRef
        ? b.sumScoreRef - a.sumScoreRef
        : b.totalScore - a.totalScore
    );
    const editorialRankMap = new Map(byEditorial.map((row, index) => [`${row.country}::${row.slug}`, index + 1]));

    const byVisitor = [...baseRows].sort((a, b) =>
      b.sumVisitors !== a.sumVisitors
        ? b.sumVisitors - a.sumVisitors
        : b.totalScore - a.totalScore
    );
    const visitorRankMap = new Map(byVisitor.map((row, index) => [`${row.country}::${row.slug}`, index + 1]));

    return byEditorial.map((row, index) => {
      const key = `${row.country}::${row.slug}`;
      const note = editorial[row.slug];
      const editorialRank = editorialRankMap.get(key)!;
      const visitorRank = visitorRankMap.get(key)!;
      return {
        ...row,
        catalogueNumber: String(index + 1).padStart(2, '0'),
        legacyMapFormat: 'jpg',
        meanScore: row.castleCount > 0 ? row.sumScoreRef / row.castleCount : 0,
        editorialRank,
        visitorRank,
        disagreement: Math.abs(visitorRank - editorialRank),
        description: cleanDescription(note?.description),
        editorSleeper: note?.editorSleeper ?? false,
      };
    });
  });

  isSleeper(row: RegionAtlasRow): boolean {
    return row.editorSleeper || row.visitorRank - row.editorialRank >= 15;
  }

  visitorAriaLabel(row: RegionAtlasRow): string {
    if (row.visitorRank < row.editorialRank)
      return `Visitor rank ${row.visitorRank}, higher than editorial rank ${row.editorialRank}`;
    if (row.visitorRank > row.editorialRank)
      return `Visitor rank ${row.visitorRank}, lower than editorial rank ${row.editorialRank}`;
    return `Visitor rank ${row.visitorRank}`;
  }

  onRegionMapError(event: Event, row: RegionAtlasRow): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallbackApplied'] === 'true') {
      img.hidden = true;
      return;
    }

    img.dataset['fallbackApplied'] = 'true';
    img.src = `/images/maps/${row.slug}.${row.legacyMapFormat}`;
  }
}

function regionSlug(castle: Castle): string {
  const regionCode = castle.region_code?.trim();
  if (regionCode) return regionCode.toLowerCase();

  return castle.region
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanDescription(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
