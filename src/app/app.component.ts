
import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private translate: TranslateService
    ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit() {
    this.themeService.initializeTheme();
  }
}
