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
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number;
  numberOfGuests: number;
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

  blockRoom(blockRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/availability/block`, blockRequest);
  }

  unblockRoom(unblockRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hotels/availability/unblock`, unblockRequest);
  }
}

