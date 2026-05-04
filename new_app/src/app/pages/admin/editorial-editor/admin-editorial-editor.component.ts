import {
  Component, inject, OnInit, OnDestroy, PLATFORM_ID, signal, computed, effect, HostListener,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminAuthService } from '../admin-auth.service';
import { AdminPrerenderNoticeComponent, EditorialPublishStatus } from '../shared/prerender-notice/admin-prerender-notice.component';

export interface CastleLookup {
  code: string;
  name: string;
  country: string;
  editorialRank: number;
  visitorRank: number;
}

interface FileConfig {
  displayName: string;
  subtitle: string;
  railHeaderLabel: string;
  searchPlaceholder: string | null;
  addButtonLabel: string | null;
}

const FILE_CONFIGS: Record<string, FileConfig> = {
  'countries': {
    displayName: 'Countries',
    subtitle: 'Short editorial notes per country, surfaced in the Top Countries gazetteer.',
    railHeaderLabel: 'Countries',
    searchPlaceholder: 'Filter by country or code…',
    addButtonLabel: 'Add country',
  },
  'regions': {
    displayName: 'Regions',
    subtitle: 'Named architectural regions and their editorial sleeper flag.',
    railHeaderLabel: 'Regions',
    searchPlaceholder: 'Filter by region slug…',
    addButtonLabel: 'Add region',
  },
  'castle-quotes': {
    displayName: 'Castle quotes',
    subtitle: 'Editor pull-quotes about specific castles. Optional featuredUntil overrides the homepage.',
    railHeaderLabel: 'Castle quotes',
    searchPlaceholder: 'Filter by castle code…',
    addButtonLabel: 'Add quote',
  },
  'period-picks': {
    displayName: 'Period picks',
    subtitle: 'Editor\'s pick castle for each century in the period table.',
    railHeaderLabel: 'Period picks',
    searchPlaceholder: null,
    addButtonLabel: null,
  },
  'browse-bands': {
    displayName: 'Browse bands',
    subtitle: 'Three editor\'s notes — one per rank band on the Top 1000 browse page.',
    railHeaderLabel: 'Browse bands',
    searchPlaceholder: null,
    addButtonLabel: null,
  },
};

const PERIOD_ERAS = [
  '6th c.', '7th c.', '8th c.', '9th c.', '10th c.', '11th c.', '12th c.', '13th c.',
  '14th c.', '15th c.', '16th c.', '17th c.', '18th c.', '19th c.', '20th c.',
];

const BROWSE_BANDS_DEFAULT: Record<string, { note: string }> = {
  '1-100': { note: 'The canonical hundred: the most architecturally significant and best-preserved fortifications in the index.' },
  '101-500': { note: 'The established middle: significant structures that fall just outside the most visited and most cited tier.' },
  '501-1000': { note: 'The long tail: minor structures, fragments, or lesser-known fortifications that round out the thousand.' },
};

const BROWSE_BAND_NAMES: Record<string, string> = {
  '1-100': 'The canonical hundred',
  '101-500': 'The established middle',
  '501-1000': 'The long tail',
};

function nowHHMM(): string {
  const d = new Date();
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m} GMT`;
}

function fmtISODate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00Z');
  if (isNaN(d.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

@Component({
  selector: 'app-admin-editorial-editor',
  imports: [RouterLink, AdminPrerenderNoticeComponent],
  templateUrl: './admin-editorial-editor.component.html',
  styleUrl: './admin-editorial-editor.component.scss',
})
export class AdminEditorialEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  // File identity
  readonly fileSlug = signal<string>('');
  readonly fileConfig = computed(() => FILE_CONFIGS[this.fileSlug()] ?? null);
  readonly isBrowseBands = computed(() => this.fileSlug() === 'browse-bands');
  readonly isPeriodPicks = computed(() => this.fileSlug() === 'period-picks');
  readonly hasKeysRail = computed(() => !this.isBrowseBands());

  // Data
  readonly serverData = signal<Record<string, any>>({});
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  // Keys rail
  readonly searchQuery = signal('');
  readonly activeKey = signal<string | null>(null);

  // Edits: keyed by file key, holds the locally-edited values
  readonly localEdits = signal<Record<string, any>>({});
  readonly dirtyKeys = computed(() => new Set(Object.keys(this.localEdits())));

  // Form values for the active key
  readonly formValues = signal<Record<string, any>>({});

  // Castle lookup (combobox)
  readonly castleQuery = signal('');
  readonly castleResults = signal<CastleLookup[]>([]);
  readonly castleDropOpen = signal(false);
  readonly castleDropActiveIdx = signal(-1);
  readonly castleResolved = signal<CastleLookup | null>(null);
  readonly castleError = signal(false);

  // Save state
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal<{ key: string; backup: string | null } | null>(null);
  readonly lastSavedTime = signal<string | null>(null);

  // Field-level validation errors (keyed by field name)
  readonly fieldErrors = signal<Record<string, string>>({});

  // Publish status
  readonly publishStatus = signal<EditorialPublishStatus | null>(null);
  readonly copySuccess = signal(false);
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  private castleQueryTimer: ReturnType<typeof setTimeout> | null = null;
  private unloadHandler: ((e: Event) => void) = () => {};

  // Computed keys list for the rail (all keys, for fixed-key files: eras or bands)
  readonly allKeys = computed(() => {
    const slug = this.fileSlug();
    if (slug === 'period-picks') return PERIOD_ERAS;
    if (slug === 'browse-bands') return Object.keys(BROWSE_BANDS_DEFAULT);
    return Object.keys(this.serverData());
  });

  readonly filteredKeys = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const keys = this.allKeys();
    if (!q) return keys;
    return keys.filter(k => k.toLowerCase().includes(q));
  });

  // Check if a key has data (non-empty object)
  hasData(key: string): boolean {
    const src = this.localEdits()[key] ?? this.serverData()[key];
    if (!src) return false;
    const vals = Object.values(src);
    return vals.some(v => v !== null && v !== '' && v !== false && v !== undefined);
  }

  getFlag(key: string): string | null {
    const data = this.localEdits()[key] ?? this.serverData()[key];
    if (!data) return 'Empty';
    const slug = this.fileSlug();
    if ((slug === 'countries' || slug === 'regions') && data.sleeper) return 'Sleeper';
    if (slug === 'castle-quotes' && data.featuredUntil) {
      const today = new Date().toISOString().slice(0, 10);
      if (data.featuredUntil >= today) return 'Featured';
    }
    if (!this.hasData(key)) return 'Empty';
    return null;
  }

  getKeyPrimary(key: string): string {
    const slug = this.fileSlug();
    if (slug === 'period-picks' || slug === 'browse-bands') return key;
    const data = this.serverData()[key];
    if (slug === 'castle-quotes' && data?.castleName) return data.castleName;
    return key;
  }

  getKeySecondary(key: string): string {
    const slug = this.fileSlug();
    if (slug === 'period-picks') {
      const d = this.serverData()[key];
      return d?.name ? `★ ${d.name}` : 'no pick set';
    }
    if (slug === 'castle-quotes') {
      const d = this.serverData()[key];
      return d ? `${key} · ${d.country ?? '?'} · ★ ${d.editorialRank ?? '?'}` : key;
    }
    return key;
  }

  // Dirty check for the current active key
  readonly isDirty = computed(() => {
    const key = this.activeKey();
    if (!key) return false;
    return this.dirtyKeys().has(key);
  });

  // Any dirty keys
  readonly anyDirty = computed(() => this.dirtyKeys().size > 0);

  // Browse bands: number of dirty bands
  readonly dirtyBandsCount = computed(() => {
    if (!this.isBrowseBands()) return 0;
    return this.dirtyKeys().size;
  });

  readonly BROWSE_BAND_NAMES = BROWSE_BAND_NAMES;
  readonly BROWSE_BANDS_KEYS = Object.keys(BROWSE_BANDS_DEFAULT);
  readonly fmtISODate = fmtISODate;

  private loadPublishStatus(): void {
    this.http.get<EditorialPublishStatus>('/api/admin/editorial/publish-status', {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: status => this.publishStatus.set(status),
      error: () => { /* publish status is informational — fail silently */ },
    });
  }

  copyDeployCommand(): void {
    const cmd = this.publishStatus()?.deployCommand;
    if (!cmd || !this.isBrowser) return;
    navigator.clipboard.writeText(cmd).then(() => {
      this.copySuccess.set(true);
      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  ngOnInit(): void {
    this.loadPublishStatus();
    this.route.params.subscribe(params => {
      const slug = params['file'] as string;
      if (!FILE_CONFIGS[slug]) {
        this.router.navigate(['/admin/editorial']);
        return;
      }
      this.fileSlug.set(slug);
      this.loadData(slug);
    });

    if (this.isBrowser) {
      this.unloadHandler = (e: Event) => {
        if (this.anyDirty()) {
          (e as BeforeUnloadEvent).preventDefault();
          (e as BeforeUnloadEvent).returnValue = '';
        }
      };
      window.addEventListener('beforeunload', this.unloadHandler as EventListener);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('beforeunload', this.unloadHandler as EventListener);
    }
    if (this.castleQueryTimer) clearTimeout(this.castleQueryTimer);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.anyDirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private loadData(slug: string): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.serverData.set({});
    this.localEdits.set({});
    this.activeKey.set(null);
    this.formValues.set({});
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.http.get<Record<string, any>>(`/api/editorial/${slug}`).subscribe({
      next: data => {
        this.serverData.set(data ?? {});
        // Pre-populate browse-bands with defaults if empty
        if (slug === 'browse-bands') {
          const filled: Record<string, any> = {};
          for (const [k, v] of Object.entries(BROWSE_BANDS_DEFAULT)) {
            filled[k] = (data ?? {})[k] ?? { ...v };
          }
          this.serverData.set(filled);
        }
        this.loading.set(false);
      },
      error: () => {
        if (slug === 'browse-bands') {
          this.serverData.set(Object.fromEntries(
            Object.entries(BROWSE_BANDS_DEFAULT).map(([k, v]) => [k, { ...v }])
          ));
        }
        this.loading.set(false);
      },
    });
  }

  selectKey(key: string): void {
    if (this.activeKey() === key) return;
    if (this.isDirty() && this.isBrowser) {
      const currentKey = this.activeKey();
      if (!confirm(`Discard unsaved changes to ${currentKey}?`)) return;
      this.localEdits.update(edits => {
        const copy = { ...edits };
        if (currentKey) delete copy[currentKey];
        return copy;
      });
    }
    this.activeKey.set(key);
    const vals = this.localEdits()[key] ?? this.serverData()[key] ?? {};
    this.formValues.set({ ...vals });
    this.fieldErrors.set({});
    this.saveError.set(null);
    this.saveSuccess.set(null);
    // Init castle lookup state if needed
    this.castleResolved.set(null);
    this.castleError.set(false);
    this.castleResults.set([]);
    this.castleDropOpen.set(false);
    // Resolve existing castle code
    const castleField = this.getCastleField();
    if (castleField && vals[castleField]) {
      this.resolveCastleCode(vals[castleField]);
    }
  }

  private getCastleField(): string | null {
    const slug = this.fileSlug();
    if (slug === 'countries') return 'topEntryCode';
    if (slug === 'castle-quotes') return 'castle';
    if (slug === 'period-picks') return 'code';
    return null;
  }

  updateField(field: string, value: any): void {
    const key = this.activeKey();
    if (!key) return;
    const current = { ...this.formValues(), [field]: value };
    this.formValues.set(current);
    this.localEdits.update(edits => ({ ...edits, [key]: current }));
    // Clear field error on change
    this.fieldErrors.update(errs => {
      const copy = { ...errs };
      delete copy[field];
      return copy;
    });
  }

  addKey(): void {
    const slug = this.fileSlug();
    if (!slug || slug === 'period-picks' || slug === 'browse-bands') return;
    const newKey = slug === 'countries' ? 'NEW' : slug === 'regions' ? 'new-region' : 'new-castle';
    const uniqueKey = this.makeUniqueKey(newKey);
    this.localEdits.update(edits => ({ [uniqueKey]: {}, ...edits }));
    this.serverData.update(d => ({ [uniqueKey]: {}, ...d }));
    this.selectKey(uniqueKey);
  }

  private makeUniqueKey(base: string): string {
    const all = new Set([...Object.keys(this.serverData()), ...Object.keys(this.localEdits())]);
    if (!all.has(base)) return base;
    let i = 2;
    while (all.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
  }

  // Castle combobox
  onCastleInput(value: string): void {
    this.castleQuery.set(value);
    this.castleResolved.set(null);
    this.castleError.set(false);
    this.castleDropOpen.set(value.length >= 2);
    const field = this.getCastleField();
    if (field) this.updateField(field, value);
    if (this.castleQueryTimer) clearTimeout(this.castleQueryTimer);
    if (value.length >= 2) {
      this.castleQueryTimer = setTimeout(() => this.fetchCastleLookup(value), 200);
    } else {
      this.castleResults.set([]);
    }
  }

  private fetchCastleLookup(q: string): void {
    this.http.get<CastleLookup[]>('/api/admin/castles/lookup', {
      params: { q },
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: results => {
        this.castleResults.set(results);
        this.castleDropActiveIdx.set(-1);
      },
      error: () => this.castleResults.set([]),
    });
  }

  resolveCastleCode(code: string): void {
    if (!code) return;
    this.http.get<CastleLookup[]>('/api/admin/castles/lookup', {
      params: { q: code },
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: results => {
        const exact = results.find(r => r.code === code);
        if (exact) {
          this.castleResolved.set(exact);
          this.castleError.set(false);
        } else {
          this.castleResolved.set(null);
          this.castleError.set(true);
        }
      },
      error: () => { this.castleResolved.set(null); this.castleError.set(true); },
    });
  }

  selectCastle(castle: CastleLookup): void {
    this.castleResolved.set(castle);
    this.castleError.set(false);
    this.castleDropOpen.set(false);
    this.castleResults.set([]);
    this.castleQuery.set(castle.code);
    const field = this.getCastleField();
    if (field) this.updateField(field, castle.code);
    // Auto-fill name for period-picks
    if (this.isPeriodPicks()) {
      this.updateField('name', castle.name);
    }
  }

  onCastleKeydown(event: KeyboardEvent): void {
    const results = this.castleResults();
    if (!this.castleDropOpen() || !results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.castleDropActiveIdx.update(i => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.castleDropActiveIdx.update(i => Math.max(i - 1, -1));
    } else if (event.key === 'Enter') {
      const idx = this.castleDropActiveIdx();
      if (idx >= 0 && results[idx]) {
        event.preventDefault();
        this.selectCastle(results[idx]);
      }
    } else if (event.key === 'Escape') {
      this.castleDropOpen.set(false);
    }
  }

  // Save
  async save(bandKey?: string): Promise<void> {
    const slug = this.fileSlug();
    if (!slug) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    // Build full payload: server state + local edits
    const payload = { ...this.serverData(), ...this.localEdits() };

    // For browse-bands single-band save, we send the whole file anyway
    const savedKey = bandKey ?? this.activeKey() ?? slug;

    try {
      const result = await this.http.put<{
        success: boolean; backupFilename: string | null; timestamp: string;
      }>(`/api/admin/editorial/${slug}`, payload, {
        headers: { ...this.auth.getAuthHeaders(), 'Content-Type': 'application/json' },
      }).toPromise();

      // Merge edits into server state
      this.serverData.set(payload);
      if (bandKey) {
        // Clear only this band's dirty state
        this.localEdits.update(edits => {
          const copy = { ...edits };
          delete copy[bandKey];
          return copy;
        });
      } else {
        this.localEdits.set({});
      }
      this.lastSavedTime.set(nowHHMM());
      this.saveSuccess.set({ key: savedKey, backup: result?.backupFilename ?? null });
      this.fieldErrors.set({});
      this.loadPublishStatus();
    } catch (err: any) {
      const status = err?.status;
      if (status >= 400 && status < 500 && err?.error?.errors) {
        const serverErrors: Array<{ keyPath: string; message: string }> = err.error.errors;
        const fieldMap: Record<string, string> = {};
        for (const e of serverErrors) {
          const parts = e.keyPath.split('.');
          const field = parts[parts.length - 1];
          fieldMap[field] = e.message;
        }
        this.fieldErrors.set(fieldMap);
        const labels = serverErrors.map(e => e.keyPath).join(', ');
        this.saveError.set(`Validation failed: ${labels}`);
      } else {
        this.saveError.set('Could not save — the server did not accept the change. Your draft is still in this tab.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  discard(bandKey?: string): void {
    const key = bandKey ?? this.activeKey();
    if (!key) return;
    const label = bandKey ? `band ${bandKey}` : key;
    if (!this.isBrowser || confirm(`Discard unsaved changes to ${label}?`)) {
      this.localEdits.update(edits => {
        const copy = { ...edits };
        delete copy[key];
        return copy;
      });
      if (!bandKey) {
        const vals = this.serverData()[key] ?? {};
        this.formValues.set({ ...vals });
        this.fieldErrors.set({});
        this.saveError.set(null);
      }
    }
  }

  getBandFormValue(band: string): string {
    return this.localEdits()[band]?.note
      ?? this.serverData()[band]?.note
      ?? '';
  }

  updateBandNote(band: string, value: string): void {
    const current = { ...this.serverData()[band], note: value };
    this.localEdits.update(edits => ({ ...edits, [band]: current }));
  }

  isBandDirty(band: string): boolean {
    return this.dirtyKeys().has(band);
  }

  getKeyCount(): string {
    const slug = this.fileSlug();
    const serverCount = Object.keys(this.serverData()).length;
    const config = this.fileConfig();
    if (!config) return '';
    if (slug === 'countries') return `${serverCount} of 56`;
    if (slug === 'castle-quotes') return `${serverCount} of 1,000`;
    if (slug === 'period-picks') return `${PERIOD_ERAS.length} eras`;
    if (slug === 'regions') return `${serverCount} keyed`;
    return `${serverCount}`;
  }

  // Count of active (non-new) keys
  getActiveKeyCount(): number {
    return Object.keys(this.serverData()).length;
  }

  trackByKey(_: number, key: string): string { return key; }
}
