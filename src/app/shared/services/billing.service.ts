import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BillResponse {
  id: number;
  bookingId: number;
  userId: number;
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID';
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

export interface MarkBillPaidRequest {
  paymentMethod: string;
  transactionId?: string;
  paymentReference?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/bills`;

  constructor(private http: HttpClient) {}

  getBillByBookingId(bookingId: number): Observable<BillResponse> {
    return this.http.get<any>(`${this.apiUrl}/booking/${bookingId}`).pipe(
      map(response => response.data)
    );
  }

  markBillAsPaid(billId: number, request: MarkBillPaidRequest): Observable<BillResponse> {
    return this.http.post<any>(`${this.apiUrl}/${billId}/mark-paid`, request).pipe(
      map(response => response.data)
    );
  }

  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/my-payments`).pipe(
      map(response => response.data)
    );
  }

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/payments`).pipe(
      map(response => response.data)
    );
  }

  manuallyGenerateBill(bookingId: number): Observable<BillResponse> {
    return this.http.post<any>(`${this.apiUrl}/generate/${bookingId}`, {}).pipe(
      map(response => response.data)
    );
  }
}

