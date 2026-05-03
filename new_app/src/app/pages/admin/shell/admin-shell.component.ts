import { Component, inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private prevTheme: string | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.prevTheme = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.prevTheme !== null) {
        document.documentElement.setAttribute('data-theme', this.prevTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  signOut(): void {
    this.auth.clearSession();
    this.router.navigate(['/admin/login']);
  }

  formatLoginTime(date: Date | null): string {
    if (!date) return '—';
    const h = String(date.getUTCHours()).padStart(2, '0');
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m} GMT`;
  }
}
