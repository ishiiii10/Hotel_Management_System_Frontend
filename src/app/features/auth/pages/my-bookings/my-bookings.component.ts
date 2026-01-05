import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../../../shared/services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  isAuthenticated = false;
  activeTab = 'all';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.isLoading = false;
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  getFilteredBookings(): Booking[] {
    const now = new Date();
    switch (this.activeTab) {
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
    if (statusLower.includes('confirmed')) return 'status-confirmed';
    if (statusLower.includes('checked_in')) return 'status-checked-in';
    if (statusLower.includes('checked_out')) return 'status-completed';
    if (statusLower.includes('cancelled')) return 'status-cancelled';
    return 'status-default';
  }
}

