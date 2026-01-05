import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserResponse, ChangePasswordRequest } from '../../services/auth.service';
import { BookingService, Booking } from '../../../../shared/services/booking.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  activeTab: 'profile' | 'bookings' | 'password' = 'profile';
  user: UserResponse | null = null;
  isLoading = false;
  isLoadingBookings = false;
  bookings: Booking[] = [];
  bookingTab: 'all' | 'upcoming' | 'past' | 'cancelled' = 'all';

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.loadBookings();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.authService.getCurrentUserProfile().subscribe({
      next: (user: UserResponse) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadBookings() {
    this.isLoadingBookings = true;
    this.bookingService.getMyBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.isLoadingBookings = false;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.isLoadingBookings = false;
      }
    });
  }

  setTab(tab: 'profile' | 'bookings' | 'password') {
    this.activeTab = tab;
    this.passwordError = '';
    this.passwordSuccess = '';
    if (tab === 'bookings') {
      this.loadBookings();
    }
  }

  setBookingTab(tab: 'all' | 'upcoming' | 'past' | 'cancelled') {
    this.bookingTab = tab;
  }

  getFilteredBookings(): Booking[] {
    const now = new Date();
    switch (this.bookingTab) {
      case 'upcoming':
        return this.bookings.filter(b => {
          const checkIn = new Date(b.checkInDate);
          return checkIn > now && b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT';
        });
      case 'past':
        return this.bookings.filter(b => {
          const checkOut = new Date(b.checkOutDate);
          return checkOut < now || b.status === 'CHECKED_OUT';
        });
      case 'cancelled':
        return this.bookings.filter(b => b.status === 'CANCELLED');
      default:
        return this.bookings;
    }
  }

  onChangePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.passwordError = 'All fields are required';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New password and confirm password do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
    if (!passwordRegex.test(this.passwordForm.newPassword)) {
      this.passwordError = 'Password must contain uppercase, lowercase, digit and special character';
      return;
    }

    this.isChangingPassword = true;
    const request: ChangePasswordRequest = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    };

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setTimeout(() => {
          this.passwordSuccess = '';
        }, 3000);
      },
      error: (error: any) => {
        this.isChangingPassword = false;
        this.passwordError = error?.error?.message || error?.message || 'Failed to change password. Please check your current password.';
      }
    });
  }

  cancelBooking(booking: Booking) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:') || 'No reason provided';
    
    this.bookingService.cancelBooking(booking.id, reason).subscribe({
      next: () => {
        alert('Booking cancelled successfully');
        this.loadBookings();
      },
      error: (error: any) => {
        console.error('Error cancelling booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to cancel booking';
        alert(errorMessage);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmed') || statusLower.includes('created')) return 'status-confirmed';
    if (statusLower.includes('checked_in')) return 'status-checked-in';
    if (statusLower.includes('checked_out')) return 'status-completed';
    if (statusLower.includes('cancelled')) return 'status-cancelled';
    return 'status-default';
  }

  logout() {
    this.authService.logout();
  }
}

