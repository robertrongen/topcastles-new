import { Component, Input, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castle-grid',
  standalone: true,
  imports: [RouterLink, MatCardModule, DecimalPipe, MatIconModule],
  templateUrl: './castle-grid.component.html',
  styleUrl: './castle-grid.component.scss',
})
export class CastleGridComponent {
  @Input({ required: true }) castles: Castle[] = [];

  private router = inject(Router);
  failedLocal = signal(new Set<string>());
  failedWiki  = signal(new Set<string>());

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
