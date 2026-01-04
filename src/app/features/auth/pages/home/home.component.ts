import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedCategory = 'hotels';
  searchForm = {
    location: '',
    checkIn: '',
    checkOut: ''
  };

  constructor(private router: Router) {}

  onSearch() {
    console.log('Search:', this.searchForm);
    // TODO: Implement search functionality
  }
}
