import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, Booking, WalkInBookingRequest, Room } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BillingService, BillResponse, MarkBillPaidRequest } from '../../../../shared/services/billing.service';
import { ReceptionistSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-receptionist-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceptionistSidebarComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class ReceptionistBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showWalkInModal = false;
  showDetailsModal = false;
  showCheckInModal = false;
  showCheckOutModal = false;
  showBillModal = false;
  selectedBooking: Booking | null = null;
  createdBookingId: number | null = null;
  bill: BillResponse | null = null;
  isLoadingBill = false;
  paymentForm: MarkBillPaidRequest = {
    paymentMethod: '',
    transactionId: '',
    paymentReference: '',
    notes: ''
  };

  walkInForm: WalkInBookingRequest = {
    hotelId: 0,
    roomId: 0,
    checkInDate: '',
    checkOutDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    specialRequests: ''
  };

  availableRooms: Room[] = [];
  searchCheckIn = '';
  searchCheckOut = '';
  checkingAvailability = false;

  checkInNotes = '';
  checkOutNotes = '';
  checkOutRating: number | null = null;
  checkOutFeedback = '';
  checkOutLate = false;

  searchBookingId: number | null = null;
  searchStatus = '';

  statuses = ['CREATED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get minCheckOutDate(): string {
    if (!this.walkInForm.checkInDate) {
      return this.minDate;
    }
    const checkIn = new Date(this.walkInForm.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  get minSearchCheckOutDate(): string {
    if (!this.searchCheckIn) {
      return this.minDate;
    }
    const checkIn = new Date(this.searchCheckIn);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  constructor(
    private receptionistService: ReceptionistService,
    private authService: AuthService,
    private billingService: BillingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      return;
    }
    this.hotelId = user.hotelId;
    this.loadBookings();

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'walk-in') {
        this.openWalkInModal();
      }
    });
  }

  loadBookings() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.receptionistService.getHotelBookings(this.hotelId).subscribe({
      next: (response: any) => {
        this.bookings = response.data || response;
        this.filteredBookings = [...this.bookings];
        console.log('Loaded bookings:', this.bookings);
        // Log each booking to check bookingSource
        this.bookings.forEach((booking: Booking) => {
          console.log(`Booking ${booking.id}: status=${booking.status}, bookingSource=${booking.bookingSource}`);
        });
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

  searchAvailableRooms() {
    if (!this.hotelId || !this.searchCheckIn || !this.searchCheckOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    this.checkingAvailability = true;
    this.receptionistService.searchAvailability(this.hotelId, this.searchCheckIn, this.searchCheckOut).subscribe({
      next: (response: any) => {
        const data = response.data || response;
        if (data.availableRoomsList && data.availableRoomsList.length > 0) {
          this.availableRooms = data.availableRoomsList.map((room: any) => ({
            id: room.roomId,
            hotelId: this.hotelId!,
            roomNumber: room.roomNumber || room.roomId.toString(),
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            status: 'AVAILABLE',
            isActive: true
          }));
        } else {
          this.availableRooms = [];
          alert('No available rooms for selected dates');
        }
        this.checkingAvailability = false;
      },
      error: (error) => {
        console.error('Error searching availability:', error);
        alert('Error searching availability');
        this.checkingAvailability = false;
      }
    });
  }

  openWalkInModal() {
    if (!this.hotelId) return;
    this.walkInForm = {
      hotelId: this.hotelId,
      roomId: 0,
      checkInDate: '',
      checkOutDate: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      numberOfGuests: 1,
      specialRequests: ''
    };
    this.availableRooms = [];
    this.searchCheckIn = '';
    this.searchCheckOut = '';
    this.showWalkInModal = true;
  }

  closeWalkInModal() {
    this.showWalkInModal = false;
    this.availableRooms = [];
  }

  onCreateWalkInBooking() {
    if (!this.walkInForm.guestName || !this.walkInForm.guestEmail || !this.walkInForm.roomId 
        || !this.walkInForm.checkInDate || !this.walkInForm.checkOutDate) {
      alert('Please fill all required fields');
      return;
    }

    this.receptionistService.createWalkInBooking(this.walkInForm).subscribe({
      next: (response: any) => {
        const booking = response.data || response;
        this.createdBookingId = booking.id;
        this.closeWalkInModal();
        // Wait a moment for bill to be generated, then show bill modal
        setTimeout(() => {
          this.loadBillForWalkIn(booking.id);
        }, 1000);
      },
      error: (error: any) => {
        console.error('Error creating walk-in booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Error creating walk-in booking';
        alert(errorMessage);
      }
    });
  }

  loadBillForWalkIn(bookingId: number) {
    this.isLoadingBill = true;
    // Try to get bill - it should be generated automatically for walk-in bookings
    this.billingService.getBillByBookingId(bookingId).subscribe({
      next: (bill) => {
        this.bill = bill;
        this.isLoadingBill = false;
        this.showBillModal = true;
      },
      error: (error: any) => {
        console.error('Error loading bill:', error);
        // If bill not found, try to manually generate it
        const errorMessage = error?.error?.message || '';
        if (errorMessage.includes('Bill not found')) {
          // Try manual generation (admin only, but we'll try)
          this.billingService.manuallyGenerateBill(bookingId).subscribe({
            next: (bill) => {
              this.bill = bill;
              this.isLoadingBill = false;
              this.showBillModal = true;
            },
            error: (genError) => {
              console.error('Error generating bill:', genError);
              alert('Booking created but bill generation failed. Please try again in a moment.');
              this.isLoadingBill = false;
              this.loadBookings();
            }
          });
        } else {
          alert('Booking created but could not load bill. Please refresh and try again.');
          this.isLoadingBill = false;
          this.loadBookings();
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
        alert('Bill marked as paid successfully! Booking has been confirmed and can now be checked in.');
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

  openBillModal(bookingId: number) {
    console.log('openBillModal called with bookingId:', bookingId);
    this.createdBookingId = bookingId;
    this.showBillModal = true;
    this.loadBill(bookingId);
  }

  loadBill(bookingId: number) {
    console.log('loadBill called for bookingId:', bookingId);
    this.isLoadingBill = true;
    this.billingService.getBillByBookingId(bookingId).subscribe({
      next: (bill) => {
        console.log('Bill loaded successfully:', bill);
        this.bill = bill;
        this.isLoadingBill = false;
      },
      error: (error: any) => {
        console.error('Error loading bill:', error);
        const errorMessage = error?.error?.message || '';
        if (errorMessage.includes('Bill not found') || errorMessage.includes('not found')) {
          // For walk-in bookings, try to manually generate the bill
          console.log('Bill not found, attempting to generate...');
          this.billingService.manuallyGenerateBill(bookingId).subscribe({
            next: (bill) => {
              console.log('Bill generated successfully:', bill);
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

  closeBillModal() {
    this.showBillModal = false;
    this.bill = null;
    this.createdBookingId = null;
    this.paymentForm = {
      paymentMethod: '',
      transactionId: '',
      paymentReference: '',
      notes: ''
    };
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
    this.receptionistService.checkIn(this.selectedBooking.id, request).subscribe({
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

    this.receptionistService.checkOut(this.selectedBooking.id, request).subscribe({
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

  canCheckIn(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  canPayBill(booking: Booking): boolean {
    // For walk-in bookings, show pay bill option if status is CREATED
    const canPay = booking.status === 'CREATED' && booking.bookingSource === 'WALK_IN';
    console.log('canPayBill check:', { 
      bookingId: booking.id, 
      status: booking.status, 
      bookingSource: booking.bookingSource, 
      canPay 
    });
    return canPay;
  }

  hasBill(booking: Booking): boolean {
    // Check if booking has a bill (for CREATED walk-in bookings, bill should exist)
    return booking.status === 'CREATED' || booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN';
  }

  canCheckOut(booking: Booking): boolean {
    return booking.status === 'CHECKED_IN';
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

