
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  username: string | undefined;

  // Mock data for charts and KPIs
  kpiData = {
    activeClients: { value: 1254, trend: 2.5 },
    activeLoans: { value: 1502, trend: -1.2 },
    totalSavings: { value: 3.2, unit: 'M', trend: 5.1 },
    portfolioAtRisk: { value: 3.8, trend: 0.5 },
  };

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.username = this.authService.currentUserValue?.username;
  }
}
