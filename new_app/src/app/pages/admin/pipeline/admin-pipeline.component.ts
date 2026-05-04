import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../admin-auth.service';

export interface PendingUpload {
  present: boolean;
  uploadedAt: string | null;
  recordCount: number | null;
  uploadedBy: string | null;
  fileSizeBytes: number | null;
  checksum: string | null;
}

export interface PipelineLedger {
  lastStagedAt: string | null;
  lastStagedHash: string | null;
  lastBuildAt: string | null;
  lastDeployAt: string | null;
  notes: string[];
}

export interface PipelineStatus {
  pendingUpload: PendingUpload | null;
  buildNotice: string | null;
  warnings: string[];
  ledger: PipelineLedger;
}

export interface RebuildRequest {
  requestedAt: string;
  requestedBy: string;
  reason: string;
  status: string;
}

export interface EnrichmentRequest {
  requestedAt: string;
  requestedBy: string;
  type: string;
  reason: string;
  status: string;
}

export const ENRICHMENT_TYPES = ['wikipedia', 'wikidata', 'coordinates', 'full'] as const;

@Component({
  selector: 'app-admin-pipeline',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-pipeline.component.html',
  styleUrl: './admin-pipeline.component.scss',
})
export class AdminPipelineComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AdminAuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly status = signal<PipelineStatus | null>(null);

  readonly rebuildRequest = signal<RebuildRequest | null>(null);
  readonly rebuildReason = signal('staged enriched dataset ready');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly enrichmentRequest = signal<EnrichmentRequest | null>(null);
  readonly enrichmentType = signal<string>('wikidata');
  readonly enrichmentReason = signal('refresh missing fields');
  readonly enrichSubmitting = signal(false);
  readonly enrichSubmitError = signal<string | null>(null);
  readonly enrichmentTypes = ENRICHMENT_TYPES;

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const [statusData, rebuildData, enrichmentData] = await Promise.allSettled([
        firstValueFrom(
          this.http.get<PipelineStatus>('/api/admin/pipeline/status', {
            headers: this.auth.getAuthHeaders(),
          })
        ),
        firstValueFrom(
          this.http.get<RebuildRequest>('/api/admin/pipeline/rebuild-request', {
            headers: this.auth.getAuthHeaders(),
          })
        ),
        firstValueFrom(
          this.http.get<EnrichmentRequest>('/api/admin/pipeline/enrichment-request', {
            headers: this.auth.getAuthHeaders(),
          })
        ),
      ]);

      if (statusData.status === 'fulfilled') {
        this.status.set(statusData.value);
      } else {
        this.error.set('Could not load pipeline status. Check your connection or token.');
      }

      if (rebuildData.status === 'fulfilled') {
        this.rebuildRequest.set(rebuildData.value);
      }
      // 404 means no pending request — leave signal null, no error

      if (enrichmentData.status === 'fulfilled') {
        this.enrichmentRequest.set(enrichmentData.value);
      }
      // 404 means no pending enrichment request — leave signal null, no error
    } finally {
      this.loading.set(false);
    }
  }

  async requestRebuild() {
    this.submitError.set(null);
    this.submitting.set(true);
    try {
      const entry = await firstValueFrom(
        this.http.post<RebuildRequest>(
          '/api/admin/pipeline/rebuild-request',
          { reason: this.rebuildReason(), requestedBy: this.auth.handle() },
          { headers: this.auth.getAuthHeaders() }
        )
      );
      this.rebuildRequest.set(entry);
    } catch (err) {
      const msg = (err instanceof HttpErrorResponse && err.error?.error)
        ? err.error.error
        : 'Failed to submit rebuild request.';
      this.submitError.set(msg);
    } finally {
      this.submitting.set(false);
    }
  }

  async requestEnrichment() {
    this.enrichSubmitError.set(null);
    this.enrichSubmitting.set(true);
    try {
      const entry = await firstValueFrom(
        this.http.post<EnrichmentRequest>(
          '/api/admin/pipeline/enrichment-request',
          {
            type: this.enrichmentType(),
            reason: this.enrichmentReason(),
            requestedBy: this.auth.handle(),
          },
          { headers: this.auth.getAuthHeaders() }
        )
      );
      this.enrichmentRequest.set(entry);
    } catch (err) {
      const msg = (err instanceof HttpErrorResponse && err.error?.error)
        ? err.error.error
        : 'Failed to submit enrichment request.';
      this.enrichSubmitError.set(msg);
    } finally {
      this.enrichSubmitting.set(false);
    }
  }

  formatBytes(bytes: number | null): string {
    if (bytes === null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toUTCString().replace(/:\d{2} GMT$/, ' UTC');
  }
}
