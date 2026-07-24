import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  errorMessage = '';
  isSubmitting = false;

  loginForm;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isSubmitting = true;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dashboard']);
      },

      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;

        this.errorMessage =
          error.error?.message ||
          'Login failed. Please try again.';
      }
    });
  }
}