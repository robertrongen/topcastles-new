import { Component, Input, signal, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Castle } from '../../models/castle.model';

export const COL_LABELS: Record<string, string> = {
  position:      'Pos',
  score_total:   'Score',
  score_visitors:'Visitors ★',
  thumbnail:     '',
  castle_name:   'Castle',
  era:           'Era',
  country:       'Country',
  place:         'Place',
  region:        'Region',
  castle_type:   'Type',
  condition:     'Condition',
};

const COL_WIDTHS: Record<string, string> = {
  position:      '52px',
  score_total:   '68px',
  score_visitors:'84px',
  thumbnail:     '126px',
  castle_name:   'minmax(120px, 1fr)',
  era:           '60px',
  country:       '120px',
  place:         '120px',
  region:        '148px',
  castle_type:   '120px',
  condition:     '108px',
};

const TABLET_HIDDEN = new Set(['score_visitors', 'era', 'condition']);
const MOBILE_HIDDEN = new Set(['place', 'region', 'castle_type']);

export const TABLE_ROW_HEIGHT = 128;

@Component({
  selector: 'app-castle-table',
  standalone: true,
  imports: [DecimalPipe, RouterLink, MatIconModule, ScrollingModule],
  templateUrl: './castle-table.component.html',
  styleUrl: './castle-table.component.scss',
})
export class CastleTableComponent {
  @Input({ required: true }) castles: Castle[] = [];
  @Input({ required: true }) columns: string[] = [];

  private bp = inject(BreakpointObserver);

  private isTablet = toSignal(
    this.bp.observe('(max-width: 1199px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );
  private isMobile = toSignal(
    this.bp.observe('(max-width: 767px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  readonly colLabels = COL_LABELS;
  readonly rowHeight = TABLE_ROW_HEIGHT;

  sortCol = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');

  private sortedCastles = computed(() => {
    const col = this.sortCol();
    if (!col) return this.castles;
    const dir = this.sortDir();
    return [...this.castles].sort((a, b) => {
      const valA = (a as any)[col];
      const valB = (b as any)[col];
      if (valA == null && valB == null) return 0;
      if (valA == null) return dir === 'asc' ? -1 : 1;
      if (valB == null) return dir === 'asc' ? 1 : -1;
      return (valA < valB ? -1 : valA > valB ? 1 : 0) * (dir === 'asc' ? 1 : -1);
    });
  });

  visibleColumns = computed(() =>
    this.columns.filter(c => {
      if (this.isMobile() && MOBILE_HIDDEN.has(c)) return false;
      if (this.isTablet() && TABLET_HIDDEN.has(c)) return false;
      return true;
    })
  );

  private visibleSet = computed(() => new Set(this.visibleColumns()));

  colTemplate = computed(() =>
    this.visibleColumns().map(c => COL_WIDTHS[c] ?? '1fr').join(' ')
  );

  displayData = computed(() => this.sortedCastles());

  isVisible(col: string): boolean { return this.visibleSet().has(col); }

  sortBy(col: string): void {
    if (!COL_LABELS[col] || col === 'thumbnail') return;
    if (this.sortCol() === col) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  ariaSort(col: string): string {
    if (this.sortCol() !== col) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  eraLabel(era: number | null): string {
    if (era == null) return '';
    const n = era % 100;
    const m = era % 10;
    const suffix = (n >= 11 && n <= 13) ? 'th' : m === 1 ? 'st' : m === 2 ? 'nd' : m === 3 ? 'rd' : 'th';
    return `${era}${suffix} c.`;
  }

  trackByCode(_: number, c: Castle): string { return c.castle_code; }

  failedLocal = signal(new Set<string>());
  failedWiki  = signal(new Set<string>());

  onLocalError(c: Castle): void { this.failedLocal.update(s => new Set(s).add(c.castle_code)); }
  onWikiError(c: Castle):  void { this.failedWiki.update(s => new Set(s).add(c.castle_code)); }
  onImgError(e: Event):    void { (e.target as HTMLImageElement).style.display = 'none'; }
}
