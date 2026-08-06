import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
  TaxCalculationData,
  TaxCalculationResult,
  TaxEstimate,
  TaxService
} from '../../services/tax';

@Component({
  selector: 'app-tax-calculator',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './tax-calculator.html',
  styleUrl: './tax-calculator.css'
})
export class TaxCalculator implements OnInit, OnDestroy {
  calculationResult: TaxCalculationResult | null = null;
  taxEstimates: TaxEstimate[] = [];

  readonly countries = [
    'India',
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'Singapore',
    'UAE',
    'France',
    'Japan'
  ];

  readonly regionsByCountry: Record<string, string[]> = {
    India: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
      'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ],
    'United States': ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Washington', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina'],
    Canada: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Nova Scotia', 'Manitoba', 'Saskatchewan'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
    Germany: ['Bavaria', 'Berlin', 'Hesse', 'North Rhine-Westphalia', 'Saxony', 'Baden-Württemberg', 'Hamburg'],
    Singapore: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
    UAE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'],
    France: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Provence-Alpes-Côte d\'Azur'],
    Japan: ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi', 'Hokkaido', 'Fukuoka', 'Hyōgo']
  };

  readonly currencyByCountry: Record<string, string> = {
    India: '₹',
    'United States': '$',
    Canada: 'C$',
    'United Kingdom': '£',
    Australia: 'A$',
    Germany: '€',
    Singapore: 'S$',
    UAE: 'AED ',
    France: '€',
    Japan: '¥'
  };

  get currentCurrency(): string {
    return this.currencyByCountry[this.taxForm.get('country')?.value || 'United States'] || '$';
  }

  currentRegions: string[] = this.regionsByCountry['United States'];

  readonly filingStatuses = [
    'Single',
    'Married Filing Jointly',
    'Married Filing Separately',
    'Head of Household'
  ];

  readonly quarters = [
    'Q1 (Jan-Mar 2025)',
    'Q2 (Apr-Jun 2025)',
    'Q3 (Jul-Sep 2025)',
    'Q4 (Oct-Dec 2025)'
  ];

  isCalculating = false;
  isSaving = false;
  isLoadingHistory = false;

  errorMessage = '';
  successMessage = '';

  taxForm;
  private countrySubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private taxService: TaxService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.taxForm = this.formBuilder.nonNullable.group({
      country: ['United States', Validators.required],
      region: ['California'],
      filingStatus: ['Single', Validators.required],
      quarter: ['Q2 (Apr-Jun 2025)', Validators.required],
      annualGrossIncome: [0, [Validators.required, Validators.min(0)]],
      grossIncome: [0, [Validators.required, Validators.min(0)]],
      deductions: this.formBuilder.nonNullable.group({
        businessExpenses: [0, [Validators.min(0)]],
        retirementContributions: [0, [Validators.min(0)]],
        healthInsurance: [0, [Validators.min(0)]],
        homeOffice: [0, [Validators.min(0)]]
      })
    }, { validators: this.incomeValidator });
  }

  incomeValidator(control: AbstractControl): ValidationErrors | null {
    const annualGross = control.get('annualGrossIncome')?.value || 0;
    const quarterGross = control.get('grossIncome')?.value || 0;
    if (annualGross < quarterGross) {
      return { incomeMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadTaxEstimates();

    this.countrySubscription = this.taxForm.get('country')?.valueChanges.subscribe(country => {
      this.currentRegions = this.regionsByCountry[country] || [];
      this.taxForm.patchValue({
        region: this.currentRegions.length > 0 ? this.currentRegions[0] : ''
      });
    });
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }

  calculateTax(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.taxForm.invalid) {
      this.taxForm.markAllAsTouched();
      return;
    }

    this.isCalculating = true;
    this.calculationResult = null;

    const data: TaxCalculationData = this.taxForm.getRawValue();

    this.taxService.calculateTax(data).subscribe({
      next: response => {
        this.calculationResult = response;
        this.isCalculating = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isCalculating = false;
        this.errorMessage = error.error?.message || 'Unable to calculate tax.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  saveEstimate(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.taxForm.invalid || !this.calculationResult) {
      return;
    }

    this.isSaving = true;

    const data: TaxCalculationData = this.taxForm.getRawValue();

    this.taxService.saveTaxEstimate(data).subscribe({
      next: response => {
        this.isSaving = false;
        this.successMessage = response.message;
        this.taxEstimates = [response.taxEstimate, ...this.taxEstimates];
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Unable to save tax estimate.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadTaxEstimates(): void {
    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.taxService.getTaxEstimates().subscribe({
      next: response => {
        this.taxEstimates = response.taxEstimates;
        this.isLoadingHistory = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingHistory = false;
        this.errorMessage = error.error?.message || 'Unable to load saved tax estimates.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  deleteEstimate(estimate: TaxEstimate): void {
    const confirmed = window.confirm('Delete this saved tax estimate?');
    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.taxService.deleteTaxEstimate(estimate._id).subscribe({
      next: response => {
        this.taxEstimates = this.taxEstimates.filter(item => item._id !== estimate._id);
        this.successMessage = response.message;
        this.changeDetectorRef.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message || 'Unable to delete tax estimate.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  trackEstimate(index: number, estimate: TaxEstimate): string {
    return estimate._id;
  }

  trackSlab(index: number, slab: { label: string }): string {
    return slab.label;
  }

  getMonthName(monthNum: number): string {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  }
}