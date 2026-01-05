import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, Booking } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-receptionist-check-in',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.css'
})
export class ReceptionistCheckInComponent implements OnInit {
  todayCheckIns: Booking[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showCheckInModal = false;
  selectedBooking: Booking | null = null;
  checkInNotes = '';

  searchBookingId: number | null = null;
  searchGuestName = '';

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
    this.loadTodayCheckIns();
  }

  loadTodayCheckIns() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.receptionistService.getTodayCheckIns(this.hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckIns = response.data || response;
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
      next: () => {
        this.closeCheckInModal();
        this.loadTodayCheckIns();
      },
      error: (error) => {
        console.error('Error checking in:', error);
        alert('Error checking in guest');
      }
    });
  }

  canCheckIn(booking: Booking): boolean {
    return booking.status === 'CONFIRMED' || booking.status === 'CREATED';
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

  logout() {
    this.authService.logout();
  }
}

