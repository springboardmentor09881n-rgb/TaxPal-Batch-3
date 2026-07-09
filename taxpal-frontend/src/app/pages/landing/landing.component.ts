import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BrandComponent } from '../../shared/brand/brand.component';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, BrandComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly trustBadges = [
    { label: 'Freelancers', rating: '4.9', icon: 'users' },
    { label: 'Tax Accuracy', rating: '4.8', icon: 'chart' },
    { label: 'Data Security', rating: '4.9', icon: 'shield' },
    { label: 'Export Ready', rating: '5.0', icon: 'file' },
  ];

  readonly features = [
    {
      icon: '💰',
      title: 'Income & Expense Tracking',
      description: 'Log freelance income and business expenses with smart category suggestions.',
    },
    {
      icon: '📊',
      title: 'Budgeting & Categories',
      description: 'Set monthly limits per category and watch visual spending progress in real time.',
    },
    {
      icon: '🧾',
      title: 'Tax Estimation',
      description: 'Automatic regional tax estimates based on your country and income bracket.',
    },
    {
      icon: '📁',
      title: 'Reports & Export',
      description: 'Generate monthly and quarterly summaries and download CSV for tax filing.',
    },
  ];

  readonly steps = [
    { title: 'Create your account', desc: 'Sign up with your country and income bracket in under a minute.' },
    { title: 'Log transactions', desc: 'Add income and expenses — categories are suggested automatically.' },
    { title: 'Set budgets', desc: 'Define monthly limits and track spending with progress bars.' },
    { title: 'Estimate & export', desc: 'View tax estimates, quarterly due dates, and download reports.' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
