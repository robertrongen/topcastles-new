import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CastleService } from '../../services/castle.service';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CastleGridComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  private castleService = inject(CastleService);

  top12 = computed(() => this.castleService.getTopByScore(12));
  topVisitors12 = computed(() => this.castleService.getTopByVisitors(12));
  topNetherlands12 = computed(() => this.castleService.getTopByCountry('netherlands', 12));
  loading = this.castleService.loading;

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
