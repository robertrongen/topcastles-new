import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CastleService } from '../../services/castle.service';
import { EditorialService } from '../../services/editorial.service';
import { CountryGazetteerRow } from '../../models/castle.model';

export type SortMode = 'editorial' | 'visitor' | 'disagreement';

@Component({
  selector: 'app-top-countries-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, SlicePipe, MatTableModule],
  templateUrl: './top-countries-page.component.html',
  styleUrl: './top-countries-page.component.scss',
})
export class TopCountriesPageComponent {
  private castleService = inject(CastleService);
  private editorialService = inject(EditorialService);

  readonly sortMode = signal<SortMode>('editorial');

  protected readonly columns = [
    'editorialRank', 'country', 'visitorRank', 'castleCount',
    'meanScore', 'definingTradition', 'editorialNote', 'editorSleeper', 'topEntry',
  ];

  readonly rows = computed((): CountryGazetteerRow[] => {
    const editorial = this.editorialService.countries();
    const allCastles = this.castleService.castles();
    const sort = this.sortMode();

    const statsMap = new Map<string, { scoreSum: number; scoredCount: number }>();
    for (const c of allCastles) {
      if (!c.country) continue;
      const s = statsMap.get(c.country) ?? { scoreSum: 0, scoredCount: 0 };
      if ((c.score_total ?? 0) > 0) {
        s.scoreSum += c.score_total!;
        s.scoredCount++;
      }
      statsMap.set(c.country, s);
    }

    const summaries = this.castleService.getCountrySummaries();

    const unsorted: CountryGazetteerRow[] = summaries.map((s, i) => {
      const ed = editorial[s.country];
      const visitorRank = i + 1;
      const editorialRank = ed?.editorialRank ?? null;
      const stats = statsMap.get(s.country);
      const meanScore = stats && stats.scoredCount > 0 ? stats.scoreSum / stats.scoredCount : 0;

      return {
        country: s.country,
        castleCount: s.castleCount,
        totalScore: s.totalScore,
        meanScore,
        visitorRank,
        editorialRank,
        disagreement: editorialRank != null ? Math.abs(visitorRank - editorialRank) : null,
        editorialNote: ed?.editorialNote,
        definingTradition: ed?.definingTradition,
        topEntry: ed?.topEntry,
        editorSleeper: ed?.editorSleeper ?? false,
      };
    });

    return sortRows(unsorted, sort);
  });

  setSort(mode: SortMode): void {
    this.sortMode.set(mode);
  }

  protected getFlag(country: string): string {
    const special: Record<string, string> = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    };
    if (special[country]) return special[country];
    const iso = COUNTRY_ISO[country];
    if (!iso) return '';
    return [...iso].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
  }
}

function sortRows(rows: CountryGazetteerRow[], sort: SortMode): CountryGazetteerRow[] {
  return [...rows].sort((a, b) => {
    if (sort === 'editorial') {
      if (a.editorialRank == null && b.editorialRank == null) return 0;
      if (a.editorialRank == null) return 1;
      if (b.editorialRank == null) return -1;
      return a.editorialRank - b.editorialRank;
    }
    if (sort === 'visitor') return a.visitorRank - b.visitorRank;
    // disagreement: descending, nulls last
    if (a.disagreement == null && b.disagreement == null) return 0;
    if (a.disagreement == null) return 1;
    if (b.disagreement == null) return -1;
    return b.disagreement - a.disagreement;
  });
}

const COUNTRY_ISO: Record<string, string> = {
  'Albania': 'AL', 'Austria': 'AT', 'Belarus': 'BY', 'Belgium': 'BE',
  'Bosnia': 'BA', 'Bulgaria': 'BG', 'Croatia': 'HR', 'Cyprus': 'CY',
  'Czechia': 'CZ', 'Denmark': 'DK', 'Egypt': 'EG', 'Estonia': 'EE',
  'Ethiopia': 'ET', 'Finland': 'FI', 'France': 'FR', 'Georgia': 'GE',
  'Germany': 'DE', 'Greece': 'GR', 'Hungary': 'HU', 'India': 'IN',
  'Israel': 'IL', 'Italy': 'IT', 'Japan': 'JP', 'Jordan': 'JO',
  'Latvia': 'LV', 'Lebanon': 'LB', 'Liechtenstein': 'LI', 'Lithuania': 'LT',
  'Luxemburg': 'LU', 'Macedonia': 'MK', 'Moldova': 'MD', 'Monaco': 'MC',
  'Morocco': 'MA', 'Netherlands': 'NL', 'Northern Ireland': 'GB',
  'Norway': 'NO', 'Pakistan': 'PK', 'Poland': 'PL', 'Portugal': 'PT',
  'Republic of Ireland': 'IE', 'Rumania': 'RO', 'Russia': 'RU',
  'San Marino': 'SM', 'Serbia': 'RS', 'Slovakia': 'SK', 'Slovenia': 'SI',
  'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH', 'Syria': 'SY',
  'Tunisia': 'TN', 'Turkey': 'TR', 'Ukraine': 'UA',
};
