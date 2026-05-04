import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map } from 'rxjs/operators';
import { Castle } from '../../models/castle.model';
import { CastleService } from '../../services/castle.service';
import { FavoritesService, FavoriteSet } from '../../services/favorites.service';
import { ImageService } from '../../services/image.service';
import { UserService } from '../../services/user.service';

type FavoritesSortKey = 'added' | 'rank' | 'score' | 'alpha';

interface SetPreview {
  text: string;
  moreCount: number;
  empty: boolean;
}

interface SelectedSetMeta {
  countText: string;
  previewText: string;
}

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
})
export class FavoritesPageComponent implements OnInit {
  private castleService = inject(CastleService);
  protected favoritesService = inject(FavoritesService);
  private imageService = inject(ImageService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  protected isBrowser = isPlatformBrowser(this.platformId);
  protected newSetName = signal('');
  protected creating = signal(false);
  protected showNewSet = signal(false);
  protected shareOpen = signal(false);
  protected shareCopied = signal(false);
  protected confirmDeleteSetId = signal<string | null>(null);
  protected editingSetId = signal<string | null>(null);
  protected editingSetName = signal('');
  protected sortKey = signal<FavoritesSortKey>('added');

  private querySet = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('set'))),
    { initialValue: null }
  );

  protected loading = computed(() => this.favoritesService.loading() || this.castleService.loading());

  protected selectedSet = computed(() => {
    const sets = this.favoritesService.favorites();
    if (sets.length === 0) return null;

    const query = this.querySet();
    const byName = query ? sets.find((set) => set.name === query) : null;
    if (byName) return byName;

    return sets.find((set) => set.id === 'favs' || set.name.toLowerCase() === 'my favorites') ?? sets[0];
  });

  protected selectedCastles = computed(() => {
    const set = this.selectedSet();
    if (!set) return [];

    const castleByCode = new Map(this.castleService.getAllByScore().map((castle) => [castle.castle_code, castle]));
    return set.castleIds
      .map((code) => castleByCode.get(code))
      .filter((castle): castle is Castle => Boolean(castle));
  });

  protected displayedCastles = computed(() => {
    const castles = [...this.selectedCastles()];
    const sort = this.sortKey();

    if (sort === 'added') return castles;
    if (sort === 'rank') {
      return castles.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    if (sort === 'score') {
      return castles.sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0));
    }
    return castles.sort((a, b) => a.castle_name.localeCompare(b.castle_name));
  });

  protected totalFavoriteCount = computed(() =>
    this.favoritesService.favorites().reduce((sum, set) => sum + set.castleIds.length, 0)
  );

  protected hasFavoriteCastles = computed(() => this.totalFavoriteCount() > 0);

  protected shareLink = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return null;

    const baseLink = this.userService.getShareLink();
    const url = new URL(baseLink ?? `${window.location.origin}/favorites`);
    const set = this.selectedSet();
    if (set) {
      url.searchParams.set('set', set.name);
    }
    return url.toString();
  });

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token && isPlatformBrowser(this.platformId)) {
      this.userService.importToken(token);
    }

    await this.userService.ensureUser();
    await Promise.all([this.castleService.loadCastles(), this.favoritesService.loadFavorites()]);

    if (isPlatformBrowser(this.platformId) && !this.querySet() && this.selectedSet()) {
      await this.selectSet(this.selectedSet()!, true);
    }
  }

  protected selectSet(set: FavoriteSet, replaceUrl = false): Promise<boolean> {
    this.confirmDeleteSetId.set(null);
    this.editingSetId.set(null);
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { set: set.name },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  protected isSelected(set: FavoriteSet): boolean {
    return this.selectedSet()?.id === set.id;
  }

  protected setPreview(set: FavoriteSet): SetPreview {
    const names = set.castleIds
      .map((code) => this.castleService.getCastleByCode(code)?.castle_name)
      .filter((name): name is string => Boolean(name));

    if (set.castleIds.length === 0) {
      return { text: 'Empty set', moreCount: 0, empty: true };
    }

    return {
      text: names.slice(0, 2).join(', '),
      moreCount: Math.max(0, set.castleIds.length - 2),
      empty: false,
    };
  }

  protected selectedSetMeta(set: FavoriteSet): SelectedSetMeta {
    const preview = this.setPreview(set);
    const countText = `${set.castleIds.length} castle${set.castleIds.length !== 1 ? 's' : ''}`;

    if (preview.empty) {
      return { countText, previewText: 'No castles yet' };
    }

    const moreText = preview.moreCount > 0 ? `, +${preview.moreCount} more` : '';
    return { countText, previewText: `${preview.text}${moreText}` };
  }

  protected toggleNewSet(): void {
    this.showNewSet.update((value) => !value);
    if (!this.showNewSet()) {
      this.newSetName.set('');
    }
  }

  protected toggleShare(): void {
    this.shareOpen.update((value) => !value);
  }

  protected async createSet(): Promise<void> {
    const name = this.newSetName().trim();
    if (!name) return;

    this.creating.set(true);
    try {
      await this.favoritesService.createSet(name);
      this.newSetName.set('');
      this.showNewSet.set(false);

      const set = this.favoritesService.favorites().find((item) => item.name === name);
      if (set) {
        await this.selectSet(set);
      }
    } finally {
      this.creating.set(false);
    }
  }

  protected async copyShareLink(): Promise<void> {
    const link = this.shareLink();
    if (!link || !isPlatformBrowser(this.platformId)) return;

    await navigator.clipboard.writeText(link);
    this.shareCopied.set(true);
    window.setTimeout(() => this.shareCopied.set(false), 2000);
  }

  protected startRename(set: FavoriteSet): void {
    this.editingSetId.set(set.id);
    this.editingSetName.set(set.name);
    this.confirmDeleteSetId.set(null);
  }

  protected cancelRename(): void {
    this.editingSetId.set(null);
    this.editingSetName.set('');
  }

  protected async saveRename(set: FavoriteSet): Promise<void> {
    const name = this.editingSetName().trim();
    if (!name || name === set.name) {
      this.cancelRename();
      return;
    }

    await this.favoritesService.updateSet(set.id, name, set.castleIds);
    this.cancelRename();
    await this.selectSet({ ...set, name });
  }

  protected async duplicateSet(set: FavoriteSet): Promise<void> {
    const existingNames = new Set(this.favoritesService.favorites().map((item) => item.name));
    const baseName = `${set.name} copy`;
    let name = baseName;
    let copyNumber = 2;

    while (existingNames.has(name)) {
      name = `${baseName} ${copyNumber}`;
      copyNumber += 1;
    }

    await this.favoritesService.createSet(name, [...set.castleIds]);
    const duplicate = this.favoritesService.favorites().find((item) => item.name === name);
    if (duplicate) {
      await this.selectSet(duplicate);
    }
  }

  protected requestDelete(set: FavoriteSet): void {
    this.confirmDeleteSetId.set(set.id);
    this.editingSetId.set(null);
  }

  protected cancelDelete(): void {
    this.confirmDeleteSetId.set(null);
  }

  protected async deleteSet(set: FavoriteSet): Promise<void> {
    await this.favoritesService.deleteSet(set.id);
    this.confirmDeleteSetId.set(null);

    const nextSet = this.selectedSet();
    if (nextSet) {
      await this.selectSet(nextSet, true);
      return;
    }

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { set: null },
      queryParamsHandling: 'merge',
    });
  }

  protected setSort(key: FavoritesSortKey, event: Event): void {
    event.preventDefault();
    this.sortKey.set(key);
  }

  protected async exportCsv(event: Event): Promise<void> {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    const set = this.selectedSet();
    const rows = this.displayedCastles().map((castle, index) => [
      String(this.setRank(castle) ?? index + 1),
      String(castle.position),
      castle.castle_name,
      castle.country,
      String(castle.score_total ?? ''),
    ]);
    const csv = [
      'Set rank,Top-1000 rank,Castle,Country,Score',
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${set?.name ?? 'favorites'}-export.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected print(event: Event): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }

  protected setRank(castle: Castle): number | null {
    const set = this.selectedSet();
    if (!set) return null;

    const index = set.castleIds.indexOf(castle.castle_code);
    return index >= 0 ? index + 1 : null;
  }

  protected thumbnailUrl(castle: Castle): string {
    return this.imageService.castleThumbnailUrl(castle.castle_code);
  }

  protected clearBrokenImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';
  }
}
