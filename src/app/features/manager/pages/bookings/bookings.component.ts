import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, Booking } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-manager-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class ManagerBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;

  showDetailsModal = false;
  showCheckInModal = false;
  showCheckOutModal = false;
  showCancelModal = false;
  selectedBooking: Booking | null = null;

  searchBookingId: number | null = null;
  searchStatus = '';

  checkInNotes = '';
  checkOutNotes = '';
  checkOutRating: number | null = null;
  checkOutFeedback = '';
  checkOutLate = false;
  cancelReason = '';

  statuses = ['CREATED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      this.isLoading = false;
      return;
    }

    this.managerService.getHotelBookings(user.hotelId).subscribe({
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
      const idMatch = !this.searchBookingId || booking.id === this.searchBookingId;
      const statusMatch = !this.searchStatus || booking.status === this.searchStatus;
      return idMatch && statusMatch;
    });
  }

  onReset() {
    this.searchBookingId = null;
    this.searchStatus = '';
    this.filteredBookings = [...this.bookings];
  }

  openDetailsModal(booking: Booking) {
    this.selectedBooking = booking;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBooking = null;
  }

  openCheckInModal(booking: Booking) {
    this.selectedBooking = booking;
    this.checkInNotes = '';
    this.showCheckInModal = true;
  }

  closeCheckInModal() {
    this.showCheckInModal = false;
    this.selectedBooking = null;
    this.checkInNotes = '';
  }

  onCheckIn() {
    if (!this.selectedBooking) return;

    const request = this.checkInNotes.trim() ? { notes: this.checkInNotes } : {};
    this.managerService.checkIn(this.selectedBooking.id, request).subscribe({
      next: () => {
        this.closeCheckInModal();
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error checking in:', error);
        alert('Error checking in guest');
      }
    });
  }

  openCheckOutModal(booking: Booking) {
    this.selectedBooking = booking;
    this.checkOutNotes = '';
    this.checkOutRating = null;
    this.checkOutFeedback = '';
    this.checkOutLate = false;
    this.showCheckOutModal = true;
  }

  closeCheckOutModal() {
    this.showCheckOutModal = false;
    this.selectedBooking = null;
    this.checkOutNotes = '';
    this.checkOutRating = null;
    this.checkOutFeedback = '';
    this.checkOutLate = false;
  }

  onCheckOut() {
    if (!this.selectedBooking) return;

    const request: any = {};
    if (this.checkOutNotes.trim()) request.notes = this.checkOutNotes;
    if (this.checkOutRating) request.rating = this.checkOutRating;
    if (this.checkOutFeedback.trim()) request.feedback = this.checkOutFeedback;
    if (this.checkOutLate) request.lateCheckOut = true;

    this.managerService.checkOut(this.selectedBooking.id, request).subscribe({
      next: () => {
        this.closeCheckOutModal();
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error checking out:', error);
        alert('Error checking out guest');
      }
    });
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

  onCancelBooking() {
    if (!this.selectedBooking || !this.cancelReason.trim()) return;

    this.managerService.cancelBooking(this.selectedBooking.id, this.cancelReason).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error canceling booking:', error);
        alert('Error canceling booking');
      }
    });
  }

  onConfirmBooking(booking: Booking) {
    this.managerService.confirmBooking(booking.id).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error confirming booking:', error);
        alert('Error confirming booking');
      }
    });
  }

  canCheckIn(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  canCheckOut(booking: Booking): boolean {
    return booking.status === 'CHECKED_IN';
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'CREATED' || booking.status === 'CONFIRMED';
  }

  canConfirm(booking: Booking): boolean {
    return booking.status === 'CREATED';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  logout() {
    this.authService.logout();
  }
}

