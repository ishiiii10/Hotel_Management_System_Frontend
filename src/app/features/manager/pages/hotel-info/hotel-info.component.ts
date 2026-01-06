import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ManagerService, HotelDetail } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ManagerSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-manager-hotel-info',
  standalone: true,
  imports: [CommonModule, ManagerSidebarComponent],
  templateUrl: './hotel-info.component.html',
  styleUrl: './hotel-info.component.css'
})
export class ManagerHotelInfoComponent implements OnInit {
  isLoading = false;
  hotel: HotelDetail | null = null;

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHotelInfo();
  }

  loadHotelInfo() {
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotel info:', error);
        this.isLoading = false;
      }
    });
  }

}

