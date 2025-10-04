
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { LoanPortfolioChartComponent } from './components/loan-portfolio-chart/loan-portfolio-chart.component';
import { SavingsTrendsChartComponent } from './components/savings-trends-chart/savings-trends-chart.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';


@NgModule({
  declarations: [
    DashboardComponent,
    KpiCardComponent,
    LoanPortfolioChartComponent,
    SavingsTrendsChartComponent,
    RecentTransactionsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
