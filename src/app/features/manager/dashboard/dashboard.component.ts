import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ManagerService, HotelDetail, Room, Booking } from '../services/manager.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-manager-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  hotel: HotelDetail | null = null;
  rooms: Room[] = [];
  bookings: Booking[] = [];
  todayCheckIns: Booking[] = [];
  todayCheckOuts: Booking[] = [];
  isLoading = false;
  metrics = {
    totalRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0,
    todayBookings: 0,
    checkIns: 0,
    checkOuts: 0,
    availableRooms: 0,
    occupiedRooms: 0
  };

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      this.isLoading = false;
      return;
    }

    this.managerService.getHotelById(user.hotelId).subscribe({
      next: (response: any) => {
        this.hotel = response.data || response;
        if (this.hotel) {
          this.loadHotelData(this.hotel.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
        this.isLoading = false;
      }
    });
  }

  loadHotelData(hotelId: number) {
    this.managerService.getHotelRooms(hotelId).subscribe({
      next: (response: any) => {
        this.rooms = response.data || response;
        this.calculateMetrics();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });

    this.managerService.getHotelBookings(hotelId).subscribe({
      next: (response: any) => {
        this.bookings = response.data || response;
        this.calculateMetrics();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });

    this.managerService.getTodayCheckIns(hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckIns = response.data || response;
        this.metrics.checkIns = this.todayCheckIns.length;
      },
      error: (error) => {
        console.error('Error loading check-ins:', error);
      }
    });

    this.managerService.getTodayCheckOuts(hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckOuts = response.data || response;
        this.metrics.checkOuts = this.todayCheckOuts.length;
      },
      error: (error) => {
        console.error('Error loading check-outs:', error);
      }
    });
  }

  calculateMetrics() {
    if (this.rooms) {
      this.metrics.availableRooms = this.rooms.filter(r => r.status === 'AVAILABLE' && r.isActive).length;
      this.metrics.occupiedRooms = this.rooms.filter(r => r.status === 'OCCUPIED').length;
    }
    if (this.bookings) {
      this.metrics.totalBookings = this.bookings.length;
      const today = new Date().toISOString().split('T')[0];
      this.metrics.todayBookings = this.bookings.filter(b => b.checkInDate === today).length;
    }
  }

  logout() {
    this.authService.logout();
  }
}

