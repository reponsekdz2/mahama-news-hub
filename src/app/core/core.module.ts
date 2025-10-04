
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    ApiService,
    ThemeService,
    NotificationService,
    AuthGuard
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
