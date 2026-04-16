import { Component, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  template: `
    <h1>Search</h1>
    <p>Search page — implementation coming soon.</p>
  `,
})
export class SearchPageComponent implements OnInit {
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
