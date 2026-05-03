import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CastleService } from '../../services/castle.service';
import { EditorialService } from '../../services/editorial.service';
import { CountryGazetteerRow } from '../../models/castle.model';

export type SortMode = 'overall' | 'editorial' | 'visitor' | 'disagreement';

@Component({
  selector: 'app-top-countries-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatTableModule],
  templateUrl: './top-countries-page.component.html',
  styleUrl: './top-countries-page.component.scss',
})
export class TopCountriesPageComponent {
  private castleService = inject(CastleService);
  private editorialService = inject(EditorialService);

  readonly sortMode = signal<SortMode>('overall');

  protected readonly columns = [
    'overallRank', 'country', 'editorialRank', 'visitorRank',
    'castleCount', 'meanEditorialScore', 'meanVisitorScore', 'sumVisitors',
    'definingTradition', 'editorialNote', 'editorSleeper', 'topEntry',
  ];

  readonly rows = computed((): CountryGazetteerRow[] => {
    const editorial = this.editorialService.countries();
    const allCastles = this.castleService.castles();
    const sort = this.sortMode();

    type CountryStats = {
      castleCount: number;
      sumScoreTotal: number;
      sumScoreRef: number;
      sumVisitors: number;
      sumWeightedVisitorScore: number;
      topCastle: { code: string; name: string; score: number } | null;
    };

    const statsMap = new Map<string, CountryStats>();

    for (const c of allCastles) {
      if (!c.country) continue;
      const s: CountryStats = statsMap.get(c.country) ?? {
        castleCount: 0, sumScoreTotal: 0, sumScoreRef: 0,
        sumVisitors: 0, sumWeightedVisitorScore: 0, topCastle: null,
      };
      s.castleCount++;
      s.sumScoreTotal += c.score_total ?? 0;
      s.sumScoreRef += c.score_ref ?? 0;
      const vis = c.visitors ?? 0;
      s.sumVisitors += vis;
      s.sumWeightedVisitorScore += (c.score_visitors ?? 0) * vis;
      const score = c.score_total ?? 0;
      if (!s.topCastle || score > s.topCastle.score) {
        s.topCastle = { code: c.castle_code, name: c.castle_name, score };
      }
      statsMap.set(c.country, s);
    }

    const baseRows = [...statsMap.entries()].map(([country, s]) => ({
      country,
      castleCount: s.castleCount,
      sumScoreTotal: s.sumScoreTotal,
      sumScoreRef: s.sumScoreRef,
      sumVisitors: s.sumVisitors,
      meanEditorialScore: s.castleCount > 0 ? s.sumScoreRef / s.castleCount : 0,
      meanVisitorScore: s.sumVisitors > 0 ? s.sumWeightedVisitorScore / s.sumVisitors : 0,
      topCastleCode: s.topCastle?.code ?? '',
      topCastleName: s.topCastle?.name ?? '',
    }));

    // Overall rank: sum(score_total) desc
    const byOverall = [...baseRows].sort((a, b) => b.sumScoreTotal - a.sumScoreTotal);
    const overallRankMap = new Map(byOverall.map((r, i) => [r.country, i + 1]));

    // Editorial rank: sum(score_ref) desc, tie-break by sum(score_total) desc
    const byEditorial = [...baseRows].sort((a, b) =>
      b.sumScoreRef !== a.sumScoreRef
        ? b.sumScoreRef - a.sumScoreRef
        : b.sumScoreTotal - a.sumScoreTotal
    );
    const editorialRankMap = new Map(byEditorial.map((r, i) => [r.country, i + 1]));

    // Visitor rank: sum(visitors) desc
    const byVisitor = [...baseRows].sort((a, b) => b.sumVisitors - a.sumVisitors);
    const visitorRankMap = new Map(byVisitor.map((r, i) => [r.country, i + 1]));

    const rows: CountryGazetteerRow[] = baseRows.map(r => {
      const ed = editorial[r.country];
      const visitorRank = visitorRankMap.get(r.country)!;
      const editorialRank = editorialRankMap.get(r.country)!;
      return {
        country: r.country,
        castleCount: r.castleCount,
        sumScoreTotal: r.sumScoreTotal,
        sumScoreRef: r.sumScoreRef,
        sumVisitors: r.sumVisitors,
        overallRank: overallRankMap.get(r.country)!,
        editorialRank,
        visitorRank,
        disagreement: Math.abs(visitorRank - editorialRank),
        meanEditorialScore: r.meanEditorialScore,
        meanVisitorScore: r.meanVisitorScore,
        editorialNote: ed?.editorialNote,
        definingTradition: ed?.definingTradition,
        editorSleeper: ed?.editorSleeper ?? false,
        topCastleCode: r.topCastleCode,
        topCastleName: r.topCastleName,
      };
    });

    return sortRows(rows, sort);
  });

  setSort(mode: SortMode): void {
    this.sortMode.set(mode);
  }
}

function sortRows(rows: CountryGazetteerRow[], sort: SortMode): CountryGazetteerRow[] {
  return [...rows].sort((a, b) => {
    switch (sort) {
      case 'overall':      return a.overallRank - b.overallRank;
      case 'editorial':    return a.editorialRank - b.editorialRank;
      case 'visitor':      return a.visitorRank - b.visitorRank;
      case 'disagreement': return b.disagreement - a.disagreement;
    }
  });
}
