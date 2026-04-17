import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Castle } from '../../models/castle.model';

@Component({
  selector: 'app-castle-grid',
  standalone: true,
  imports: [RouterLink, MatCardModule, DecimalPipe],
  templateUrl: './castle-grid.component.html',
  styleUrl: './castle-grid.component.scss',
})
export class CastleGridComponent {
  @Input({ required: true }) castles: Castle[] = [];

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
