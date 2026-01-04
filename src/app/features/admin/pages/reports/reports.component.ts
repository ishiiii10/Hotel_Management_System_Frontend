import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class AdminReportsComponent implements OnInit {
  isLoading = false;
  hotelReports: any[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.adminService.getHotelReports().subscribe({
      next: (response: any) => {
        this.hotelReports = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.isLoading = false;
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

