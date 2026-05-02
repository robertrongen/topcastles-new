import { Component, inject, NgZone, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';
import { FavoritesService } from './services/favorites.service';
import { CastleService } from './services/castle.service';
import { haversineKm } from './utils/distance';
import { MastheadSearchComponent } from './components/masthead-search/masthead-search.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatTooltipModule,
    MastheadSearchComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Top Castles';
  protected theme = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private favoritesService = inject(FavoritesService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private castleService = inject(CastleService);
  private ngZone = inject(NgZone);

  nearMeState = signal<'idle' | 'loading' | 'error'>('idle');
  canInstall = signal(false);
  private installPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.canInstall.set(false);
    });

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    this.importSharedToken(token);
  }

  private async importSharedToken(token: string): Promise<void> {
    const current = this.userService.getToken();
    if (token === current) return;
    this.userService.importToken(token);
    try {
      await this.favoritesService.loadFavorites();
      this.snackBar.open('Favorites loaded from shared link', 'OK', { duration: 2000 });
    } catch {
      if (current) {
        this.userService.importToken(current);
      } else {
        this.userService.clearToken();
      }
    }
  }

  async triggerInstall(): Promise<void> {
    if (this.installPrompt) {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      if (outcome === 'accepted') {
        this.installPrompt = null;
        this.canInstall.set(false);
      }
    } else {
      this.router.navigate(['/install']);
    }
  }

  goToNearestCastle(): void {
    if (!navigator.geolocation) { this.nearMeState.set('error'); return; }
    this.nearMeState.set('loading');
    navigator.geolocation.getCurrentPosition(
      pos => this.ngZone.run(() => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const nearest = [...this.castleService.castles()]
          .filter(c => c.latitude != null && c.longitude != null)
          .sort((a, b) =>
            haversineKm(lat, lon, a.latitude!, a.longitude!) -
            haversineKm(lat, lon, b.latitude!, b.longitude!)
          )
          .slice(0, 20)
          .sort((a, b) =>
            (a.position ?? Number.MAX_SAFE_INTEGER) -
            (b.position ?? Number.MAX_SAFE_INTEGER)
          )[0];
        if (nearest) {
          this.nearMeState.set('idle');
          this.router.navigate(['/castles', nearest.castle_code]);
        } else {
          this.nearMeState.set('error');
        }
      }),
      () => this.ngZone.run(() => this.nearMeState.set('error')),
      { timeout: 8000 },
    );
  }
}
