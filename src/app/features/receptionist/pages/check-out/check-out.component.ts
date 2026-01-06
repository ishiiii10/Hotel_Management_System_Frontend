import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, Booking } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceptionistSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-receptionist-check-out',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceptionistSidebarComponent],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css'
})
export class ReceptionistCheckOutComponent implements OnInit {
  todayCheckOuts: Booking[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showCheckOutModal = false;
  selectedBooking: Booking | null = null;
  checkOutNotes = '';
  checkOutRating: number | null = null;
  checkOutFeedback = '';
  checkOutLate = false;

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
    this.loadTodayCheckOuts();
  }

  loadTodayCheckOuts() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.receptionistService.getTodayCheckOuts(this.hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckOuts = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading today check-outs:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.loadTodayCheckOuts();
  }

  onReset() {
    this.searchBookingId = null;
    this.searchGuestName = '';
    this.loadTodayCheckOuts();
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
        this.loadTodayCheckOuts();
      },
      error: (error) => {
        console.error('Error checking out:', error);
        alert('Error checking out guest');
      }
    });
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

  get filteredCheckOuts(): Booking[] {
    let filtered = this.todayCheckOuts;

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

