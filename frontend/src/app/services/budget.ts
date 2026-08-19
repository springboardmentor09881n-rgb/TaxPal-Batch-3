import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Auth } from './auth';

export interface Budget {
  _id: string;
  user: string;
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBudgetData {
  id?: string;
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
}

interface BudgetListResponse {
  count: number;
  budgets: Budget[];
}

interface SaveBudgetResponse {
  message: string;
  budget: Budget;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly API_URL =
    'http://localhost:5000/api/budgets';

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getBudgets(
    month?: number,
    year?: number
  ): Observable<BudgetListResponse> {
    let params = new HttpParams();

    if (month !== undefined) {
      params = params.set('month', month.toString());
    }

    if (year !== undefined) {
      params = params.set('year', year.toString());
    }

    return this.http.get<BudgetListResponse>(
      this.API_URL,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  saveBudget(
    data: SaveBudgetData
  ): Observable<SaveBudgetResponse> {
    return this.http.post<SaveBudgetResponse>(
      this.API_URL,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteBudget(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}