import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NoCastleService } from '../../services/no-castle.service';
import { ImageService } from '../../services/image.service';
import { NoCastle } from '../../models/castle.model';

@Component({
  selector: 'app-nocastle-detail-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './nocastle-detail-page.component.html',
  styleUrl: './nocastle-detail-page.component.scss',
})
export class NoCastleDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private noCastleService = inject(NoCastleService);
  private imageService = inject(ImageService);

  code = signal('');
  loading = this.noCastleService.loading;

  noCastle = computed<NoCastle | undefined>(() =>
    this.noCastleService.getByCode(this.code())
  );

  /** Candidate image URLs: {code}.jpg, {code}2.jpg … {code}5.jpg */
  imageUrls = computed(() => {
    const c = this.code();
    if (!c) return [];
    return Array.from({ length: 5 }, (_, i) =>
      this.imageService.castlePhotoUrl(c, i)
    );
  });

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  ngOnInit(): void {
    this.noCastleService.loadNoCastles();
    this.route.params.subscribe((params) => {
      this.code.set(params['code'] ?? '');
    });
  }
}
