import { Component, inject, signal, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private prevTheme: string | null = null;

  handle = '';
  passphrase = '';
  trust = false;
  loading = signal(false);
  error = signal<string | null>(null);

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

  onPassphraseInput(): void {
    if (this.error()) this.error.set(null);
  }

  async submit(): Promise<void> {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    const result = await this.auth.signIn(this.passphrase, this.handle, this.trust);
    this.loading.set(false);
    if (result.success) {
      this.router.navigate(['/admin/editorial']);
    } else {
      this.error.set(result.error ?? 'Sign in failed.');
    }
  }
}
