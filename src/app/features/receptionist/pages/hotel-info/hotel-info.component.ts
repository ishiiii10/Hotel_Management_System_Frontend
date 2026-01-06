import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReceptionistService, HotelDetail } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceptionistSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-receptionist-hotel-info',
  standalone: true,
  imports: [CommonModule, ReceptionistSidebarComponent],
  templateUrl: './hotel-info.component.html',
  styleUrl: './hotel-info.component.css'
})
export class ReceptionistHotelInfoComponent implements OnInit {
  hotel: HotelDetail | null = null;
  isLoading = false;

  constructor(
    private receptionistService: ReceptionistService,
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

    this.receptionistService.getHotelById(user.hotelId).subscribe({
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

