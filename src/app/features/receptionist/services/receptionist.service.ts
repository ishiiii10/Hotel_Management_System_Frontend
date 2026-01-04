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

@Injectable({
  providedIn: 'root'
})
export class ReceptionistService {
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

  updateRoomStatus(roomId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/hotels/rooms/${roomId}/status?status=${status}`, {});
  }

  checkIn(bookingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}/checkin`, {});
  }

  checkOut(bookingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}/checkout`, {});
  }
}

