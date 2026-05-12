import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>((localStorage.getItem('cms_theme') as AppTheme) ?? 'light');

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.applyTheme(next);
  }

  private applyTheme(theme: AppTheme): void {
    localStorage.setItem('cms_theme', theme);
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  }
}
