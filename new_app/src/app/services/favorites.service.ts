import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';

export interface FavoriteSet {
  id: string;
  name: string;
  castleIds: string[];
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  favorites = signal<FavoriteSet[]>([]);
  loading = signal(false);

  private get headers() {
    return this.userService.authHeaders();
  }

  private async withAuth<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        await this.userService.handleUnauthorized();
        return call();
      }
      throw err;
    }
  }

  async loadFavorites(): Promise<void> {
    this.loading.set(true);
    try {
      const sets = await this.withAuth(() =>
        firstValueFrom(this.http.get<FavoriteSet[]>('/api/user/favorites', { headers: this.headers }))
      );
      this.favorites.set(sets);
    } catch {
      this.favorites.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async createSet(name: string, castleIds: string[] = []): Promise<void> {
    await this.withAuth(() =>
      firstValueFrom(this.http.post('/api/user/favorites', { name, castleIds }, { headers: this.headers }))
    );
    await this.loadFavorites();
  }

  async updateSet(id: string, name: string, castleIds: string[]): Promise<void> {
    await this.withAuth(() =>
      firstValueFrom(this.http.put(`/api/user/favorites/${id}`, { name, castleIds }, { headers: this.headers }))
    );
    await this.loadFavorites();
  }

  async deleteSet(id: string): Promise<void> {
    await this.withAuth(() =>
      firstValueFrom(this.http.delete(`/api/user/favorites/${id}`, { headers: this.headers }))
    );
    await this.loadFavorites();
  }

  async removeCastleFromSet(setId: string, castleId: string): Promise<void> {
    const set = this.favorites().find(s => s.id === setId);
    if (!set || !set.castleIds.includes(castleId)) return;
    const updatedIds = set.castleIds.filter(id => id !== castleId);
    this.favorites.update(favs =>
      favs.map(f => f.id === setId ? { ...f, castleIds: updatedIds } : f)
    );
    try {
      await this.withAuth(() =>
        firstValueFrom(this.http.put(`/api/user/favorites/${setId}`, { name: set.name, castleIds: updatedIds }, { headers: this.headers }))
      );
    } catch {
      this.favorites.update(favs =>
        favs.map(f => f.id === setId ? { ...f, castleIds: [...new Set([...f.castleIds, castleId])] } : f)
      );
    }
  }

  async addCastleToSet(setId: string, castleId: string): Promise<void> {
    const set = this.favorites().find(s => s.id === setId);
    if (!set || set.castleIds.includes(castleId)) return;
    const updatedIds = [...set.castleIds, castleId];
    this.favorites.update(favs =>
      favs.map(f => f.id === setId ? { ...f, castleIds: updatedIds } : f)
    );
    try {
      await this.withAuth(() =>
        firstValueFrom(this.http.put(`/api/user/favorites/${setId}`, { name: set.name, castleIds: updatedIds }, { headers: this.headers }))
      );
    } catch {
      this.favorites.update(favs =>
        favs.map(f => f.id === setId ? { ...f, castleIds: f.castleIds.filter(id => id !== castleId) } : f)
      );
    }
  }
}
