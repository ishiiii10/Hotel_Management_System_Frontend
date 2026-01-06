import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, User, Hotel, UpdateStaffRequest } from '../../services/admin.service';
import { AdminSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  hotels: Hotel[] = [];
  isLoading = false;
  
  showReassignModal = false;
  showEditModal = false;
  selectedUser: User | null = null;
  selectedHotelId: number | null = null;
  
  editForm = {
    fullName: '',
    username: '',
    email: '',
    hotelId: null as number | null
  };
  
  searchName = '';
  searchEmail = '';
  searchRole = '';
  searchStatus = '';
  searchHotelId: number | null = null;
  
  roles = ['ADMIN', 'GUEST', 'MANAGER', 'RECEPTIONIST'];
  statuses = ['enabled', 'disabled'];

  constructor(
    private adminService: AdminService,
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

  onActivateUser(user: User) {
    const userId = user.userId || user.id;
    if (!userId) return;
    
    if (confirm(`Are you sure you want to activate ${user.fullName}?`)) {
      this.adminService.activateUser(userId).subscribe({
        next: () => {
          alert('User activated successfully');
          this.loadData();
        },
        error: (error: any) => {
          console.error('Error activating user:', error);
          const errorMessage = error?.error?.message || error?.message || 'Failed to activate user';
          alert(errorMessage);
        }
      });
    }
  }

  onDeactivateUser(user: User) {
    const userId = user.userId || user.id;
    if (!userId) return;
    
    if (confirm(`Are you sure you want to deactivate ${user.fullName}?`)) {
      this.adminService.deactivateUser(userId).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error: any) => {
          console.error('Error deactivating user:', error);
          const errorMessage = error?.error?.message || error?.message || 'Failed to deactivate user';
          alert(errorMessage);
        }
      });
    }
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.editForm = {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      hotelId: user.hotelId
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editForm = {
      fullName: '',
      username: '',
      email: '',
      hotelId: null
    };
  }

  onUpdateStaff() {
    if (!this.selectedUser) return;
    const userId = this.selectedUser.userId || this.selectedUser.id;
    if (!userId) return;

    if (!this.editForm.fullName || !this.editForm.username || !this.editForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    const updateRequest: UpdateStaffRequest = {
      fullName: this.editForm.fullName,
      username: this.editForm.username,
      email: this.editForm.email,
      hotelId: this.editForm.hotelId
    };

    this.adminService.updateStaff(userId, updateRequest).subscribe({
      next: () => {
        alert('Staff details updated successfully');
        this.closeEditModal();
        this.loadData();
      },
      error: (error: any) => {
        console.error('Error updating staff:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to update staff details';
        alert(errorMessage);
      }
    });
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

}

