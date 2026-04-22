import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';
import { FavoritesService } from './services/favorites.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule,
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

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;
    this.userService.importToken(token);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    this.favoritesService.loadFavorites();
  }
}
