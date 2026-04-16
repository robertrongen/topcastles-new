import { Component, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-countries-page',
  standalone: true,
  template: `
    <h1>Countries</h1>
    <p>Countries listing page — implementation coming soon.</p>
  `,
})
export class CountriesPageComponent implements OnInit {
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
