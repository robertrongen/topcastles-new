import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Castle } from '../../models/castle.model';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-castle-grid',
  standalone: true,
  imports: [RouterLink, MatCardModule, DecimalPipe, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './castle-grid.component.html',
  styleUrl: './castle-grid.component.scss',
})
export class CastleGridComponent {
  @Input({ required: true }) castles: Castle[] = [];
  @Input() removable = false;
  @Output() remove = new EventEmitter<string>();

  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  isFavorite(code: string): boolean {
    return this.favoritesService.favorites().some(s => s.castleIds.includes(code));
  }
  failedLocal = signal(new Set<string>());
  failedWiki  = signal(new Set<string>());

  onRemove(event: Event, code: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.remove.emit(code);
  }

  goToCountry(event: MouseEvent, country: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/top1000'], { queryParams: { country } });
  }

  onLocalError(castle: Castle): void {
    this.failedLocal.update(s => new Set(s).add(castle.castle_code));
  }

  onWikiError(castle: Castle): void {
    this.failedWiki.update(s => new Set(s).add(castle.castle_code));
  }
}
