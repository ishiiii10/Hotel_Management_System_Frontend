import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ManagerService } from '../services/manager.service';
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

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadHotelInfo();
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  logout() {
    this.authService.logout();
  }
}
