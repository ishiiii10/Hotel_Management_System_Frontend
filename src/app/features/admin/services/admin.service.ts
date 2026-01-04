import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  userId: number;
  publicUserId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
  hotelId: number | null;
}

export interface Hotel {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  status: string;
  starRating: number;
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

  deactivateUser(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/auth/admin/users/${userId}/deactivate`, {});
  }
}

