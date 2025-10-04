
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light-theme' | 'dark-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: Theme = 'light-theme';
  private theme$ = new BehaviorSubject<Theme>(this.currentTheme);
  
  isDarkTheme$ = new BehaviorSubject<boolean>(false);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializeTheme() {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      this.setTheme(storedTheme);
    } else {
      // Default to light theme
      this.setTheme('light-theme');
    }
  }

  setTheme(theme: Theme) {
    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    this.renderer.removeClass(document.body, previousTheme);
    this.renderer.addClass(document.body, theme);
    
    localStorage.setItem('theme', theme);
    this.theme$.next(theme);
    this.isDarkTheme$.next(theme === 'dark-theme');
  }
  
  toggleTheme() {
    this.currentTheme === 'light-theme' ? this.setTheme('dark-theme') : this.setTheme('light-theme');
  }
}
