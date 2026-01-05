import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, Booking, WalkInBookingRequest, Room } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-receptionist-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
  selectedBooking: Booking | null = null;

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

  constructor(
    private receptionistService: ReceptionistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      return;
    }
    this.hotelId = user.hotelId;
    this.loadBookings();
  }

  loadBookings() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.receptionistService.getHotelBookings(this.hotelId).subscribe({
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
      next: () => {
        this.closeWalkInModal();
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error creating walk-in booking:', error);
        alert('Error creating walk-in booking');
      }
    });
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

  logout() {
    this.authService.logout();
  }
}

