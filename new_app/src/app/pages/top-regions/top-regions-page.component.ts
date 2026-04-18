import { Component, computed, inject, OnInit } from '@angular/core';
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
export class TopRegionsPageComponent implements OnInit {
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  summaries = computed(() => this.castleService.getRegionSummaries());

  ngOnInit(): void {
    this.castleService.loadCastles();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
