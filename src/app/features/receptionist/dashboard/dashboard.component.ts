import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReceptionistService, HotelDetail, Room, Booking } from '../services/receptionist.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-receptionist-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ReceptionistDashboardComponent implements OnInit {
  hotel: HotelDetail | null = null;
  rooms: Room[] = [];
  todayCheckIns: Booking[] = [];
  todayCheckOuts: Booking[] = [];
  isLoading = false;
  roomStatusCounts = {
    available: 0,
    occupied: 0,
    maintenance: 0,
    outOfService: 0
  };

  constructor(
    private receptionistService: ReceptionistService,
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

    this.receptionistService.getHotelById(user.hotelId).subscribe({
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
    this.receptionistService.getHotelRooms(hotelId).subscribe({
      next: (response: any) => {
        this.rooms = response.data || response;
        this.calculateRoomStatus();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });

    this.receptionistService.getTodayCheckIns(hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckIns = response.data || response;
      },
      error: (error) => {
        console.error('Error loading check-ins:', error);
      }
    });

    this.receptionistService.getTodayCheckOuts(hotelId).subscribe({
      next: (response: any) => {
        this.todayCheckOuts = response.data || response;
      },
      error: (error) => {
        console.error('Error loading check-outs:', error);
      }
    });
  }

  calculateRoomStatus() {
    this.roomStatusCounts.available = this.rooms.filter(r => r.status === 'AVAILABLE').length;
    this.roomStatusCounts.occupied = this.rooms.filter(r => r.status === 'OCCUPIED').length;
    this.roomStatusCounts.maintenance = this.rooms.filter(r => r.status === 'MAINTENANCE').length;
    this.roomStatusCounts.outOfService = this.rooms.filter(r => r.status === 'OUT_OF_SERVICE').length;
  }

  logout() {
    this.authService.logout();
  }
}

