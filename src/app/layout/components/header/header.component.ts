
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService, User } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleDrawer = new EventEmitter<void>();
  user: User | null = null;
  isDarkTheme$ = this.themeService.isDarkTheme$;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => this.user = user);
  }

  onToggleDrawer() {
    this.toggleDrawer.emit();
  }

  toggleTheme(isDark: boolean) {
    this.themeService.setTheme(isDark ? 'dark-theme' : 'light-theme');
  }

  logout() {
    this.authService.logout();
  }
}
