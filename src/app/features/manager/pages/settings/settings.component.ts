import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { AuthService, UserResponse } from '../../../auth/services/auth.service';
import { ManagerSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ManagerSidebarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class ManagerSettingsComponent implements OnInit {
  userProfile: UserResponse | null = null;
  isLoading = false;
  showChangePasswordModal = false;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.authService.getCurrentUserProfile().subscribe({
      next: (user: UserResponse) => {
        this.userProfile = user;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  onChangePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New password and confirm password do not match';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
    if (!strongPasswordRegex.test(this.newPassword)) {
      this.passwordError = 'Password must contain uppercase, lowercase, digit and special character';
      return;
    }

    this.isLoading = true;
    this.managerService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully';
        this.isLoading = false;
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 1500);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        if (error.error && error.error.message) {
          this.passwordError = error.error.message;
        } else {
          this.passwordError = 'Failed to change password. Please check your current password.';
        }
        this.isLoading = false;
      }
    });
  }

}

