import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taxpal_theme';
  private isDarkSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;

  constructor() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;
    const initialDark = savedTheme ? savedTheme === 'dark' : false;
    
    this.isDarkSubject = new BehaviorSubject<boolean>(initialDark);
    this.isDarkMode$ = this.isDarkSubject.asObservable();

    this.applyTheme(initialDark);
  }

  get isDarkMode(): boolean {
    return this.isDarkSubject.value;
  }

  toggleTheme(): void {
    const newThemeIsDark = !this.isDarkSubject.value;
    this.setDarkMode(newThemeIsDark);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkSubject.next(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }
}
