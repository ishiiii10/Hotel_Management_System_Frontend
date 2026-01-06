import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HotelSearchResult {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  starRating?: number;
  description?: string;
  amenities?: string;
  availableRooms: number;
  totalRooms: number;
  imageUrl?: string;
}

export interface HotelDetail {
  id: number;
  name: string;
  category: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contactNumber: string;
  email: string;
  starRating?: number;
  amenities?: string;
  status: string;
  totalRooms: number;
  availableRooms: number;
  imageUrl?: string;
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  status: string;
  amenities?: string;
  description?: string;
}

export interface AvailableRoom {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  amenities?: string;
  description?: string;
}

export interface AvailabilityResponse {
  hotelId: number;
  totalRooms: number;
  availableRooms: number;
  availableRoomsList: AvailableRoom[];
}

export interface HotelSearchRequest {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HotelSearchService {
  private apiUrl = `${environment.apiUrl}/hotels`;
  private bookingApiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  searchHotels(params: HotelSearchRequest): Observable<HotelSearchResult[]> {
    let httpParams = new HttpParams();

    if (params.city) {
      httpParams = httpParams.set('city', params.city);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }

    return this.http.get<any>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
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

  getHotelById(hotelId: number): Observable<HotelDetail> {
    return this.http.get<any>(`${this.apiUrl}/${hotelId}`).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data;
        }
        return response;
      })
    );
  }

  checkAvailability(hotelId: number, checkIn: string, checkOut: string): Observable<AvailabilityResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('hotelId', hotelId.toString());
    httpParams = httpParams.set('checkIn', checkIn);
    httpParams = httpParams.set('checkOut', checkOut);

    return this.http.get<any>(`${this.bookingApiUrl}/check-availability`, { params: httpParams }).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data;
        }
        return response;
      })
    );
  }

  getAllHotels(): Observable<HotelSearchResult[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
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

  getHotelCategories(): string[] {
    return ['HOTEL', 'VILLA', 'APARTMENT', 'RESORT', 'HOSTEL', 'GUEST_HOUSE', 'HOMESTAY', 'SERVICED_APARTMENT', 'BOUTIQUE_HOTEL'];
  }

  getCities(): string[] {
    return ['DELHI', 'MUMBAI', 'BANGALORE', 'CHENNAI', 'HYDERABAD', 'KOLKATA', 'PUNE', 'JAIPUR', 'AHMEDABAD', 'PATNA', 'KOCHI'];
  }
}
