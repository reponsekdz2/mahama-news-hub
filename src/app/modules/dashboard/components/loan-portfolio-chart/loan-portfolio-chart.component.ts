
import { Component } from '@angular/core';

@Component({
  selector: 'app-loan-portfolio-chart',
  templateUrl: './loan-portfolio-chart.component.html',
  styleUrls: ['./loan-portfolio-chart.component.scss']
})
export class LoanPortfolioChartComponent {
  // Sample Data - replace with API call
  chartData = [
    { name: 'Business Loans', value: 450000 },
    { name: 'Agricultural Loans', value: 320000 },
    { name: 'Personal Loans', value: 180000 },
    { name: 'Group Loans', value: 250000 }
  ];

  // Chart options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  colorScheme = 'vivid';
  
  constructor() { }
}
