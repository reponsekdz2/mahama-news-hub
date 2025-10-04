
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Mock Client Data - Replace with ClientService and API call
export interface Client {
  id: number;
  displayName: string;
  accountNo: string;
  status: { value: string };
  officeName: string;
  loanOfficerName: string;
  externalId: string;
}

const MOCK_CLIENTS: Client[] = [
  {id: 1, displayName: 'John Doe', accountNo: '000000001', status: {value: 'Active'}, officeName: 'Head Office', loanOfficerName: 'Jane Smith', externalId: 'E12345'},
  {id: 2, displayName: 'Alice Williams', accountNo: '000000002', status: {value: 'Pending'}, officeName: 'Branch A', loanOfficerName: 'Jane Smith', externalId: 'E12346'},
  {id: 3, displayName: 'Michael Brown', accountNo: '000000003', status: {value: 'Active'}, officeName: 'Head Office', loanOfficerName: 'Peter Jones', externalId: 'E12347'},
  {id: 4, displayName: 'Emily Davis', accountNo: '000000004', status: {value: 'Closed'}, officeName: 'Branch B', loanOfficerName: 'Susan Clark', externalId: 'E12348'},
  {id: 5, displayName: 'David Miller', accountNo: '000000005', status: {value: 'Active'}, officeName: 'Branch A', loanOfficerName: 'Jane Smith', externalId: 'E12349'},
];

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['displayName', 'accountNo', 'status', 'officeName', 'loanOfficerName', 'externalId', 'actions'];
  dataSource: MatTableDataSource<Client>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(MOCK_CLIENTS);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
