import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ManagerService, Room } from '../services/manager.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-manager-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  isLoading = false;
  metrics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    averageRating: 0
  };

  revenueTrend: any[] = [];
  bookingTrend: any[] = [];
  bookingStatusDistribution: any[] = [];
  hotelName: string = 'Loading...';
  availableRoomsByCategory: { category: string; count: number }[] = [];
  rooms: Room[] = [];

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadHotelInfo();
    this.loadAvailableRoomsByCategory();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.managerService.getManagerDashboard().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.metrics = {
          totalRevenue: data.totalRevenue || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          totalBookings: data.totalBookings || 0,
          totalCheckIns: data.totalCheckIns || 0,
          totalCheckOuts: data.totalCheckOuts || 0,
          averageRating: data.averageRating || 0
        };
        this.revenueTrend = data.revenueTrend || [];
        this.bookingTrend = data.bookingTrend || [];
        this.bookingStatusDistribution = data.bookingStatusDistribution || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  loadHotelInfo() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      return;
    }

    this.managerService.getHotelById(user.hotelId).subscribe({
      next: (response: any) => {
        const hotel = response.data || response;
        this.hotelName = hotel.name || 'Hotel';
      },
      error: (error) => {
        console.error('Error loading hotel info:', error);
      }
    });
  }

  loadAvailableRoomsByCategory() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      return;
    }

    this.managerService.getHotelRooms(user.hotelId).subscribe({
      next: (response: any) => {
        const rooms = response.data || response;
        this.rooms = rooms;
        
        // Group available rooms by room type
        const categoryMap = new Map<string, number>();
        rooms.forEach((room: Room) => {
          if (room.status === 'AVAILABLE' && room.isActive) {
            const category = room.roomType || 'UNKNOWN';
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
          }
        });

        // Convert to array for display
        this.availableRoomsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
          category,
          count
        })).sort((a, b) => b.count - a.count);
      },
      error: (error) => {
        console.error('Error loading rooms by category:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getMaxCount(): number {
    if (this.availableRoomsByCategory.length === 0) return 1;
    return Math.max(...this.availableRoomsByCategory.map(item => item.count), 1);
  }

  logout() {
    this.authService.logout();
  }
}
