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
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private apiUrl = `${environment.apiUrl}/auth`;

  private authState$ = new BehaviorSubject<AuthState>(this.getInitialState());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getInitialState(): AuthState {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentUser() {
    return this.authState$.value.user;
  }

  getToken(): string | null {
    return this.authState$.value.token;
  }

  isAuthenticated(): boolean {
    return !!this.authState$.value.token;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuthState(response.token, {
          id: response.userId,
          username: response.username,
          email: response.email,
          role: response.role,
          hotelId: response.hotelId
        });
      })
    );
  }

  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register/guest`, data);
  }

  getCurrentUserInfo(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authState$.next({ token: null, user: null });
    this.router.navigate(['/login']);
  }

  private setAuthState(token: string, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authState$.next({ token, user });
  }
}
