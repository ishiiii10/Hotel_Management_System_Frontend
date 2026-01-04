import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  metrics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    averageRating: 0
  };

  revenueByHotel: any[] = [];
  revenueTrend: any[] = [];
  bookingTrend: any[] = [];
  bookingStatusDistribution: any[] = [];

  hotels: any[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadHotels();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.adminService.getAdminDashboard().subscribe({
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
        this.revenueByHotel = data.revenueByHotel || [];
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

  loadHotels() {
    this.adminService.getAllHotels().subscribe({
      next: (response: any) => {
        this.hotels = response.data || response;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
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

  getBarPercentage(revenue: number): number {
    if (!revenue || this.revenueByHotel.length === 0) return 0;
    const maxRevenue = Math.max(...this.revenueByHotel.map((item: any) => item.revenue || 0));
    if (maxRevenue === 0) return 0;
    return (revenue / maxRevenue) * 100;
  }

  logout() {
    this.authService.logout();
  }
}
