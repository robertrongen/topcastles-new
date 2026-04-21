import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'tk-theme';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  isDark = signal(false);

  constructor() {
    if (!this.isBrowser) return;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    this.isDark.set(dark);
    this.apply(dark);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.isDark.set(e.matches);
        this.apply(e.matches);
      }
    });
  }

  toggle(): void {
    if (!this.isBrowser) return;
    const dark = !this.isDark();
    this.isDark.set(dark);
    localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    this.apply(dark);
  }

  private apply(dark: boolean): void {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
