import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CastleService } from '../../services/castle.service';
import { CastleTableComponent } from '../../components/castle-table/castle-table.component';
import { CastleGridComponent } from '../../components/castle-grid/castle-grid.component';
import { ViewToggleComponent } from '../../components/view-toggle/view-toggle.component';
import { ViewModeService } from '../../services/view-mode.service';

@Component({
  selector: 'app-countries-page',
  standalone: true,
  imports: [
    FormsModule, MatFormFieldModule, MatSelectModule,
    CastleTableComponent, CastleGridComponent, ViewToggleComponent,
  ],
  templateUrl: './countries-page.component.html',
  styleUrl: './countries-page.component.scss',
})
export class CountriesPageComponent implements OnInit {
  private castleService = inject(CastleService);
  protected viewModeService = inject(ViewModeService);

  countries = computed(() => this.castleService.getCountries());
  selectedCountry = signal('Netherlands');

  castles = computed(() => this.castleService.getCastlesByCountry(this.selectedCountry()));

  columns = ['position', 'score_total', 'thumbnail', 'castle_name', 'place', 'region', 'castle_type'];

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
