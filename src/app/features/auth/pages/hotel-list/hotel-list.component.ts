import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HotelSearchService, HotelSearchResult } from '../../../../shared/services/hotel-search.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hotel-list.component.html',
  styleUrl: './hotel-list.component.css'
})
export class HotelListComponent implements OnInit {
  searchForm = {
    city: '',
    checkInDate: '',
    checkOutDate: '',
    category: ''
  };

  categories: string[] = [];
  cities: string[] = [];
  searchResults: HotelSearchResult[] = [];
  isLoading = false;
  isAuthenticated = false;

  constructor(
    private hotelSearchService: HotelSearchService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.categories = this.hotelSearchService.getHotelCategories();
    this.cities = this.hotelSearchService.getCities();
    this.isAuthenticated = this.authService.isAuthenticated();

    this.route.queryParams.subscribe(params => {
      this.searchForm.city = params['city'] || '';
      this.searchForm.checkInDate = params['checkIn'] || '';
      this.searchForm.checkOutDate = params['checkOut'] || '';
      this.searchForm.category = params['category'] || '';
      this.performSearch();
    });
  }

  performSearch() {
    if (!this.searchForm.city && !this.searchForm.category) {
      return;
    }

    this.isLoading = true;

    const searchParams = {
      city: this.searchForm.city || undefined,
      category: this.searchForm.category || undefined
    };

    this.hotelSearchService.searchHotels(searchParams).subscribe({
      next: (results: HotelSearchResult[]) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error searching hotels:', error);
        this.searchResults = [];
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.router.navigate(['/hotels'], {
      queryParams: {
        city: this.searchForm.city || '',
        category: this.searchForm.category || '',
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
    this.searchResults = [];
    this.router.navigate(['/hotels']);
  }

  viewHotelDetails(hotelId: number) {
    this.router.navigate(['/hotels', hotelId], {
      queryParams: {
        checkIn: this.searchForm.checkInDate || '',
        checkOut: this.searchForm.checkOutDate || ''
      }
    });
  }
}
