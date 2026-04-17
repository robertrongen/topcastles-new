import { Component, inject } from '@angular/core';
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

  setView(mode: ViewMode): void {
    this.viewModeService.setMode(mode);
  }
}
