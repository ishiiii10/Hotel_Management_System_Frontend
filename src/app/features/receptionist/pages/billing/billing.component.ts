import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceptionistService, BillResponse, PaymentResponse } from '../../services/receptionist.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-receptionist-billing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class ReceptionistBillingComponent implements OnInit {
  payments: PaymentResponse[] = [];
  isLoading = false;
  showBillModal = false;
  selectedBill: BillResponse | null = null;
  searchBookingId: number | null = null;

  constructor(
    private receptionistService: ReceptionistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.receptionistService.getMyPayments().subscribe({
      next: (response: any) => {
        this.payments = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }

  searchBill() {
    if (!this.searchBookingId) {
      alert('Please enter a booking ID');
      return;
    }

    this.receptionistService.getBillByBookingId(this.searchBookingId).subscribe({
      next: (response: any) => {
        this.selectedBill = response.data || response;
        this.showBillModal = true;
      },
      error: (error) => {
        console.error('Error loading bill:', error);
        alert('Error loading bill. Please check the booking ID.');
      }
    });
  }

  closeBillModal() {
    this.showBillModal = false;
    this.selectedBill = null;
    this.searchBookingId = null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  logout() {
    this.authService.logout();
  }
}

