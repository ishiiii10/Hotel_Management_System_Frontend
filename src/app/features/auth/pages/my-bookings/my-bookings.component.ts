import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../../../shared/services/booking.service';
import { BillingService, BillResponse } from '../../../../shared/services/billing.service';
import { HotelSearchService } from '../../../../shared/services/hotel-search.service';
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

  showBillModal = false;
  selectedBill: BillResponse | null = null;
  isLoadingBill = false;
  hotelImages: Map<number, string> = new Map();
  
  showBookingDetailsModal = false;
  selectedBooking: Booking | null = null;
  selectedHotel: any = null;
  isLoadingBookingDetails = false;

  constructor(
    private bookingService: BookingService,
    private billingService: BillingService,
    private hotelSearchService: HotelSearchService,
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
        this.loadHotelImages(bookings);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.isLoading = false;
      }
    });
  }

  loadHotelImages(bookings: Booking[]) {
    const uniqueHotelIds = [...new Set(bookings.map(b => b.hotelId))];
    uniqueHotelIds.forEach(hotelId => {
      if (!this.hotelImages.has(hotelId)) {
        this.hotelSearchService.getHotelById(hotelId).subscribe({
          next: (hotel) => {
            if (hotel.imageUrl) {
              this.hotelImages.set(hotelId, hotel.imageUrl);
            }
          },
          error: (error) => {
            console.error(`Error loading hotel image for hotel ${hotelId}:`, error);
          }
        });
      }
    });
  }

  getHotelImage(hotelId: number): string | null {
    return this.hotelImages.get(hotelId) || null;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  getFilteredBookings(): Booking[] {
    const now = new Date();
    let filtered: Booking[] = [];
    
    switch (this.activeTab) {
      case 'upcoming':
        filtered = this.bookings.filter(b => {
          const checkIn = new Date(b.checkInDate);
          return checkIn > now && b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT';
        });
        break;
      case 'past':
        filtered = this.bookings.filter(b => {
          const checkOut = new Date(b.checkOutDate);
          return checkOut < now || b.status === 'CHECKED_OUT';
        });
        break;
      case 'cancelled':
        filtered = this.bookings.filter(b => b.status === 'CANCELLED');
        break;
      default:
        filtered = this.bookings;
    }
    
    // Sort by status: CHECKED_IN > CONFIRMED > CREATED > CHECKED_OUT > CANCELLED
    return filtered.sort((a, b) => {
      const statusOrder: { [key: string]: number } = {
        'CHECKED_IN': 1,
        'CONFIRMED': 2,
        'CREATED': 3,
        'CHECKED_OUT': 4,
        'CANCELLED': 5
      };
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
  }

  viewBill(bookingId: number) {
    this.isLoadingBill = true;
    this.billingService.getBillByBookingId(bookingId).subscribe({
      next: (bill: BillResponse) => {
        this.selectedBill = bill;
        this.isLoadingBill = false;
        this.showBillModal = true;
      },
      error: (error: any) => {
        console.error('Error loading bill:', error);
        this.isLoadingBill = false;
        alert('Bill not found for this booking');
      }
    });
  }

  closeBillModal() {
    this.showBillModal = false;
    this.selectedBill = null;
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

  viewBookingDetails(booking: Booking) {
    console.log('View booking details clicked for booking:', booking.id);
    // Set initial booking data
    this.selectedBooking = booking;
    this.selectedHotel = null;
    this.isLoadingBookingDetails = true;
    this.showBookingDetailsModal = true;
    
    // Load full booking details
    this.bookingService.getBookingById(booking.id).subscribe({
      next: (fullBooking: Booking) => {
        console.log('Full booking loaded:', fullBooking);
        this.selectedBooking = fullBooking;
        // Load hotel details
        this.hotelSearchService.getHotelById(booking.hotelId).subscribe({
          next: (hotel) => {
            console.log('Hotel loaded:', hotel);
            this.selectedHotel = hotel;
            this.isLoadingBookingDetails = false;
          },
          error: (error) => {
            console.error('Error loading hotel details:', error);
            // Continue without hotel details
            this.isLoadingBookingDetails = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading booking details:', error);
        // Show modal with the booking data we already have
        this.isLoadingBookingDetails = false;
        // Still try to load hotel
        this.hotelSearchService.getHotelById(booking.hotelId).subscribe({
          next: (hotel) => {
            this.selectedHotel = hotel;
          },
          error: (hotelError) => {
            console.error('Error loading hotel:', hotelError);
          }
        });
      }
    });
  }

  closeBookingDetailsModal() {
    this.showBookingDetailsModal = false;
    this.selectedBooking = null;
    this.selectedHotel = null;
  }

  parseGuestDetails(guestDetailsJson: string | undefined): any[] {
    if (!guestDetailsJson) return [];
    try {
      return JSON.parse(guestDetailsJson);
    } catch (error) {
      console.error('Error parsing guest details:', error);
      return [];
    }
  }
}

