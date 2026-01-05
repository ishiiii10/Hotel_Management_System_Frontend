import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  hotelId: number | null;
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  token: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    hotelId: number | null;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private authState$ = new BehaviorSubject<AuthState>({
    token: this.getToken(),
    user: this.getCurrentUser()
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.setAuthState(response);
      })
    );
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register/guest`, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState$.next({ token: null, user: null });
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): { id: number; username: string; email: string; role: string; hotelId: number | null } | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentUserProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  private setAuthState(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    const user = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role,
      hotelId: response.hotelId
    };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.authState$.next({ token: response.token, user });
  }
}
