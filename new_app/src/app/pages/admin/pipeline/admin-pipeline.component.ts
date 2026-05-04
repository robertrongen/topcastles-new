import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminAuthService } from '../admin-auth.service';

export interface PendingUpload {
  present: boolean;
  uploadedAt: string | null;
  recordCount: number | null;
  uploadedBy: string | null;
  fileSizeBytes: number | null;
  checksum: string | null;
}

export interface PipelineStatus {
  pendingUpload: PendingUpload | null;
  buildNotice: string | null;
  warnings: string[];
}

@Component({
  selector: 'app-admin-pipeline',
  standalone: true,
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

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const data = await firstValueFrom(
        this.http.get<PipelineStatus>('/api/admin/pipeline/status', {
          headers: this.auth.getAuthHeaders(),
        })
      );
      this.status.set(data);
    } catch {
      this.error.set('Could not load pipeline status. Check your connection or token.');
    } finally {
      this.loading.set(false);
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
