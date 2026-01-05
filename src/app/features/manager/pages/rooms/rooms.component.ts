import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, Room, CreateRoomRequest } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-manager-rooms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class ManagerRoomsComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showCreateModal = false;
  showEditModal = false;
  selectedRoom: Room | null = null;

  roomForm: CreateRoomRequest = {
    hotelId: 0,
    roomNumber: '',
    roomType: 'STANDARD',
    pricePerNight: 0,
    maxOccupancy: 1,
    floorNumber: undefined,
    bedType: '',
    roomSize: undefined,
    amenities: '',
    description: '',
    status: 'AVAILABLE',
    isActive: true
  };

  searchRoomNumber = '';
  searchStatus = '';
  searchType = '';

  roomTypes = ['STANDARD', 'DELUXE', 'EXECUTIVE', 'SUITE', 'PRESIDENTIAL'];
  roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE', 'INACTIVE'];

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.hotelId) {
      console.error('User not assigned to a hotel');
      return;
    }
    this.hotelId = user.hotelId;
    this.loadRooms();
  }

  loadRooms() {
    if (!this.hotelId) return;

    this.isLoading = true;
    this.managerService.getHotelRooms(this.hotelId).subscribe({
      next: (response: any) => {
        this.rooms = response.data || response;
        this.filteredRooms = [...this.rooms];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.filteredRooms = this.rooms.filter(room => {
      const numberMatch = !this.searchRoomNumber || room.roomNumber.toLowerCase().includes(this.searchRoomNumber.toLowerCase());
      const statusMatch = !this.searchStatus || room.status === this.searchStatus;
      const typeMatch = !this.searchType || room.roomType === this.searchType;
      return numberMatch && statusMatch && typeMatch;
    });
  }

  onReset() {
    this.searchRoomNumber = '';
    this.searchStatus = '';
    this.searchType = '';
    this.filteredRooms = [...this.rooms];
  }

  openCreateModal() {
    if (!this.hotelId) return;
    this.roomForm = {
      hotelId: this.hotelId,
      roomNumber: '',
      roomType: 'STANDARD',
      pricePerNight: 0,
      maxOccupancy: 1,
      floorNumber: undefined,
      bedType: '',
      roomSize: undefined,
      amenities: '',
      description: '',
      status: 'AVAILABLE',
      isActive: true
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  onCreateRoom() {
    if (!this.hotelId) return;

    this.managerService.createRoom(this.roomForm).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error creating room:', error);
        alert('Error creating room');
      }
    });
  }

  openEditModal(room: Room) {
    this.selectedRoom = room;
    this.roomForm = {
      hotelId: room.hotelId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      maxOccupancy: room.maxOccupancy,
      floorNumber: room.floorNumber,
      bedType: room.bedType || '',
      roomSize: room.roomSize,
      amenities: room.amenities || '',
      description: room.description || '',
      status: room.status,
      isActive: room.isActive
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedRoom = null;
  }

  onUpdateRoom() {
    if (!this.selectedRoom) return;

    this.managerService.updateRoom(this.selectedRoom.id, this.roomForm).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error updating room:', error);
        alert('Error updating room');
      }
    });
  }

  onDeleteRoom(room: Room) {
    if (!confirm(`Are you sure you want to delete room ${room.roomNumber}?`)) return;

    this.managerService.deleteRoom(room.id).subscribe({
      next: () => {
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error deleting room:', error);
        alert('Error deleting room');
      }
    });
  }

  onStatusChange(room: Room, status: string) {
    this.managerService.updateRoomStatus(room.id, status).subscribe({
      next: () => {
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error updating room status:', error);
        alert('Error updating room status');
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  logout() {
    this.authService.logout();
  }
}

