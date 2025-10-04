
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

// Mock User interface, replace with actual Fineract user model
export interface User {
  username: string;
  base64EncodedAuthenticationKey: string;
  authenticated: boolean;
  staffId: number;
  officeName: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    const user = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(user ? JSON.parse(user) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.post<User>('/authentication', { username, password })
      .pipe(
        tap(user => {
          if (user && user.base64EncodedAuthenticationKey) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return user;
        }),
        catchError(err => {
            // Handle login errors
            console.error('Login failed', err);
            return of(null);
        })
      );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
