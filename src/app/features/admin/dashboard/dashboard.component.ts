import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService, User, Hotel } from '../services/admin.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  hotels: Hotel[] = [];
  isLoading = false;
  metrics = {
    totalRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0,
    todayBookings: 0,
    checkIns: 0,
    checkOuts: 0,
    availableRooms: 0,
    averageRating: 0
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    this.adminService.getAllHotels().subscribe({
      next: (response: any) => {
        this.hotels = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.isLoading = false;
      }
    });

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
