import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, Hotel, CreateHotelRequest, CreateStaffRequest } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-hotels',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class AdminHotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  isLoading = false;
  
  showCreateModal = false;
  showEditModal = false;
  showStaffModal = false;
  
  selectedHotel: Hotel | null = null;
  
  searchName = '';
  searchCity = '';
  searchStatus = '';
  
  hotelForm: CreateHotelRequest = {
    name: '',
    category: '',
    description: '',
    city: '',
    address: '',
    state: '',
    country: '',
    pincode: '',
    contactNumber: '',
    email: '',
    starRating: 1,
    amenities: '',
    status: 'ACTIVE',
    imageUrl: ''
  };
  
  staffForm: CreateStaffRequest = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'MANAGER'
  };
  
  categories = ['HOTEL', 'VILLA', 'APARTMENT', 'RESORT', 'HOSTEL', 'GUEST_HOUSE', 'HOMESTAY', 'BOUTIQUE'];
  cities = ['DELHI', 'MUMBAI', 'BANGALORE', 'CHENNAI', 'HYDERABAD', 'KOLKATA', 'PUNE', 'JAIPUR', 'AHMEDABAD', 'PATNA', 'KOCHI'];
  states = ['DELHI', 'MAHARASHTRA', 'KARNATAKA', 'TAMIL_NADU', 'TELANGANA', 'WEST_BENGAL', 'RAJASTHAN', 'GUJARAT', 'BIHAR', 'KERALA'];
  statuses = ['ACTIVE', 'INACTIVE'];
  staffRoles = ['MANAGER', 'RECEPTIONIST'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading = true;
    this.adminService.getAllHotels().subscribe({
      next: (response: any) => {
        this.hotels = response.data || response;
        this.filteredHotels = [...this.hotels];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.filteredHotels = this.hotels.filter(hotel => {
      const nameMatch = !this.searchName || hotel.name.toLowerCase().includes(this.searchName.toLowerCase());
      const cityMatch = !this.searchCity || hotel.city === this.searchCity;
      const statusMatch = !this.searchStatus || hotel.status === this.searchStatus;
      return nameMatch && cityMatch && statusMatch;
    });
  }

  onReset() {
    this.searchName = '';
    this.searchCity = '';
    this.searchStatus = '';
    this.filteredHotels = [...this.hotels];
  }

  openCreateModal() {
    this.hotelForm = {
      name: '',
      category: '',
      description: '',
      city: '',
      address: '',
      state: '',
      country: '',
      pincode: '',
      contactNumber: '',
      email: '',
      starRating: 1,
      amenities: '',
      status: 'ACTIVE',
      imageUrl: ''
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  openEditModal(hotel: Hotel) {
    this.selectedHotel = hotel;
    this.hotelForm = {
      name: hotel.name,
      category: hotel.category,
      description: hotel.description || '',
      city: hotel.city,
      address: hotel.address,
      state: hotel.state || '',
      country: hotel.country || '',
      pincode: hotel.pincode || '',
      contactNumber: hotel.contactNumber || '',
      email: hotel.email || '',
      starRating: hotel.starRating,
      amenities: hotel.amenities || '',
      status: hotel.status,
      imageUrl: hotel.imageUrl || ''
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedHotel = null;
  }

  openStaffModal(hotel: Hotel) {
    this.selectedHotel = hotel;
    this.staffForm = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: 'MANAGER'
    };
    this.showStaffModal = true;
  }

  closeStaffModal() {
    this.showStaffModal = false;
    this.selectedHotel = null;
  }

  onCreateHotel() {
    this.adminService.createHotel(this.hotelForm).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadHotels();
      },
      error: (error) => {
        console.error('Error creating hotel:', error);
      }
    });
  }

  onUpdateHotel() {
    if (!this.selectedHotel) return;
    
    this.adminService.updateHotel(this.selectedHotel.id, this.hotelForm).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadHotels();
      },
      error: (error) => {
        console.error('Error updating hotel:', error);
      }
    });
  }

  onCreateStaff() {
    if (!this.selectedHotel) return;
    
    this.adminService.createStaff(this.selectedHotel.id, this.staffForm).subscribe({
      next: () => {
        this.closeStaffModal();
      },
      error: (error) => {
        console.error('Error creating staff:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

