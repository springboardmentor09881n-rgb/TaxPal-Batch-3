import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ValidateTokenResponse } from './models/auth.model';
import { AuthResponse, LoginRequest, RegisterRequest, User } from './models/user.model';

const API_URL = 'http://localhost:3000/api/auth';
const TOKEN_KEY = 'taxpal_token';
const USER_KEY = 'taxpal_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isSessionChecked = signal(false);

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      this.clearSession();
      this.isSessionChecked.set(true);
      return of(false);
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      this.isSessionChecked.set(true);
      return of(false);
    }

    return this.http.get<ValidateTokenResponse>(`${API_URL}/validate`).pipe(
      map((response) => {
        if (!response.valid || !response.user) {
          this.clearSession();
          return false;
        }

        this.currentUser.set(response.user as User);
        this.isAuthenticated.set(true);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        return true;
      }),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
      tap(() => this.isSessionChecked.set(true))
    );
  }

  logout(): void {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token) && this.isAuthenticated();
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) {
        return true;
      }

      const expiryMs = payload.exp * 1000;
      return Date.now() >= expiryMs;
    } catch {
      return true;
    }
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    this.isSessionChecked.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private decodeToken(token: string): { exp?: number } | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded) as { exp?: number };
  }
}
