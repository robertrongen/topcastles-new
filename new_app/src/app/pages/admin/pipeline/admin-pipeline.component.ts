import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
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

export interface PipelineJob {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  requestedBy: string | null;
  reason: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  logFile: string | null;
  errorMessage: string | null;
}

const POLL_INTERVAL_MS = 5000;
const REBUILD_COMMAND = 'npm run pipeline:consume';
const ENRICHMENT_COMMAND = 'npm run pipeline:consume:enrichment';
const WATCH_COMMAND = 'npm run pipeline:watch';

@Component({
  selector: 'app-admin-pipeline',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-pipeline.component.html',
  styleUrl: './admin-pipeline.component.scss',
})
export class AdminPipelineComponent implements OnInit, OnDestroy {
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
  readonly rebuildCommand = REBUILD_COMMAND;
  readonly enrichmentCommand = ENRICHMENT_COMMAND;
  readonly watchCommand = WATCH_COMMAND;

  readonly jobs = signal<PipelineJob[]>([]);
  readonly jobsLoading = signal(true);
  readonly jobsError = signal<string | null>(null);
  readonly expandedJobId = signal<string | null>(null);
  readonly expandedLogContent = signal<string | null>(null);
  readonly expandedLogLoading = signal(false);

  readonly activeJob = computed(() => this.jobs().find(j => j.status === 'running') ?? null);
  readonly pendingRequestCount = computed(() =>
    (this.rebuildRequest()?.status === 'requested' ? 1 : 0) +
    (this.enrichmentRequest()?.status === 'requested' ? 1 : 0)
  );

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy() {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

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

    await this.loadJobs();
    this.startPollingIfNeeded();
  }

  private async loadJobs() {
    this.jobsLoading.set(true);
    this.jobsError.set(null);
    try {
      const list = await firstValueFrom(
        this.http.get<PipelineJob[]>('/api/admin/pipeline/jobs', {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.jobs.set(list);
    } catch {
      this.jobs.set([]);
      this.jobsError.set('Could not load pipeline jobs.');
      // non-fatal — jobs section just stays empty
    } finally {
      this.jobsLoading.set(false);
    }
  }

  private startPollingIfNeeded() {
    const hasRunning = this.jobs().some(j => j.status === 'running');
    if (!hasRunning || this.pollTimer !== null) return;
    this.pollTimer = setInterval(async () => {
      await this.loadJobs();
      if (!this.jobs().some(j => j.status === 'running')) {
        clearInterval(this.pollTimer!);
        this.pollTimer = null;
      }
    }, POLL_INTERVAL_MS);
  }

  async toggleJobLog(id: string) {
    if (this.expandedJobId() === id) {
      this.expandedJobId.set(null);
      this.expandedLogContent.set(null);
      return;
    }
    this.expandedJobId.set(id);
    this.expandedLogContent.set(null);
    this.expandedLogLoading.set(true);
    try {
      const text = await firstValueFrom(
        this.http.get(`/api/admin/pipeline/jobs/${id}/log`, {
          headers: this.auth.getAuthHeaders(),
          responseType: 'text',
        })
      );
      this.expandedLogContent.set(text);
    } catch {
      this.expandedLogContent.set('Log not available.');
    } finally {
      this.expandedLogLoading.set(false);
    }
  }

  jobStatusClass(status: string): string {
    if (status === 'completed') return 'job-badge--completed';
    if (status === 'failed') return 'job-badge--failed';
    return 'job-badge--running';
  }

  async requestRebuild() {
    this.submitError.set(null);
    const reason = this.rebuildReason().trim();
    if (!reason) {
      this.submitError.set('Reason is required.');
      return;
    }
    this.submitting.set(true);
    try {
      const entry = await firstValueFrom(
        this.http.post<RebuildRequest>(
          '/api/admin/pipeline/rebuild-request',
          { reason, requestedBy: this.auth.handle() },
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
    const reason = this.enrichmentReason().trim();
    if (!reason) {
      this.enrichSubmitError.set('Reason is required.');
      return;
    }
    this.enrichSubmitting.set(true);
    try {
      const entry = await firstValueFrom(
        this.http.post<EnrichmentRequest>(
          '/api/admin/pipeline/enrichment-request',
          {
            type: this.enrichmentType(),
            reason,
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

  hasRequestReason(value: string): boolean {
    return value.trim().length > 0;
  }
}
