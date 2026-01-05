import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HotelSearchService, HotelDetail, AvailableRoom } from '../../../../shared/services/hotel-search.service';
import { BookingService, CreateBookingRequest } from '../../../../shared/services/booking.service';
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

  constructor(
    private hotelSearchService: HotelSearchService,
    private bookingService: BookingService,
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
        alert('Booking created successfully! Booking ID: ' + booking.id);
        this.router.navigate(['/my-bookings']);
      },
      error: (error) => {
        this.isBooking = false;
        console.error('Error creating booking:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to create booking. Please try again.';
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

  getAmenitiesList(): string[] {
    if (!this.hotel?.amenities) return [];
    return this.hotel.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
  }
}
