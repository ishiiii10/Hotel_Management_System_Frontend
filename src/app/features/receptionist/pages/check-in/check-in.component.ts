import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, Booking } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BookingService } from '../../../../shared/services/booking.service';
import { BillingService, BillResponse, MarkBillPaidRequest } from '../../../../shared/services/billing.service';
import { ReceptionistSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-receptionist-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceptionistSidebarComponent],
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.css'
})
export class ReceptionistCheckInComponent implements OnInit {
  todayCheckIns: Booking[] = [];
  checkedInBookings: Booking[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showCheckInModal = false;
  selectedBooking: Booking | null = null;
  checkInNotes = '';

  searchBookingId: number | null = null;
  searchGuestName = '';
  
  checkInByBookingId: number | null = null;

  showConfirmModal = false;
  bookingToConfirm: Booking | null = null;
  showBillModal = false;
  selectedBillBookingId: number | null = null;
  bill: BillResponse | null = null;
  isLoadingBill = false;
  paymentForm: MarkBillPaidRequest = {
    paymentMethod: '',
    transactionId: '',
    paymentReference: '',
    notes: ''
  };
  isAdmin = false;

  constructor(
    private receptionistService: ReceptionistService,
    private authService: AuthService,
    private bookingService: BookingService,
    private billingService: BillingService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      return;
    }
    this.hotelId = user.hotelId;
    this.isAdmin = user.role === 'ADMIN';
    this.loadTodayCheckIns();
  }

  loadTodayCheckIns() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.receptionistService.getTodayCheckIns(this.hotelId).subscribe({
      next: (response: any) => {
        const allBookings = response.data || response;
        // Filter by hotelId to ensure bookings belong to this hotel
        const hotelBookings = allBookings.filter((b: Booking) => b.hotelId === this.hotelId);
        
        // Separate bookings that can be checked in vs already checked in
        // Only CONFIRMED bookings can be checked in
        this.todayCheckIns = hotelBookings.filter((b: Booking) => 
          b.status === 'CONFIRMED'
        );
        this.checkedInBookings = hotelBookings.filter((b: Booking) => 
          b.status === 'CHECKED_IN'
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading today check-ins:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.loadTodayCheckIns();
  }

  onReset() {
    this.searchBookingId = null;
    this.searchGuestName = '';
    this.loadTodayCheckIns();
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
    this.receptionistService.checkIn(this.selectedBooking.id, request).subscribe({
      next: (response: any) => {
        alert('Guest checked in successfully!');
        this.closeCheckInModal();
        this.loadTodayCheckIns();
      },
      error: (error: any) => {
        console.error('Error checking in:', error);
        const errorMessage = error?.error?.message || error?.message || 'Error checking in guest';
        alert(errorMessage);
      }
    });
  }

  onCheckInByBookingId() {
    if (!this.checkInByBookingId) {
      alert('Please enter a booking ID');
      return;
    }

    // First, fetch the booking to verify it exists and can be checked in
    this.receptionistService.getBookingById(this.checkInByBookingId).subscribe({
      next: (booking: Booking) => {
        // Verify booking belongs to this hotel
        if (booking.hotelId !== this.hotelId) {
          alert('Booking does not belong to this hotel');
          this.checkInByBookingId = null;
          return;
        }

        // Check if booking can be checked in - only CONFIRMED bookings
        if (booking.status === 'CREATED') {
          // Offer to confirm the booking first
          if (confirm('Booking is not confirmed yet. Would you like to confirm it first?')) {
            this.bookingToConfirm = booking;
            this.showConfirmModal = true;
            this.checkInByBookingId = null;
            return;
          }
        } else if (booking.status !== 'CONFIRMED') {
          alert(`Booking cannot be checked in. Current status: ${booking.status}. Only CONFIRMED bookings can be checked in.`);
          this.checkInByBookingId = null;
          return;
        }

        // Open modal with this booking
        this.selectedBooking = booking;
        this.checkInNotes = '';
        this.showCheckInModal = true;
        this.checkInByBookingId = null;
      },
      error: (error: any) => {
        console.error('Error fetching booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Booking not found';
        alert(errorMessage);
        this.checkInByBookingId = null;
      }
    });
  }

  onConfirmBooking() {
    if (!this.bookingToConfirm) return;

    this.bookingService.confirmBooking(this.bookingToConfirm.id).subscribe({
      next: (booking: Booking) => {
        alert('Booking confirmed successfully! Bill will be generated automatically.');
        this.closeConfirmModal();
        this.loadTodayCheckIns();
        // If user was trying to check in, open check-in modal
        if (this.checkInByBookingId === this.bookingToConfirm!.id) {
          this.selectedBooking = booking;
          this.showCheckInModal = true;
        }
      },
      error: (error: any) => {
        console.error('Error confirming booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to confirm booking';
        alert(errorMessage);
      }
    });
  }

  openConfirmModal(booking: Booking) {
    this.bookingToConfirm = booking;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.bookingToConfirm = null;
  }

  openBillModal(bookingId: number) {
    this.selectedBillBookingId = bookingId;
    this.showBillModal = true;
    this.loadBill(bookingId);
  }

  closeBillModal() {
    this.showBillModal = false;
    this.selectedBillBookingId = null;
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
      error: (error) => {
        console.error('Error loading bill:', error);
        this.bill = null;
        this.isLoadingBill = false;
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
        alert('Bill marked as paid successfully!');
        this.bill = updatedBill;
        this.paymentForm = {
          paymentMethod: '',
          transactionId: '',
          paymentReference: '',
          notes: ''
        };
      },
      error: (error: any) => {
        console.error('Error marking bill as paid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to mark bill as paid';
        alert(errorMessage);
      }
    });
  }

  canCheckIn(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
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

  get filteredCheckIns(): Booking[] {
    let filtered = this.todayCheckIns;

    if (this.searchBookingId) {
      filtered = filtered.filter(b => b.id === this.searchBookingId);
    }

    if (this.searchGuestName) {
      filtered = filtered.filter(b => 
        (b.guestName && b.guestName.toLowerCase().includes(this.searchGuestName.toLowerCase()))
      );
    }

    return filtered;
  }

}

