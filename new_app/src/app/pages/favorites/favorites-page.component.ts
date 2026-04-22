import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { FavoritesService, FavoriteSet } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
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
  favoritesService = inject(FavoritesService);

  newSetName = signal('');
  creating = signal(false);

  async ngOnInit(): Promise<void> {
    await this.userService.ensureUser();
    await this.favoritesService.loadFavorites();
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
