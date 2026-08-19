import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  country: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'taxpal_token';
  private readonly CURRENT_USER_KEY = 'taxpal_current_user';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const savedUser = this.getCurrentUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getCurrentUserFromStorage(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  register(user: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.API_URL}/register`,
      user
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, {
        email,
        password
      })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);

          localStorage.setItem(
            this.CURRENT_USER_KEY,
            JSON.stringify(response.user)
          );
          this.currentUserSubject.next(response.user);
        })
      );
  }

  getProfile(): Observable<{ user: User }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() || ''}`
    });
    return this.http.get<{ user: User }>(`${this.API_URL}/profile`, { headers }).pipe(
      tap(res => {
        if (res.user) {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updateProfile(data: { name: string; country?: string; phoneNumber?: string; address?: string; avatar?: string }): Observable<{ message: string; user: User }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() || ''}`
    });
    return this.http.put<{ message: string; user: User }>(`${this.API_URL}/profile`, data, { headers }).pipe(
      tap(res => {
        if (res.user) {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() || ''}`
    });
    return this.http.put<{ message: string }>(`${this.API_URL}/change-password`, data, { headers });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.TOKEN_KEY) !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject?.value || this.getCurrentUserFromStorage();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}