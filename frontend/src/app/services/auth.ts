import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
}

export interface RegisterData {
  name: string;
  email: string;
  country: string;
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

  constructor(private http: HttpClient) {}

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
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.TOKEN_KEY) !== null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);

    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}