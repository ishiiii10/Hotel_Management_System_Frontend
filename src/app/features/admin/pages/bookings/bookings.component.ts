import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, Booking } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;
  
  showCancelModal = false;
  showDetailsModal = false;
  selectedBooking: Booking | null = null;
  cancelReason = '';
  
  searchBookingId = '';
  searchStatus = '';
  searchHotelId = '';

  statuses = ['CREATED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.adminService.getAllBookings().subscribe({
      next: (response: any) => {
        this.bookings = response.data || response;
        this.filteredBookings = [...this.bookings];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.filteredBookings = this.bookings.filter(booking => {
      const idMatch = !this.searchBookingId || booking.id.toString().includes(this.searchBookingId);
      const statusMatch = !this.searchStatus || booking.status === this.searchStatus;
      const hotelMatch = !this.searchHotelId || booking.hotelId.toString().includes(this.searchHotelId);
      return idMatch && statusMatch && hotelMatch;
    });
  }

  onReset() {
    this.searchBookingId = '';
    this.searchStatus = '';
    this.searchHotelId = '';
    this.filteredBookings = [...this.bookings];
  }

  openCancelModal(booking: Booking) {
    this.selectedBooking = booking;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedBooking = null;
    this.cancelReason = '';
  }

  openDetailsModal(booking: Booking) {
    this.selectedBooking = booking;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBooking = null;
  }

  onCancelBooking() {
    if (!this.selectedBooking || !this.cancelReason.trim()) return;
    
    this.adminService.cancelBooking(this.selectedBooking.id, this.cancelReason).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
      }
    });
  }

  canCancel(booking: Booking): boolean {
    return booking.status !== 'CHECKED_IN' && booking.status !== 'CHECKED_OUT' && booking.status !== 'CANCELLED';
  }

  logout() {
    this.authService.logout();
  }
}

