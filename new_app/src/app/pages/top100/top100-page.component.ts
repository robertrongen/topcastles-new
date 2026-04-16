import { Component, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-top100-page',
  standalone: true,
  template: `
    <h1>Top 100 Castles</h1>
    <p>Top 100 ranking page — implementation coming soon.</p>
  `,
})
export class Top100PageComponent implements OnInit {
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
