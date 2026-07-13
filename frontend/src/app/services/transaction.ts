import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Auth } from './auth';

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionListResponse {
  count: number;
  transactions: Transaction[];
}

interface CreateTransactionResponse {
  message: string;
  transaction: Transaction;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = 'http://localhost:5000/api/transactions';

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

  getTransactions(): Observable<TransactionListResponse> {
    return this.http.get<TransactionListResponse>(
      this.API_URL,
      {
        headers: this.getHeaders()
      }
    );
  }

  createTransaction(
    data: CreateTransactionData
  ): Observable<CreateTransactionResponse> {
    return this.http.post<CreateTransactionResponse>(
      this.API_URL,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteTransaction(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
