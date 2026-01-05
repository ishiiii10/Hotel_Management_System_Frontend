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
  starRating?: number;
  amenities?: string;
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
  checkedInAt?: string;
  checkedOutAt?: string;
  bookingSource?: string; // WALK_IN or PUBLIC
}

export interface WalkInBookingRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  specialRequests?: string;
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

export interface BillResponse {
  id: number;
  bookingId: number;
  userId: number;
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  billNumber: string;
  generatedAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  id: number;
  billId: number;
  bookingId: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentReference?: string;
  notes?: string;
  paidBy?: string;
  paidAt: string;
  createdAt: string;
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

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
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

  checkIn(bookingId: number, request: CheckInRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/check-in`, request);
  }

  checkOut(bookingId: number, request: CheckOutRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/check-out`, request);
  }

  createWalkInBooking(request: WalkInBookingRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/walk-in`, request);
  }

  searchAvailability(hotelId: number, checkIn: string, checkOut: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/check-availability?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`);
  }

  getBillByBookingId(bookingId: number): Observable<BillResponse> {
    return this.http.get<BillResponse>(`${this.apiUrl}/bills/booking/${bookingId}`);
  }

  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/bills/my-payments`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
}
