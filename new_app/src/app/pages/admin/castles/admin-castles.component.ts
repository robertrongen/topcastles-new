import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../admin-auth.service';

export interface CastleLookupResult {
  code: string;
  name: string;
  country: string;
  editorialRank: number;
  visitorRank: number;
}

export interface CastleDetail {
  code: string;
  enriched: Record<string, unknown> | null;
  override: Record<string, unknown> | null;
}

const EDITABLE_FIELDS: { key: string; label: string; type: 'text' | 'number' }[] = [
  { key: 'castle_name',    label: 'Castle name',     type: 'text' },
  { key: 'country',        label: 'Country',         type: 'text' },
  { key: 'place',          label: 'Place',           type: 'text' },
  { key: 'region',         label: 'Region',          type: 'text' },
  { key: 'region_code',    label: 'Region code',     type: 'text' },
  { key: 'latitude',       label: 'Latitude',        type: 'number' },
  { key: 'longitude',      label: 'Longitude',       type: 'number' },
  { key: 'castle_type',    label: 'Castle type',     type: 'text' },
  { key: 'castle_concept', label: 'Castle concept',  type: 'text' },
  { key: 'condition',      label: 'Condition',       type: 'text' },
  { key: 'era',            label: 'Era (century)',   type: 'number' },
  { key: 'founder',        label: 'Founder',         type: 'text' },
  { key: 'inception_year', label: 'Inception year',  type: 'number' },
  { key: 'description',    label: 'Description',     type: 'text' },
  { key: 'website',        label: 'Website',         type: 'text' },
];

const NEW_CASTLE_REQUIRED = new Set(['castle_code', 'castle_name', 'country', 'place', 'latitude', 'longitude']);
const CASTLE_CODE_RE = /^[a-z0-9][a-z0-9-]*$/;
const REBUILD_COMMAND = 'npm run pipeline:consume';

@Component({
  selector: 'app-admin-castles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-castles.component.html',
  styleUrl: './admin-castles.component.scss',
})
export class AdminCastlesComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AdminAuthService);

  readonly editableFields = EDITABLE_FIELDS;
  readonly newCastleRequired = NEW_CASTLE_REQUIRED;
  readonly rebuildCommand = REBUILD_COMMAND;

  // Overrides summary
  readonly overrideCount = signal(0);

  // Lookup
  readonly searchQuery = signal('');
  readonly searchResults = signal<CastleLookupResult[]>([]);
  readonly searchLoading = signal(false);
  readonly searchMessage = signal<string | null>(null);
  private readonly searchInput$ = new Subject<string>();
  private searchSubscription: any;

  // Selected castle
  readonly selected = signal<CastleDetail | null>(null);
  readonly loadingDetail = signal(false);

  // Edit form (for existing castle)
  readonly editFields = signal<Record<string, string | number | null>>({});
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);

  // New castle form
  readonly mode = signal<'none' | 'edit' | 'new'>('none');
  readonly newCastleCode = signal('');
  readonly newCastleFields = signal<Record<string, string | number | null>>({});
  readonly newSaving = signal(false);
  readonly newSaveError = signal<string | null>(null);
  readonly newSaveSuccess = signal(false);

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.searchSubscription = this.searchInput$.pipe(
      debounceTime(220),
    ).subscribe(q => this.runSearch(q));

    await this.loadOverrideCount();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  private async loadOverrideCount() {
    try {
      const overrides = await firstValueFrom(
        this.http.get<Record<string, unknown>>('/api/admin/castles', {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.overrideCount.set(Object.keys(overrides).length);
    } catch { /* non-critical */ }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchInput$.next(value);
  }

  private async runSearch(q: string) {
    const query = q.trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      this.searchLoading.set(false);
      this.searchMessage.set(null);
      return;
    }
    this.searchLoading.set(true);
    this.searchMessage.set(null);
    try {
      const results = await firstValueFrom(
        this.http.get<CastleLookupResult[]>(`/api/admin/castles/lookup?q=${encodeURIComponent(query)}`, {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.searchResults.set(results);
      this.searchMessage.set(results.length ? null : `No castles matched "${query}".`);
    } catch {
      this.searchResults.set([]);
      this.searchMessage.set('Lookup failed. Check your token or connection.');
    } finally {
      this.searchLoading.set(false);
    }
  }

  async selectCastle(code: string) {
    this.loadingDetail.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.newSaveSuccess.set(false);
    this.mode.set('edit');
    this.searchResults.set([]);
    this.searchQuery.set('');
    this.searchInput$.next('');
    try {
      const detail = await firstValueFrom(
        this.http.get<CastleDetail>(`/api/admin/castles/${code}`, {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.selected.set(detail);
      // Pre-fill edit form with existing override fields (empty if none)
      const init: Record<string, string | number | null> = {};
      for (const f of EDITABLE_FIELDS) init[f.key] = (detail.override?.[f.key] as string | number | null) ?? null;
      this.editFields.set(init);
    } catch {
      this.selected.set(null);
    } finally {
      this.loadingDetail.set(false);
    }
  }

  setEditField(key: string, value: string, type: 'text' | 'number') {
    const parsed = type === 'number' ? (value === '' ? null : Number(value)) : value;
    this.editFields.update(f => ({ ...f, [key]: parsed }));
  }

  async saveOverride() {
    const detail = this.selected();
    if (!detail) return;
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.saving.set(true);

    // Build body: only non-null editable fields
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(this.editFields())) {
      if (v !== null && v !== '') body[k] = v;
    }

    try {
      const saved = await firstValueFrom(
        this.http.put(`/api/admin/castles/${detail.code}`, body, {
          headers: this.auth.getAuthHeaders(),
        })
      ) as { code: string; override: Record<string, unknown> };
      this.selected.set({ ...detail, override: saved.override });
      this.editFields.set({ ...this.editFields() });
      this.saveSuccess.set(true);
      this.overrideCount.set(this.overrideCount() + (detail.override ? 0 : 1));
    } catch (err) {
      const msg = (err instanceof HttpErrorResponse && err.error?.error)
        ? err.error.error
        : 'Failed to save override.';
      this.saveError.set(msg);
    } finally {
      this.saving.set(false);
    }
  }

  startNewCastle() {
    this.mode.set('new');
    this.selected.set(null);
    this.newCastleCode.set('');
    this.newCastleFields.set({});
    this.newSaveError.set(null);
    this.newSaveSuccess.set(false);
  }

  setNewField(key: string, value: string, type: 'text' | 'number') {
    const parsed = type === 'number' ? (value === '' ? null : Number(value)) : value;
    this.newCastleFields.update(f => ({ ...f, [key]: parsed }));
  }

  async saveNewCastle() {
    this.newSaveError.set(null);
    this.newSaveSuccess.set(false);
    this.newSaving.set(true);

    const code = this.newCastleCode().trim();
    const validationError = this.validateNewCastleDraft(code);
    if (validationError) {
      this.newSaveError.set(validationError);
      this.newSaving.set(false);
      return;
    }

    const body: Record<string, unknown> = { castle_code: code };
    for (const [k, v] of Object.entries(this.newCastleFields())) {
      if (v !== null && v !== '') body[k] = v;
    }

    try {
      await firstValueFrom(
        this.http.post('/api/admin/castles', body, {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.overrideCount.update(n => n + 1);
      // Switch to edit view of the new draft
      await this.selectCastle(code);
      this.saveSuccess.set(true);
      this.newSaveSuccess.set(true);
    } catch (err) {
      const msg = (err instanceof HttpErrorResponse && err.error?.error)
        ? err.error.error
        : 'Failed to create castle draft.';
      this.newSaveError.set(msg);
    } finally {
      this.newSaving.set(false);
    }
  }

  clearSelection() {
    this.selected.set(null);
    this.mode.set('none');
    this.searchQuery.set('');
    this.searchInput$.next('');
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.newSaveError.set(null);
    this.newSaveSuccess.set(false);
  }

  private validateNewCastleDraft(code: string): string | null {
    if (!CASTLE_CODE_RE.test(code)) {
      return 'Castle code must be a lowercase slug using letters, digits, and hyphens.';
    }

    const fields = this.newCastleFields();
    for (const key of ['castle_name', 'country', 'place']) {
      const value = fields[key];
      if (typeof value !== 'string' || value.trim().length === 0) {
        return `${this.fieldLabel(key)} is required.`;
      }
    }

    for (const key of ['latitude', 'longitude']) {
      const value = fields[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return `${this.fieldLabel(key)} must be a number.`;
      }
    }

    return null;
  }

  private fieldLabel(key: string): string {
    if (key === 'castle_code') return 'Castle code';
    return EDITABLE_FIELDS.find(f => f.key === key)?.label ?? key;
  }

  enrichedValue(key: string): string {
    const v = this.selected()?.enriched?.[key];
    if (v === undefined || v === null || v === '') return '—';
    return String(v);
  }
}
