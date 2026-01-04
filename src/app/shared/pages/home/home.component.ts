import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  selectedCategory = 'hotels';
  searchForm = {
    location: '',
    checkIn: '',
    checkOut: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const role = user.role;
      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'MANAGER') {
        this.router.navigate(['/manager/dashboard']);
      } else if (role === 'RECEPTIONIST') {
        this.router.navigate(['/receptionist/dashboard']);
      }
    }
  }

  onSearch() {
    console.log('Search:', this.searchForm);
  }
}
