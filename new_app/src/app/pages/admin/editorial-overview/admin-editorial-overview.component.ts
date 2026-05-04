import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';
import { AdminPrerenderNoticeComponent } from '../shared/prerender-notice/admin-prerender-notice.component';

export interface BackupEntry {
  file: string;
  timestamp: number;
  filename: string;
}

interface FileRow {
  num: string;
  name: string;
  slug: string;
  path: string;
  purpose: string;
  denominator: number | null;
  keysCount: number;
  error: boolean;
  lastEdited: string | null;
}

const TOTAL_COUNTRIES = 56;

const EDITORIAL_FILES: Pick<FileRow, 'num' | 'name' | 'slug' | 'path' | 'purpose' | 'denominator'>[] = [
  {
    num: '01',
    name: 'Countries',
    slug: 'countries',
    path: '/data/editorial/countries.json',
    purpose: 'A short characterising note and defining tradition for each country in the index. Marks editorial sleepers — countries scored high by editors and low by visitors.',
    denominator: TOTAL_COUNTRIES,
  },
  {
    num: '02',
    name: 'Regions',
    slug: 'regions',
    path: '/data/editorial/regions.json',
    purpose: 'One-sentence descriptions of named architectural regions — e.g. the <em>Middle Rhine</em>, the <em>Castilian Frontier</em> — and their editorial sleeper flag.',
    denominator: null,
  },
  {
    num: '03',
    name: 'Castle quotes',
    slug: 'castle-quotes',
    path: '/data/editorial/castle-quotes.json',
    purpose: 'Editor pull-quotes about specific castles, with byline and date. The optional <em>featuredUntil</em> field overrides the homepage featured entry until the date passes.',
    denominator: null,
  },
  {
    num: '04',
    name: 'Period picks',
    slug: 'period-picks',
    path: '/data/editorial/period-picks.json',
    purpose: 'Editor\'s pick castle for each century in the period table. Rendered as a starred italic entry in the period gazetteer column.',
    denominator: null,
  },
  {
    num: '05',
    name: 'Browse bands',
    slug: 'browse-bands',
    path: '/data/editorial/browse-bands.json',
    purpose: 'A short editor\'s note above each rank band on the Top 1000 browse page (1–100, 101–500, 501–1000).',
    denominator: null,
  },
];

@Component({
  selector: 'app-admin-editorial-overview',
  imports: [RouterLink, AdminPrerenderNoticeComponent],
  templateUrl: './admin-editorial-overview.component.html',
  styleUrl: './admin-editorial-overview.component.scss',
})
export class AdminEditorialOverviewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly files = signal<FileRow[]>(
    EDITORIAL_FILES.map(f => ({ ...f, keysCount: 0, error: false, lastEdited: null }))
  );
  readonly backups = signal<BackupEntry[]>([]);
  readonly loading = signal(true);

  readonly filesPresent = computed(() => this.files().filter(f => !f.error && f.keysCount > 0).length);
  readonly totalKeys = computed(() => this.files().filter(f => !f.error).reduce((s, f) => s + f.keysCount, 0));
  readonly coverage = computed(() => {
    const countries = this.files().find(f => f.slug === 'countries');
    if (!countries || countries.error) return 0;
    return Math.round((countries.keysCount / TOTAL_COUNTRIES) * 100);
  });
  readonly backupsCount = computed(() => this.backups().length);
  readonly oldestBackup = computed(() => {
    const bs = this.backups();
    if (!bs.length) return null;
    const oldest = bs[bs.length - 1];
    return fmtDate(oldest.timestamp);
  });
  readonly recentEdits = computed(() => this.backups().slice(0, 6));
  readonly buildDate = 'build date unknown';

  readonly EDITORIAL_FILES = EDITORIAL_FILES;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }
    const authHeaders = this.auth.getAuthHeaders();
    forkJoin({
      countries:    this.http.get<Record<string, unknown>>('/api/editorial/countries').pipe(catchError(() => of(null))),
      regions:      this.http.get<Record<string, unknown>>('/api/editorial/regions').pipe(catchError(() => of(null))),
      castleQuotes: this.http.get<Record<string, unknown>>('/api/editorial/castle-quotes').pipe(catchError(() => of(null))),
      periodPicks:  this.http.get<Record<string, unknown>>('/api/editorial/period-picks').pipe(catchError(() => of(null))),
      browseBands:  this.http.get<Record<string, unknown>>('/api/editorial/browse-bands').pipe(catchError(() => of(null))),
      backups:      this.http.get<BackupEntry[]>('/api/admin/backups', { headers: authHeaders }).pipe(catchError(() => of([]))),
    }).subscribe(results => {
      const apiData: Record<string, Record<string, unknown> | null> = {
        'countries':    results.countries,
        'regions':      results.regions,
        'castle-quotes':results.castleQuotes,
        'period-picks': results.periodPicks,
        'browse-bands': results.browseBands,
      };
      const backupList: BackupEntry[] = Array.isArray(results.backups) ? results.backups : [];
      this.backups.set(backupList);

      this.files.update(rows => rows.map(row => {
        const data = apiData[row.slug];
        const error = data === null;
        const keysCount = error ? 0 : Object.keys(data ?? {}).length;
        const lastEdited = getLastEdited(row.slug, backupList);
        return { ...row, keysCount, error, lastEdited };
      }));

      this.loading.set(false);
    });
  }

  fmtDate = fmtDate;
  fileChip(slug: string): string { return slug.toUpperCase(); }
}

function getLastEdited(slug: string, backups: BackupEntry[]): string | null {
  const entry = backups.find(b => b.file === slug);
  return entry ? fmtDate(entry.timestamp) : null;
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getUTCMonth()];
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${mon} · ${h}:${m}`;
}
