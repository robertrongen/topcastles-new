import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { CastleService } from '../../services/castle.service';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe, CastleGridComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private castleService = inject(CastleService);
  private router = inject(Router);

  top12 = computed(() => this.castleService.getTopByScore(12));
  topVisitors12 = computed(() => this.castleService.getTopByVisitors(12));
  topNetherlands12 = computed(() => this.castleService.getTopByCountry('netherlands', 12));
  loading = this.castleService.loading;

  readonly stats = [
    { value: '1,000', label: 'castles ranked' },
    { value: '56', label: 'countries' },
    { value: '63,800', label: 'visitor ratings' },
    { value: '2004', label: 'established' },
  ];

  goToSurprise(): void {
    const pool = this.castleService.castles();
    if (!pool.length) {
      this.router.navigate(['/top1000']);
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    this.router.navigate(['/castles', pick.castle_code]);
  }
}
