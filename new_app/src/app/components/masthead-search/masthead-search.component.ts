import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { Castle } from '../../models/castle.model';
import { CastleService } from '../../services/castle.service';

@Component({
  selector: 'app-masthead-search',
  standalone: true,
  imports: [MatAutocompleteModule, FormsModule],
  templateUrl: './masthead-search.component.html',
  styleUrl: './masthead-search.component.scss',
})
export class MastheadSearchComponent {
  searchQuery = signal('');
  private router = inject(Router);
  private castleService = inject(CastleService);

  mastheadSuggestions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.castleService.castles()
      .filter(c => c.castle_name?.toLowerCase().includes(q))
      .slice(0, 8);
  });

  displayCastle(castle: Castle | null): string {
    return castle?.castle_name ?? '';
  }

  onMastheadSelect(castle: Castle): void {
    this.searchQuery.set('');
    this.router.navigate(['/castles', castle.castle_code]);
  }

  goToIndex(query: string): void {
    const params = query.trim() ? { name: query.trim() } : {};
    this.router.navigate(['/top1000'], { queryParams: params });
  }
}
