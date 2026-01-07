import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HotelSearchService, HotelDetail, AvailableRoom, HotelSearchResult } from '../../../../shared/services/hotel-search.service';
import { BookingService, CreateBookingRequest, Booking, GuestInfo } from '../../../../shared/services/booking.service';
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
  
  showGuestDetailsModal = false;
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
  
  guestDetailsForm = {
    guestPhone: '',
    guests: [] as GuestInfo[],
    emergencyContact: '',
    emergencyPhone: ''
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
        // If imageUrl is not in the response, try to get it from search results
        if (!hotel.imageUrl) {
          this.loadHotelImage();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading hotel details:', error);
        this.isLoading = false;
      }
    });
  }

  loadHotelImage() {
    // Try to get imageUrl from search service which includes it
    // Search by city or category to find the hotel
    if (this.hotel?.city) {
      this.hotelSearchService.searchHotels({ city: this.hotel.city }).subscribe({
        next: (hotels: HotelSearchResult[]) => {
          const hotelWithImage = hotels.find(h => h.id === this.hotelId);
          if (hotelWithImage?.imageUrl && this.hotel) {
            this.hotel.imageUrl = hotelWithImage.imageUrl;
          }
        },
        error: (error: any) => {
          // Try without filters
          this.tryGetImageFromAllHotels();
        }
      });
    } else {
      this.tryGetImageFromAllHotels();
    }
  }

  tryGetImageFromAllHotels() {
    this.hotelSearchService.getAllHotels().subscribe({
      next: (hotels: HotelSearchResult[]) => {
        const hotelWithImage = hotels.find(h => h.id === this.hotelId);
        if (hotelWithImage?.imageUrl && this.hotel) {
          this.hotel.imageUrl = hotelWithImage.imageUrl;
        }
      },
      error: (error: any) => {
        console.error('Error loading hotel image:', error);
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

  onAvailabilitySearch(event?: Event) {
    // Prevent default form submission behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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

    // Initialize guest details form
    this.initializeGuestDetailsForm();
    this.showGuestDetailsModal = true;
  }

  initializeGuestDetailsForm() {
    const numberOfGuests = this.bookingForm.numberOfGuests || 1;
    this.guestDetailsForm.guests = [];
    for (let i = 0; i < numberOfGuests; i++) {
      this.guestDetailsForm.guests.push({ name: '', age: 0 });
    }
    this.guestDetailsForm.guestPhone = '';
    this.guestDetailsForm.emergencyContact = '';
    this.guestDetailsForm.emergencyPhone = '';
  }

  onGuestDetailsSubmit() {
    // Validate guest phone
    if (!this.guestDetailsForm.guestPhone || this.guestDetailsForm.guestPhone.trim() === '') {
      alert('Please enter a contact phone number');
      return;
    }

    // Validate all guest names and ages
    const invalidGuests = this.guestDetailsForm.guests.filter(
      (guest, index) => !guest.name || guest.name.trim() === '' || !guest.age || guest.age <= 0
    );

    if (invalidGuests.length > 0) {
      alert('Please enter valid name and age for all guests');
      return;
    }

    // Create booking with guest details
    this.createBookingWithGuestDetails();
  }

  createBookingWithGuestDetails() {
    if (!this.hotelId || !this.selectedRoom) {
      return;
    }

    // Prepare guest details JSON
    const guestDetailsJson = JSON.stringify(this.guestDetailsForm.guests);

    const bookingRequest: CreateBookingRequest = {
      hotelId: this.hotelId,
      roomId: this.selectedRoom.roomId,
      checkInDate: this.bookingForm.checkInDate,
      checkOutDate: this.bookingForm.checkOutDate,
      numberOfGuests: this.bookingForm.numberOfGuests,
      rooms: 1,
      guestPhone: this.guestDetailsForm.guestPhone,
      guestDetails: guestDetailsJson,
      specialRequests: this.guestDetailsForm.emergencyContact 
        ? `Emergency Contact: ${this.guestDetailsForm.emergencyContact}${this.guestDetailsForm.emergencyPhone ? ` (${this.guestDetailsForm.emergencyPhone})` : ''}`
        : undefined
    };

    this.showGuestDetailsModal = false;
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

  closeGuestDetailsModal() {
    this.showGuestDetailsModal = false;
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

  getStarArray(rating: number | undefined): number[] {
    const stars = rating ? Math.floor(rating) : 0;
    return Array.from({ length: stars }, (_, i) => i + 1);
  }
}
