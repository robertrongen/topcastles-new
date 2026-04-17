import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ViewMode = 'list' | 'grid';

const STORAGE_KEY = 'castle-view-mode';

@Injectable({ providedIn: 'root' })
export class ViewModeService {
  private platformId = inject(PLATFORM_ID);

  private _mode = signal<ViewMode>('list');
  readonly mode = this._mode.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'list' || stored === 'grid') {
        this._mode.set(stored);
      }
    }
  }

  setMode(mode: ViewMode): void {
    this._mode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }
}
