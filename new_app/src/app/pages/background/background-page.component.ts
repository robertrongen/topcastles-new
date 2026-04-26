import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-background-page',
  standalone: true,
  imports: [MatTabsModule, RouterLink],
  templateUrl: './background-page.component.html',
  styleUrl: './background-page.component.scss',
})
export class BackgroundPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  readonly tabs = [
    { key: 'main', label: 'Definition' },
    { key: 'scores', label: 'Scores' },
    { key: 'referenties', label: 'Resources' },
    { key: 'soorten', label: 'Castle types' },
    { key: 'websites', label: 'Websites' },
    { key: 'boeken', label: 'Books' },
    { key: 'bijdragen', label: 'Photographers' },
  ];

  selectedIndex = signal(0);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const sub = params['sub'];
      if (sub) {
        const idx = this.tabs.findIndex((t) => t.key === sub);
        if (idx >= 0) this.selectedIndex.set(idx);
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedIndex.set(index);
  }
}
