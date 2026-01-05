import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, Room, BlockRoomRequest, UnblockRoomRequest } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-manager-availability',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css'
})
export class ManagerAvailabilityComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = false;
  hotelId: number | null = null;

  showBlockModal = false;
  showUnblockModal = false;
  selectedRoom: Room | null = null;

  blockFromDate = '';
  blockToDate = '';
  blockReason = '';
  unblockFromDate = '';
  unblockToDate = '';

  searchCheckIn = '';
  searchCheckOut = '';
  availabilityResults: any = null;

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get minSearchCheckOutDate(): string {
    if (!this.searchCheckIn) {
      return this.minDate;
    }
    const checkIn = new Date(this.searchCheckIn);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  get minBlockToDate(): string {
    if (!this.blockFromDate) {
      return this.minDate;
    }
    const fromDate = new Date(this.blockFromDate);
    fromDate.setDate(fromDate.getDate() + 1);
    return fromDate.toISOString().split('T')[0];
  }

  get minUnblockToDate(): string {
    if (!this.unblockFromDate) {
      return this.minDate;
    }
    const fromDate = new Date(this.unblockFromDate);
    fromDate.setDate(fromDate.getDate() + 1);
    return fromDate.toISOString().split('T')[0];
  }

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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  searchAvailability() {
    if (!this.hotelId || !this.searchCheckIn || !this.searchCheckOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    this.managerService.searchAvailability(this.hotelId, this.searchCheckIn, this.searchCheckOut).subscribe({
      next: (response: any) => {
        this.availabilityResults = response.data || response;
      },
      error: (error) => {
        console.error('Error searching availability:', error);
        alert('Error searching availability');
      }
    });
  }

  openBlockModal(room: Room) {
    this.selectedRoom = room;
    this.blockFromDate = '';
    this.blockToDate = '';
    this.blockReason = '';
    this.showBlockModal = true;
  }

  closeBlockModal() {
    this.showBlockModal = false;
    this.selectedRoom = null;
    this.blockFromDate = '';
    this.blockToDate = '';
    this.blockReason = '';
  }

  onBlockRoom() {
    if (!this.selectedRoom || !this.hotelId || !this.blockFromDate || !this.blockToDate || !this.blockReason.trim()) {
      alert('Please fill all required fields');
      return;
    }

    const request: BlockRoomRequest = {
      hotelId: this.hotelId,
      roomId: this.selectedRoom.id,
      fromDate: this.blockFromDate,
      toDate: this.blockToDate,
      reason: this.blockReason
    };

    this.managerService.blockRoom(request).subscribe({
      next: () => {
        this.closeBlockModal();
        this.loadRooms();
        if (this.searchCheckIn && this.searchCheckOut) {
          this.searchAvailability();
        }
      },
      error: (error) => {
        console.error('Error blocking room:', error);
        alert('Error blocking room');
      }
    });
  }

  openUnblockModal(room: Room) {
    this.selectedRoom = room;
    this.unblockFromDate = '';
    this.unblockToDate = '';
    this.showUnblockModal = true;
  }

  closeUnblockModal() {
    this.showUnblockModal = false;
    this.selectedRoom = null;
    this.unblockFromDate = '';
    this.unblockToDate = '';
  }

  onUnblockRoom() {
    if (!this.selectedRoom || !this.hotelId || !this.unblockFromDate || !this.unblockToDate) {
      alert('Please fill all required fields');
      return;
    }

    const request: UnblockRoomRequest = {
      hotelId: this.hotelId,
      roomId: this.selectedRoom.id,
      fromDate: this.unblockFromDate,
      toDate: this.unblockToDate
    };

    this.managerService.unblockRoom(request).subscribe({
      next: () => {
        this.closeUnblockModal();
        this.loadRooms();
        if (this.searchCheckIn && this.searchCheckOut) {
          this.searchAvailability();
        }
      },
      error: (error) => {
        console.error('Error unblocking room:', error);
        alert('Error unblocking room');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

