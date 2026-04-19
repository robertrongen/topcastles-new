import { Injectable, signal } from '@angular/core';

export type ViewMode = 'list' | 'grid' | 'map';

@Injectable({ providedIn: 'root' })
export class ViewModeService {
  private _mode = signal<ViewMode>('grid');
  readonly mode = this._mode.asReadonly();

  setMode(mode: ViewMode): void {
    this._mode.set(mode);
  }
}
