import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HotelSearchService, HotelSearchResult } from '../../../../shared/services/hotel-search.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  searchForm = {
    city: '',
    checkInDate: '',
    checkOutDate: '',
    category: ''
  };

  categories: string[] = [];
  cities: string[] = [];
  selectedCategory = '';
  searchResults: HotelSearchResult[] = [];
  featuredHotels: HotelSearchResult[] = [];
  isLoading = false;
  hasSearched = false;
  isAuthenticated = false;

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get minCheckOutDate(): string {
    if (!this.searchForm.checkInDate) {
      return this.minDate;
    }
    const checkIn = new Date(this.searchForm.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  constructor(
    private hotelSearchService: HotelSearchService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories = this.hotelSearchService.getHotelCategories();
    this.cities = this.hotelSearchService.getCities();
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const role = user.role.toUpperCase();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'MANAGER') {
          this.router.navigate(['/manager/dashboard']);
        } else if (role === 'RECEPTIONIST') {
          this.router.navigate(['/receptionist/dashboard']);
        }
      }
    }
    
    this.loadFeaturedHotels();
  }

  loadFeaturedHotels() {
    this.isLoading = true;
    // Try to load all hotels first
    this.hotelSearchService.getAllHotels().subscribe({
      next: (hotels: HotelSearchResult[]) => {
        if (hotels.length >= 3) {
          this.featuredHotels = hotels.slice(0, Math.max(3, hotels.length));
        } else if (hotels.length > 0) {
          this.featuredHotels = hotels;
        } else {
          // If no hotels, try searching by category
          this.loadHotelsByCategory();
          return;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading featured hotels:', error);
        // Fallback to category search
        this.loadHotelsByCategory();
      }
    });
  }

  loadHotelsByCategory() {
    // Try multiple categories to get at least 3 hotels
    const categories = ['HOTEL', 'RESORT', 'VILLA'];
    let completed = 0;
    const allHotels: HotelSearchResult[] = [];

    categories.forEach(category => {
      this.hotelSearchService.searchHotels({ category }).subscribe({
        next: (hotels: HotelSearchResult[]) => {
          allHotels.push(...hotels);
          completed++;
          
          if (completed === categories.length) {
            // Remove duplicates
            const uniqueHotels = Array.from(
              new Map(allHotels.map(h => [h.id, h])).values()
            );
            this.featuredHotels = uniqueHotels.length >= 3 
              ? uniqueHotels.slice(0, Math.max(3, uniqueHotels.length))
              : uniqueHotels;
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          completed++;
          if (completed === categories.length) {
            if (allHotels.length > 0) {
              const uniqueHotels = Array.from(
                new Map(allHotels.map(h => [h.id, h])).values()
              );
              this.featuredHotels = uniqueHotels;
            } else {
              this.featuredHotels = [];
            }
            this.isLoading = false;
          }
        }
      });
    });
  }

  viewHotelDetails(hotelId: number) {
    this.router.navigate(['/hotels', hotelId], {
      queryParams: {
        checkIn: this.searchForm.checkInDate || '',
        checkOut: this.searchForm.checkOutDate || ''
      }
    });
  }

  onCategorySelect(category: string) {
    if (this.selectedCategory === category) {
      this.selectedCategory = '';
      this.searchForm.category = '';
    } else {
      this.selectedCategory = category;
      this.searchForm.category = category;
    }
  }

  onSearch() {
    if (!this.searchForm.city && !this.searchForm.category) {
      alert('Please enter a city or select a category');
      return;
    }

    const searchParams = {
      city: this.searchForm.city || undefined,
      category: this.searchForm.category || undefined
    };

    this.router.navigate(['/hotels'], { 
      queryParams: {
        city: searchParams.city || '',
        category: searchParams.category || '',
        checkIn: this.searchForm.checkInDate || '',
        checkOut: this.searchForm.checkOutDate || ''
      }
    });
  }

  onReset() {
    this.searchForm = {
      city: '',
      checkInDate: '',
      checkOutDate: '',
      category: ''
    };
    this.selectedCategory = '';
    this.searchResults = [];
    this.hasSearched = false;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
