import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CastleService } from '../../services/castle.service';
import { RegionSummary } from '../../models/castle.model';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-top-regions-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatCardModule, ViewToggleComponent],
  templateUrl: './top-regions-page.component.html',
  styleUrl: './top-regions-page.component.scss',
})
export class TopRegionsPageComponent {
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  summaries = computed(() =>
    this.castleService.getCountries()
      .flatMap(country => this.castleService.getRegionSummaries(country))
      .sort((a, b) => b.totalScore - a.totalScore)
  );

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
