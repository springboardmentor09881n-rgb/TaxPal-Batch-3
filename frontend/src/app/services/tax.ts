import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Auth } from './auth';

export interface SlabBreakdown {
  _id?: string;
  label: string;
  taxableAmount: number;
  rate: number;
  taxAmount: number;
}

export interface AdvanceTaxDueDate {
  month: number;
  day: number;
  label: string;
  cumulativePercentage?: number;
  percentage?: number;
}

export interface TaxDeductions {
  businessExpenses: number;
  retirementContributions: number;
  healthInsurance: number;
  homeOffice: number;
}

export interface TaxCalculationData {
  country: string;
  region: string;
  filingStatus: string;
  quarter: string;
  annualGrossIncome: number;
  grossIncome: number;
  deductions: TaxDeductions;
  taxYear?: string;
  taxRegime?: string;
}

export interface TaxCalculationResult {
  country: string;
  region: string;
  taxYear: string;
  taxRegime: string;
  filingStatus: string;
  quarter: string;
  taxRegimeLabel: string;
  annualGrossIncome: number;
  grossIncome: number;
  deductions: TaxDeductions;
  taxableIncome: number;
  estimatedAnnualTax: number;
  estimatedQuarterlyTax: number;
  estimatedTax: number;
  effectiveTaxRate: number;
  slabBreakdown: SlabBreakdown[];
  advanceTaxDueDates?: AdvanceTaxDueDate[];
}

export interface TaxEstimate {
  _id: string;
  user: string;
  country: string;
  region: string;
  taxYear: string;
  taxRegime: string;
  filingStatus: string;
  quarter: string;
  annualGrossIncome: number;
  grossIncome: number;
  deductions: TaxDeductions;
  taxableIncome: number;
  estimatedAnnualTax: number;
  estimatedQuarterlyTax: number;
  estimatedTax: number;
  effectiveTaxRate: number;
  slabBreakdown: SlabBreakdown[];
  createdAt: string;
  updatedAt: string;
}

interface SaveTaxEstimateResponse {
  message: string;
  taxEstimate: TaxEstimate;
}

interface TaxEstimateListResponse {
  count: number;
  taxEstimates: TaxEstimate[];
}

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private readonly API_URL =
    'http://localhost:5000/api/tax';

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

  calculateTax(
    data: TaxCalculationData
  ): Observable<TaxCalculationResult> {
    return this.http.post<TaxCalculationResult>(
      `${this.API_URL}/calculate`,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  saveTaxEstimate(
    data: TaxCalculationData
  ): Observable<SaveTaxEstimateResponse> {
    return this.http.post<SaveTaxEstimateResponse>(
      `${this.API_URL}/estimates`,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  getTaxEstimates():
    Observable<TaxEstimateListResponse> {
    return this.http.get<TaxEstimateListResponse>(
      `${this.API_URL}/estimates`,
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteTaxEstimate(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/estimates/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}