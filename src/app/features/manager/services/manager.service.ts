import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface HotelDetail {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contactNumber: string;
  email: string;
  starRating: number;
  amenities: string;
  status: string;
  totalRooms: number;
  availableRooms: number;
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string;
  description: string;
  status: string;
  isActive: boolean;
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
  status: string;
  totalAmount: number;
  numberOfGuests?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  cancellationReason?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt?: string;
}

export interface CreateRoomRequest {
  hotelId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string;
  description: string;
}

export interface BlockRoomRequest {
  hotelId: number;
  roomId: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface UnblockRoomRequest {
  hotelId: number;
  roomId: number;
  fromDate: string;
  toDate: string;
}

export interface CheckInRequest {
  notes?: string;
}

export interface CheckOutRequest {
  notes?: string;
  rating?: number;
  feedback?: string;
  lateCheckOut?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHotelById(hotelId: number): Observable<HotelDetail> {
    return this.http.get<HotelDetail>(`${this.apiUrl}/hotels/${hotelId}`);
  }

  getHotelRooms(hotelId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/hotels/rooms/hotel/${hotelId}`);
  }

  getHotelBookings(hotelId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/hotel/${hotelId}`);
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  getTodayCheckIns(hotelId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/hotel/${hotelId}/today-checkins`);
  }

  getTodayCheckOuts(hotelId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/hotel/${hotelId}/today-checkouts`);
  }

  createRoom(room: CreateRoomRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/rooms`, room);
  }

  updateHotel(hotelId: number, hotel: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hotels/${hotelId}`, hotel);
  }

  updateRoom(roomId: number, room: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hotels/rooms/${roomId}`, room);
  }

  updateRoomStatus(roomId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/hotels/rooms/${roomId}/status?status=${status}`, {});
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/hotels/rooms/${roomId}`);
  }

  blockRoom(blockRequest: BlockRoomRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/availability/block`, blockRequest);
  }

  unblockRoom(unblockRequest: UnblockRoomRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/availability/unblock`, unblockRequest);
  }

  getManagerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/dashboard/manager`);
  }

  checkIn(bookingId: number, request: CheckInRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/check-in`, request);
  }

  checkOut(bookingId: number, request: CheckOutRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/check-out`, request);
  }

  cancelBooking(bookingId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/cancel`, { reason });
  }

  confirmBooking(bookingId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/confirm`, {});
  }

  searchAvailability(hotelId: number, checkIn: string, checkOut: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hotels/availability/search?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`);
  }
}
