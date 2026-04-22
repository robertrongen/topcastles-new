import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  castleImageUrl(fileName: string): string {
    return `/castle-images/${fileName}`;
  }

  castlePhotoUrl(code: string, index = 0): string {
    return this.castleImageUrl(`${code}${index === 0 ? '' : index + 1}.jpg`);
  }

  castleThumbnailUrl(code: string): string {
    return this.castleImageUrl(`small/${code}_small.jpg`);
  }
}
