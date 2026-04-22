import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './account-page.component.html',
})
export class AccountPageComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);

  token = this.userService.getToken();
  shareLink: string | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.shareLink = this.userService.getShareLink();
    }
  }

  async copyShareLink(): Promise<void> {
    if (!this.shareLink) return;
    await navigator.clipboard.writeText(this.shareLink);
    this.snackBar.open('Link copied to clipboard', '', { duration: 2500 });
  }
}
