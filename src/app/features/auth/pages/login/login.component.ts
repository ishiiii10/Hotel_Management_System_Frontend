import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          // Only navigate on successful login
          if (response && response.token && response.role) {
            const role = response.role;
            if (role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else if (role === 'MANAGER') {
              this.router.navigate(['/manager/dashboard']);
            } else if (role === 'RECEPTIONIST') {
              this.router.navigate(['/receptionist/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            // Invalid response format - treat as error
            this.errorMessage = 'Invalid response from server. Please try again.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          
          // Stop loading and show error - DO NOT navigate
          this.isLoading = false;
          
          // Handle different error types
          if (error.status === 0 || error.status === undefined) {
            this.errorMessage = 'Unable to connect to server. Please check if the backend is running.';
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.status === 400) {
            if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else if (error.error?.errors && Array.isArray(error.error.errors)) {
              this.errorMessage = error.error.errors.join(', ');
            } else {
              this.errorMessage = 'Invalid request. Please check your input.';
            }
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.errorMessage = error.error.errors.join(', ');
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Login failed. Please check your credentials and try again.';
          }
          
          // Clear password field for security
          this.loginForm.patchValue({ password: '' });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      // Show validation errors
      if (this.loginForm.get('email')?.invalid) {
        this.errorMessage = 'Please enter a valid email address.';
      } else if (this.loginForm.get('password')?.invalid) {
        this.errorMessage = 'Please enter your password.';
      }
    }
  }
}
