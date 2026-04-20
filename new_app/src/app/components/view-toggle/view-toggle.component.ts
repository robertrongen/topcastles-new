import { Component, inject, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ViewModeService, ViewMode } from '../../services/view-mode.service';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule],
  templateUrl: './view-toggle.component.html',
  styleUrl: './view-toggle.component.scss',
})
export class ViewToggleComponent {
  protected viewModeService = inject(ViewModeService);
  /** When true, hides the map toggle (use when the host page has its own map panel). */
  hideMap = input(false);

  setView(mode: ViewMode): void {
    this.viewModeService.setMode(mode);
  }
}
