import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HotelSearchService, HotelDetail, AvailableRoom } from '../../../../shared/services/hotel-search.service';
import { BookingService, CreateBookingRequest, Booking } from '../../../../shared/services/booking.service';
import { BillingService, BillResponse, MarkBillPaidRequest } from '../../../../shared/services/billing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.css'
})
export class HotelDetailComponent implements OnInit {
  hotelId: number | null = null;
  hotel: HotelDetail | null = null;
  availableRooms: AvailableRoom[] = [];
  isLoading = false;
  isAuthenticated = false;

  bookingForm = {
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1
  };

  selectedRoom: AvailableRoom | null = null;
  isBooking = false;
  
  showBookingModal = false;
  createdBooking: Booking | null = null;
  bill: BillResponse | null = null;
  isLoadingBill = false;
  paymentForm: MarkBillPaidRequest = {
    paymentMethod: '',
    transactionId: '',
    paymentReference: '',
    notes: ''
  };
  
  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  get minCheckOutDate(): string {
    if (!this.bookingForm.checkInDate) {
      return this.minDate;
    }
    const checkIn = new Date(this.bookingForm.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  constructor(
    private hotelSearchService: HotelSearchService,
    private bookingService: BookingService,
    private billingService: BillingService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();

    this.route.params.subscribe(params => {
      this.hotelId = +params['id'];
      if (this.hotelId) {
        this.loadHotelDetails();
      }
    });

    this.route.queryParams.subscribe(params => {
      this.bookingForm.checkInDate = params['checkIn'] || '';
      this.bookingForm.checkOutDate = params['checkOut'] || '';
      if (this.bookingForm.checkInDate && this.bookingForm.checkOutDate && this.hotelId) {
        this.checkAvailability();
      }
    });
  }

  loadHotelDetails() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.hotelSearchService.getHotelById(this.hotelId).subscribe({
      next: (hotel: HotelDetail) => {
        this.hotel = hotel;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading hotel details:', error);
        this.isLoading = false;
      }
    });
  }

  checkAvailability() {
    if (!this.hotelId || !this.bookingForm.checkInDate || !this.bookingForm.checkOutDate) {
      return;
    }

    this.isLoading = true;
    this.hotelSearchService.checkAvailability(
      this.hotelId,
      this.bookingForm.checkInDate,
      this.bookingForm.checkOutDate
    ).subscribe({
      next: (response) => {
        this.availableRooms = response.availableRoomsList || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.availableRooms = [];
        this.isLoading = false;
        alert('Error checking availability. Please try again.');
      }
    });
  }

  onAvailabilitySearch() {
    if (!this.bookingForm.checkInDate || !this.bookingForm.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    this.selectedRoom = null;
    this.checkAvailability();
  }

  selectRoom(room: AvailableRoom) {
    this.selectedRoom = room;
  }

  calculateTotal(): number {
    if (!this.selectedRoom || !this.bookingForm.checkInDate || !this.bookingForm.checkOutDate) {
      return 0;
    }
    return this.bookingService.calculateTotalAmount(
      this.selectedRoom.pricePerNight,
      this.bookingForm.checkInDate,
      this.bookingForm.checkOutDate
    );
  }

  calculateTaxes(): number {
    const total = this.calculateTotal();
    return this.bookingService.calculateTaxes(total);
  }

  calculateGrandTotal(): number {
    const total = this.calculateTotal();
    const taxes = this.calculateTaxes();
    return this.bookingService.calculateGrandTotal(total, taxes);
  }

  onBookNow() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.selectedRoom) {
      alert('Please select a room');
      return;
    }

    if (!this.bookingForm.checkInDate || !this.bookingForm.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (!this.hotelId) {
      alert('Hotel information is missing');
      return;
    }

    const bookingRequest: CreateBookingRequest = {
      hotelId: this.hotelId,
      roomId: this.selectedRoom.roomId,
      checkInDate: this.bookingForm.checkInDate,
      checkOutDate: this.bookingForm.checkOutDate,
      numberOfGuests: this.bookingForm.numberOfGuests,
      rooms: 1
    };

    this.isBooking = true;
    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (booking) => {
        this.isBooking = false;
        this.createdBooking = booking;
        // Wait a moment for bill to be generated, then load it
        setTimeout(() => {
          this.loadBill(booking.id);
        }, 1000);
      },
      error: (error) => {
        this.isBooking = false;
        console.error('Error creating booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to create booking. Please try again.';
        alert(errorMessage);
      }
    });
  }

  loadBill(bookingId: number) {
    this.isLoadingBill = true;
    this.billingService.getBillByBookingId(bookingId).subscribe({
      next: (bill) => {
        this.bill = bill;
        this.isLoadingBill = false;
        this.showBookingModal = true;
      },
      error: (error: any) => {
        console.error('Error loading bill:', error);
        // If bill not found, try to manually generate it
        const errorMessage = error?.error?.message || '';
        if (errorMessage.includes('Bill not found') || errorMessage.includes('not found')) {
          this.billingService.manuallyGenerateBill(bookingId).subscribe({
            next: (bill) => {
              this.bill = bill;
              this.isLoadingBill = false;
              this.showBookingModal = true;
            },
            error: (genError: any) => {
              console.error('Error generating bill:', genError);
              alert('Booking created but bill generation failed. Please try again in a moment.');
              this.isLoadingBill = false;
              this.closeBookingModal();
            }
          });
        } else {
          alert('Booking created but could not load bill. Please refresh and try again.');
          this.isLoadingBill = false;
          this.closeBookingModal();
        }
      }
    });
  }

  onPayBill() {
    if (!this.bill || !this.paymentForm.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.billingService.markBillAsPaid(this.bill.id, this.paymentForm).subscribe({
      next: (updatedBill) => {
        alert('Payment successful! Your booking has been confirmed. You can now check in at the hotel.');
        this.bill = updatedBill;
        // Close modal and navigate to my bookings after a short delay
        setTimeout(() => {
          this.closeBookingModal();
          this.router.navigate(['/my-bookings']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error marking bill as paid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to process payment';
        alert(errorMessage);
      }
    });
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.createdBooking = null;
    this.bill = null;
    this.paymentForm = {
      paymentMethod: '',
      transactionId: '',
      paymentReference: '',
      notes: ''
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getAmenitiesList(): string[] {
    if (!this.hotel?.amenities) return [];
    return this.hotel.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
  }
}
