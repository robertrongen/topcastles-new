import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoCastleService } from '../../services/no-castle.service';

@Component({
  selector: 'app-no-castles-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './no-castles-page.component.html',
  styleUrl: './no-castles-page.component.scss',
})
export class NoCastlesPageComponent implements OnInit {
  private noCastleService = inject(NoCastleService);

  noCastles = computed(() => this.noCastleService.getAll());
  loading = this.noCastleService.loading;

  ngOnInit(): void {
    this.noCastleService.loadNoCastles();
  }
}