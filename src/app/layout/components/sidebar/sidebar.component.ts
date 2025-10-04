
import { Component, OnInit } from '@angular/core';

export interface NavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  navItems: NavItem[] = [
    { label: 'NAV.DASHBOARD', icon: 'dashboard', link: '/dashboard' },
    { label: 'NAV.CLIENTS', icon: 'people', link: '/clients' },
    { label: 'NAV.GROUPS', icon: 'groups', link: '/groups' },
    { label: 'NAV.LOANS', icon: 'monetization_on', link: '/loans' },
    { label: 'NAV.SAVINGS', icon: 'savings', link: '/savings' },
    { label: 'NAV.REPORTS', icon: 'assessment', link: '/reports' },
    { label: 'NAV.ACCOUNTING', icon: 'account_balance', link: '/accounting' },
    { label: 'NAV.SETTINGS', icon: 'settings', link: '/settings' },
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
