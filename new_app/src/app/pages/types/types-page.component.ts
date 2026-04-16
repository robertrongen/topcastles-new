import { Component, inject, OnInit } from '@angular/core';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-types-page',
  standalone: true,
  template: `
    <h1>Castle Types</h1>
    <p>Castle types page — implementation coming soon.</p>
  `,
})
export class TypesPageComponent implements OnInit {
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
