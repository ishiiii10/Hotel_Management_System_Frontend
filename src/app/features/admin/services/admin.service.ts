import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  userId?: number;
  id?: number;
  publicUserId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
  hotelId: number | null;
}

export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  roomId: number;
  roomNumber?: string;
  roomType?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests?: number;
  numberOfNights?: number;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CancelBookingRequest {
  reason: string;
}

export interface Hotel {
  id: number;
  name: string;
  category: string;
  description?: string;
  city: string;
  address: string;
  state?: string;
  country?: string;
  pincode?: string;
  contactNumber?: string;
  email?: string;
  starRating: number;
  amenities?: string;
  status: string;
  totalRooms?: number;
  availableRooms?: number;
  imageUrl?: string;
}

export interface CreateHotelRequest {
  name: string;
  category: string;
  description: string;
  city: string;
  address: string;
  state: string;
  country: string;
  pincode: string;
  contactNumber: string;
  email: string;
  starRating: number;
  amenities: string;
  status: string;
  imageUrl?: string;
}

export interface CreateStaffRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/auth/admin/users`);
  }

  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`);
  }

  createHotel(hotel: CreateHotelRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels`, hotel);
  }

  createStaff(hotelId: number, staff: CreateStaffRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/${hotelId}/staff`, staff);
  }

  updateHotel(hotelId: number, hotel: CreateHotelRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/hotels/${hotelId}`, hotel);
  }

  deactivateUser(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/auth/admin/users/${userId}/deactivate`, {});
  }

  reassignStaffHotel(userId: number, hotelId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/auth/admin/staff/${userId}/hotel-allotment?hotelId=${hotelId}`, {});
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  cancelBooking(bookingId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}/cancel`, { reason });
  }

  getStaffByHotelId(hotelId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/hotels/${hotelId}/staff`);
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/auth/me`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  getAdminDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/dashboard/admin`);
  }

  getHotelReports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/hotels`);
  }
}

export interface UserResponse {
  id: number;
  publicUserId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

