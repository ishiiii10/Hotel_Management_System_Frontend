import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, Booking } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ManagerSidebarComponent } from '../../sidebar/sidebar.component';
import { BillingService, BillResponse, MarkBillPaidRequest } from '../../../../shared/services/billing.service';

@Component({
  selector: 'app-manager-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ManagerSidebarComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class ManagerBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;

  showDetailsModal = false;
  showCheckOutModal = false;
  showCancelModal = false;
  showBillModal = false;
  selectedBooking: Booking | null = null;

  searchBookingId: number | null = null;
  searchStatus = '';

  checkOutNotes = '';
  checkOutRating: number | null = null;
  checkOutFeedback = '';
  checkOutLate = false;
  cancelReason = '';

  bill: BillResponse | null = null;
  isLoadingBill = false;
  paymentForm: MarkBillPaidRequest = {
    paymentMethod: '',
    transactionId: '',
    paymentReference: '',
    notes: ''
  };

  statuses = ['CREATED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private billingService: BillingService,
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

  canCheckOut(booking: Booking): boolean {
    return booking.status === 'CHECKED_IN';
  }

  canCancel(booking: Booking): boolean {
    return booking.status === 'CREATED' || booking.status === 'CONFIRMED';
  }

  canConfirm(booking: Booking): boolean {
    return booking.status === 'CREATED';
  }

  hasBill(booking: Booking): boolean {
    // Check if booking has a bill (for bookings with status CREATED, CONFIRMED, CHECKED_IN, or CHECKED_OUT)
    return booking.status === 'CREATED' || booking.status === 'CONFIRMED' || 
           booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT';
  }

  openBillModal(bookingId: number) {
    this.showBillModal = true;
    this.loadBill(bookingId);
  }

  closeBillModal() {
    this.showBillModal = false;
    this.bill = null;
    this.paymentForm = {
      paymentMethod: '',
      transactionId: '',
      paymentReference: '',
      notes: ''
    };
  }

  loadBill(bookingId: number) {
    this.isLoadingBill = true;
    this.billingService.getBillByBookingId(bookingId).subscribe({
      next: (bill) => {
        this.bill = bill;
        this.isLoadingBill = false;
      },
      error: (error: any) => {
        console.error('Error loading bill:', error);
        const errorMessage = error?.error?.message || '';
        if (errorMessage.includes('Bill not found') || errorMessage.includes('not found')) {
          // Try to manually generate the bill
          this.billingService.manuallyGenerateBill(bookingId).subscribe({
            next: (bill) => {
              this.bill = bill;
              this.isLoadingBill = false;
            },
            error: (genError: any) => {
              console.error('Error generating bill:', genError);
              const genErrorMessage = genError?.error?.message || genError?.message || 'Unknown error';
              alert('Bill not found. ' + genErrorMessage + ' Please ensure the booking exists and try again.');
              this.isLoadingBill = false;
              this.closeBillModal();
            }
          });
        } else {
          const errorMsg = error?.error?.message || error?.message || 'Unknown error';
          alert('Error loading bill: ' + errorMsg);
          this.isLoadingBill = false;
          this.closeBillModal();
        }
      }
    });
  }

  onMarkBillAsPaid() {
    if (!this.bill || !this.paymentForm.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.billingService.markBillAsPaid(this.bill.id, this.paymentForm).subscribe({
      next: (updatedBill) => {
        alert('Bill marked as paid successfully! Booking has been confirmed.');
        this.bill = updatedBill;
        this.closeBillModal();
        this.loadBookings();
      },
      error: (error: any) => {
        console.error('Error marking bill as paid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to mark bill as paid';
        alert(errorMessage);
      }
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

}

