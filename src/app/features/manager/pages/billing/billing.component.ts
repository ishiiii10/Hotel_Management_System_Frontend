import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, BillResponse, PaymentResponse } from '../../services/manager.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ManagerSidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-manager-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ManagerSidebarComponent],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class ManagerBillingComponent implements OnInit {
  payments: PaymentResponse[] = [];
  isLoading = false;
  showBillModal = false;
  selectedBill: BillResponse | null = null;
  searchBookingId: number | null = null;

  constructor(
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.managerService.getMyPayments().subscribe({
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

    this.managerService.getBillByBookingId(this.searchBookingId).subscribe({
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

}

