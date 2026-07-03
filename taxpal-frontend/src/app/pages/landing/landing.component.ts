import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly features = [
    {
      icon: '💰',
      title: 'Income & Expense Tracking',
      description: 'Log freelance income and business expenses in one place with manual entry forms.',
    },
    {
      icon: '📊',
      title: 'Budgeting & Categories',
      description: 'Categorize transactions and set monthly limits with visual spending progress.',
    },
    {
      icon: '🧾',
      title: 'Tax Estimation',
      description: 'Get regional tax estimates automatically based on your country and income bracket.',
    },
    {
      icon: '📁',
      title: 'Reports & Export',
      description: 'Download monthly and quarterly financial summaries for tax filing.',
    },
  ];

  readonly steps = [
    'Create your free account',
    'Log income and expenses',
    'Set budgets and categories',
    'Estimate taxes and export reports',
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
