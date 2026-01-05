import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CreateBookingRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  rooms?: number;
  specialRequests?: string;
}

export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests: number;
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

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(request: CreateBookingRequest): Observable<Booking> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((response: any) => response.data || response)
    );
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<any>(`${this.apiUrl}/my-bookings`).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getBookingById(bookingId: number): Observable<Booking> {
    return this.http.get<any>(`${this.apiUrl}/${bookingId}`).pipe(
      map((response: any) => response.data || response)
    );
  }

  confirmBooking(bookingId: number): Observable<Booking> {
    return this.http.post<any>(`${this.apiUrl}/${bookingId}/confirm`, {}).pipe(
      map((response: any) => response.data || response)
    );
  }

  cancelBooking(bookingId: number, reason: string): Observable<Booking> {
    return this.http.post<any>(`${this.apiUrl}/${bookingId}/cancel`, { reason }).pipe(
      map((response: any) => response.data || response)
    );
  }

  calculateTotalAmount(pricePerNight: number, checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
  }

  calculateTaxes(totalAmount: number, taxRate: number = 0.18): number {
    return totalAmount * taxRate;
  }

  calculateGrandTotal(totalAmount: number, taxes: number): number {
    return totalAmount + taxes;
  }
}

