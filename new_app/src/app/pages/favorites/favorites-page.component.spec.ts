import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Castle } from '../../models/castle.model';
import { CastleService } from '../../services/castle.service';
import { FavoriteSet, FavoritesService } from '../../services/favorites.service';
import { ImageService } from '../../services/image.service';
import { UserService } from '../../services/user.service';
import { FavoritesPageComponent } from './favorites-page.component';

const castles: Castle[] = [
  {
    position: 77,
    castle_code: 'roncolo',
    castle_name: 'Castel Roncolo',
    country: 'Italy',
    area: '',
    place: 'Bolzano',
    region: 'Trentino',
    region_code: '',
    latitude: null,
    longitude: null,
    founder: '',
    era: null,
    castle_type: 'Rock castle',
    castle_concept: '',
    condition: 'Restored',
    score_total: 7,
    score_visitors: 7,
  },
  {
    position: 4,
    castle_code: 'krak',
    castle_name: 'Krak des Chevaliers',
    country: 'Syria',
    area: '',
    place: 'Homs',
    region: 'Homs',
    region_code: '',
    latitude: null,
    longitude: null,
    founder: '',
    era: null,
    castle_type: 'Crusader castle',
    castle_concept: '',
    condition: 'Preserved',
    score_total: 8.6,
    score_visitors: 8.4,
  },
];

class CastleServiceMock {
  loading = signal(false);
  loadCastles = jasmine.createSpy('loadCastles').and.resolveTo();
  getAllByScore(): Castle[] {
    return castles;
  }
  getCastleByCode(code: string): Castle | undefined {
    return castles.find((castle) => castle.castle_code === code);
  }
}

class FavoritesServiceMock {
  favorites = signal<FavoriteSet[]>([
    { id: 'other', name: 'set1', castleIds: ['krak'] },
    { id: 'favs', name: 'My favorites', castleIds: ['roncolo', 'krak'] },
  ]);
  loading = signal(false);
  loadFavorites = jasmine.createSpy('loadFavorites').and.resolveTo();
  createSet = jasmine.createSpy('createSet').and.resolveTo();
  updateSet = jasmine.createSpy('updateSet').and.resolveTo();
  deleteSet = jasmine.createSpy('deleteSet').and.resolveTo();
}

class UserServiceMock {
  ensureUser = jasmine.createSpy('ensureUser').and.resolveTo();
  importToken = jasmine.createSpy('importToken');
  getShareLink(): string {
    return 'http://localhost/favorites?token=share-token';
  }
}

class ImageServiceMock {
  castleThumbnailUrl(code: string): string {
    return `/castle-images/small/${code}_small.jpg`;
  }
}

describe('FavoritesPageComponent', () => {
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let router: Router;

  async function setup(queryParams: Record<string, string> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap(queryParams)), snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
        { provide: CastleService, useClass: CastleServiceMock },
        { provide: FavoritesService, useClass: FavoritesServiceMock },
        { provide: ImageService, useClass: ImageServiceMock },
        { provide: UserService, useClass: UserServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(FavoritesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('defaults to the My favorites set and renders castles with set and global ranks', async () => {
    await setup();

    const text = fixture.nativeElement.textContent as string;
    const activeTab = fixture.nativeElement.querySelector('.set-tab--active') as HTMLElement;
    expect(activeTab.textContent).toContain('My favorites');
    expect(text).toContain('My favorites');
    expect(text).toContain('2 castles');
    expect(text).toContain('Rename');
    expect(text).toContain('Duplicate');
    expect(text).toContain('Delete');
    expect(text).toContain('Castel Roncolo');
    expect(text).toContain('Krak des Chevaliers');
    expect(text).toContain('★ 77');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { set: 'My favorites' },
      replaceUrl: true,
    }));
  });

  it('uses the set query parameter for selection and the tokenized share URL', async () => {
    await setup({ set: 'set1' });

    const selectedText = (fixture.nativeElement.querySelector('.selected-set') as HTMLElement).textContent ?? '';
    expect(selectedText).toContain('set1');
    expect(selectedText).toContain('Krak des Chevaliers');
    expect(selectedText).not.toContain('Castel Roncolo');

    const component = fixture.componentInstance as unknown as { shareLink: () => string | null };
    expect(component.shareLink()).toBe('http://localhost/favorites?token=share-token&set=set1');
  });
});
