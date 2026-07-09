import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import {
  Alert,
  DashboardData,
  ReportSummary,
  SavedReport,
  SuggestedCategory,
  TaxCalculation,
  TaxEstimateRecord,
  Transaction,
  TransactionPayload,
} from './models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);

  getDashboard(month?: string): Observable<DashboardData> {
    const params = month ? { month } : undefined;
    return this.http.get<DashboardData>(`${API_BASE_URL}/dashboard`, { params: params as Record<string, string> });
  }

  getCategories(): Observable<{ income: string[]; expense: string[] }> {
    return this.http.get<{ income: string[]; expense: string[] }>(`${API_BASE_URL}/transactions/categories`);
  }

  getManagedCategories(): Observable<{ income: string[]; expense: string[]; categories: SuggestedCategory[] }> {
    return this.http.get<{ income: string[]; expense: string[]; categories: SuggestedCategory[] }>(
      `${API_BASE_URL}/categories`
    );
  }

  addCategory(payload: { name: string; type: 'income' | 'expense'; description?: string }): Observable<{ message: string; category: SuggestedCategory }> {
    return this.http.post<{ message: string; category: SuggestedCategory }>(`${API_BASE_URL}/categories`, payload);
  }

  updateCategory(id: string, payload: { name?: string; description?: string }): Observable<{ message: string; category: SuggestedCategory }> {
    return this.http.put<{ message: string; category: SuggestedCategory }>(`${API_BASE_URL}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/categories/${id}`);
  }

  getAlerts(): Observable<{ alerts: Alert[]; unreadCount: number }> {
    return this.http.get<{ alerts: Alert[]; unreadCount: number }>(`${API_BASE_URL}/alerts`);
  }

  markAlertRead(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_BASE_URL}/alerts/${id}/read`, {});
  }

  markAllAlertsRead(): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_BASE_URL}/alerts/read-all`, {});
  }

  suggestCategory(description: string, type: string): Observable<{ category: string }> {
    return this.http.post<{ category: string }>(`${API_BASE_URL}/transactions/suggest-category`, { description, type });
  }

  getTransactions(type?: string, month?: string): Observable<{ transactions: Transaction[] }> {
    const params: Record<string, string> = {};
    if (type) params['type'] = type;
    if (month) params['month'] = month;
    return this.http.get<{ transactions: Transaction[] }>(`${API_BASE_URL}/transactions`, { params });
  }

  addTransaction(payload: TransactionPayload): Observable<{ transaction: Transaction; message: string }> {
    return this.http.post<{ transaction: Transaction; message: string }>(`${API_BASE_URL}/transactions`, payload);
  }

  updateTransaction(id: string, payload: Partial<TransactionPayload>): Observable<{ transaction: Transaction; message: string }> {
    return this.http.put<{ transaction: Transaction; message: string }>(`${API_BASE_URL}/transactions/${id}`, payload);
  }

  deleteTransaction(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/transactions/${id}`);
  }

  saveBudget(payload: { category: string; limit: number; month?: string }): Observable<{ budget: unknown; message: string }> {
    return this.http.post<{ budget: unknown; message: string }>(`${API_BASE_URL}/budgets`, payload);
  }

  deleteBudget(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/budgets/${id}`);
  }

  getTaxEstimate(): Observable<TaxCalculation> {
    return this.http.get<TaxCalculation>(`${API_BASE_URL}/tax/estimate`);
  }

  saveTaxEstimate(quarter?: string, fiscalYear?: number): Observable<{ message: string; estimate: TaxEstimateRecord }> {
    return this.http.post<{ message: string; estimate: TaxEstimateRecord }>(`${API_BASE_URL}/tax/estimates`, {
      quarter,
      fiscalYear,
    });
  }

  deleteTaxEstimate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/tax/estimates/${id}`);
  }

  getReportSummary(period = 'monthly', month?: string): Observable<ReportSummary> {
    const params: Record<string, string> = { period };
    if (month) params['month'] = month;
    return this.http.get<ReportSummary>(`${API_BASE_URL}/reports/summary`, { params });
  }

  getReportHistory(): Observable<{ reports: SavedReport[] }> {
    return this.http.get<{ reports: SavedReport[] }>(`${API_BASE_URL}/reports/history`);
  }

  deleteReport(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/reports/${id}`);
  }

  downloadReport(period = 'monthly', month?: string, format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    const params: Record<string, string> = { period, format };
    if (month) params['month'] = month;
    return this.http.get(`${API_BASE_URL}/reports/export`, { params, responseType: 'blob' });
  }

  downloadCsv(period = 'monthly', month?: string): Observable<Blob> {
    return this.downloadReport(period, month, 'csv');
  }

  downloadPdf(period = 'monthly', month?: string): Observable<Blob> {
    return this.downloadReport(period, month, 'pdf');
  }
}
