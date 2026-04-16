import { Component, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-castles-page',
  standalone: true,
  template: `
    <h1>Castles</h1>
    <p>Castle listing page — implementation coming soon.</p>
  `,
})
export class CastlesPageComponent implements OnInit {
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
