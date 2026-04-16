import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-castle-detail-page',
  standalone: true,
  template: `
    <h1>Castle Detail</h1>
    <p>Castle detail page — implementation coming soon.</p>
  `,
})
export class CastleDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private castleService = inject(CastleService);

  ngOnInit(): void {
    this.castleService.loadCastles();
  }
}
