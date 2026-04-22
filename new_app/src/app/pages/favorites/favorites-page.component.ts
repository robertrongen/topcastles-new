import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { FavoritesService, FavoriteSet } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
})
export class FavoritesPageComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  favoritesService = inject(FavoritesService);

  newSetName = signal('');
  creating = signal(false);
  shareLink = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.userService.ensureUser();
    if (isPlatformBrowser(this.platformId)) {
      this.shareLink.set(this.userService.getShareLink());
    }
    await this.favoritesService.loadFavorites();
  }

  async copyShareLink(): Promise<void> {
    const link = this.shareLink();
    if (!link || !isPlatformBrowser(this.platformId)) return;
    await navigator.clipboard.writeText(link);
    this.snackBar.open('Link copied to clipboard', '', { duration: 2500 });
  }

  async createSet(): Promise<void> {
    const name = this.newSetName().trim();
    if (!name) return;
    this.creating.set(true);
    try {
      await this.favoritesService.createSet(name);
      this.newSetName.set('');
    } finally {
      this.creating.set(false);
    }
  }

  async deleteSet(set: FavoriteSet): Promise<void> {
    await this.favoritesService.deleteSet(set.id);
  }
}
