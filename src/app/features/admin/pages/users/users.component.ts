import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, User, Hotel } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  hotels: Hotel[] = [];
  isLoading = false;
  
  showReassignModal = false;
  selectedUser: User | null = null;
  selectedHotelId: number | null = null;
  
  searchName = '';
  searchEmail = '';
  searchRole = '';
  searchStatus = '';
  searchHotelId: number | null = null;
  
  roles = ['ADMIN', 'GUEST', 'MANAGER', 'RECEPTIONIST'];
  statuses = ['enabled', 'disabled'];

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
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });

    this.adminService.getAllHotels().subscribe({
      next: (response: any) => {
        this.hotels = response.data || response;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
      }
    });
  }

  onSearch() {
    if (this.searchHotelId && this.searchHotelId > 0) {
      this.loadUsersByHotel(this.searchHotelId);
    } else {
      this.filterUsers();
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const nameMatch = !this.searchName || user.fullName.toLowerCase().includes(this.searchName.toLowerCase()) || user.username.toLowerCase().includes(this.searchName.toLowerCase());
      const emailMatch = !this.searchEmail || user.email.toLowerCase().includes(this.searchEmail.toLowerCase());
      const roleMatch = !this.searchRole || user.role === this.searchRole;
      const statusMatch = !this.searchStatus || (this.searchStatus === 'enabled' && user.enabled) || (this.searchStatus === 'disabled' && !user.enabled);
      return nameMatch && emailMatch && roleMatch && statusMatch;
    });
  }

  loadUsersByHotel(hotelId: number) {
    this.isLoading = true;
    this.adminService.getStaffByHotelId(hotelId).subscribe({
      next: (response: any) => {
        const staff = response.data || response;
        this.filteredUsers = staff.filter((user: User) => {
          const nameMatch = !this.searchName || user.fullName.toLowerCase().includes(this.searchName.toLowerCase()) || user.username.toLowerCase().includes(this.searchName.toLowerCase());
          const emailMatch = !this.searchEmail || user.email.toLowerCase().includes(this.searchEmail.toLowerCase());
          const roleMatch = !this.searchRole || user.role === this.searchRole;
          const statusMatch = !this.searchStatus || (this.searchStatus === 'enabled' && user.enabled) || (this.searchStatus === 'disabled' && !user.enabled);
          return nameMatch && emailMatch && roleMatch && statusMatch;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading staff by hotel:', error);
        this.isLoading = false;
        this.filteredUsers = [];
      }
    });
  }

  onReset() {
    this.searchName = '';
    this.searchEmail = '';
    this.searchRole = '';
    this.searchStatus = '';
    this.searchHotelId = null;
    this.filteredUsers = [...this.users];
  }

  openReassignModal(user: User) {
    this.selectedUser = user;
    this.selectedHotelId = user.hotelId || null;
    this.showReassignModal = true;
  }

  closeReassignModal() {
    this.showReassignModal = false;
    this.selectedUser = null;
    this.selectedHotelId = null;
  }

  onDeactivateUser(user: User) {
    const userId = user.userId || user.id;
    if (!userId) return;
    
    if (confirm(`Are you sure you want to deactivate ${user.fullName}?`)) {
      this.adminService.deactivateUser(userId).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error deactivating user:', error);
        }
      });
    }
  }

  onReassignHotel() {
    if (!this.selectedUser || !this.selectedHotelId) return;
    const userId = this.selectedUser.userId || this.selectedUser.id;
    if (!userId) return;
    
    this.adminService.reassignStaffHotel(userId, this.selectedHotelId).subscribe({
      next: () => {
        this.closeReassignModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error reassigning hotel:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

