import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AdminSidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  metrics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    averageRating: 0
  };

  revenueByHotel: any[] = [];
  revenueTrend: any[] = [];
  bookingTrend: any[] = [];
  bookingStatusDistribution: any[] = [];

  hotels: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadHotels();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.adminService.getAdminDashboard().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.metrics = {
          totalRevenue: data.totalRevenue || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          totalBookings: data.totalBookings || 0,
          totalCheckIns: data.totalCheckIns || 0,
          totalCheckOuts: data.totalCheckOuts || 0,
          averageRating: data.averageRating || 0
        };
        this.revenueByHotel = data.revenueByHotel || [];
        this.revenueTrend = data.revenueTrend || [];
        this.bookingTrend = data.bookingTrend || [];
        this.bookingStatusDistribution = data.bookingStatusDistribution || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  loadHotels() {
    this.adminService.getAllHotels().subscribe({
      next: (response: any) => {
        this.hotels = response.data || response;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getBarPercentage(revenue: number): number {
    if (!revenue || this.revenueByHotel.length === 0) return 0;
    const maxRevenue = Math.max(...this.revenueByHotel.map((item: any) => item.revenue || 0));
    if (maxRevenue === 0) return 0;
    return (revenue / maxRevenue) * 100;
  }

  getBarHeight(revenue: number): number {
    return this.getBarPercentage(revenue);
  }

  getTotalBookings(): number {
    return this.bookingStatusDistribution.reduce((sum, item) => sum + (item.count || 0), 0);
  }

  getDonutColor(index: number): string {
    const colors = ['#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff'];
    return colors[index % colors.length];
  }

  getDonutSegment(count: number, index: number): string {
    const total = this.getTotalBookings();
    if (total === 0) return '0 502.65';
    const circumference = 2 * Math.PI * 80; // radius = 80, full circle
    const percentage = (count / total);
    const segmentLength = percentage * circumference;
    const gap = circumference - segmentLength;
    return `${segmentLength} ${gap}`;
  }

  getDonutOffset(index: number): number {
    if (index === 0) return 0;
    let offset = 0;
    const total = this.getTotalBookings();
    if (total === 0) return 0;
    const circumference = 2 * Math.PI * 80;
    
    for (let i = 0; i < index; i++) {
      const count = this.bookingStatusDistribution[i]?.count || 0;
      const percentage = (count / total);
      offset += percentage * circumference;
    }
    
    return -offset;
  }

  getLinePath(data: any[], valueKey: string): string {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240; // Leave space for labels
    const barWidth = Math.max(100, 600 / data.length); // Dynamic width based on data points
    const padding = 50;
    
    let path = '';
    data.forEach((item, index) => {
      const value = item[valueKey] || 0;
      const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
      const y = chartHeight - normalizedValue + 20; // 20px padding from bottom
      const x = index * barWidth + padding;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  }

  getLineAreaPath(data: any[], valueKey: string): string {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const barWidth = Math.max(100, 600 / data.length);
    const padding = 50;
    const bottomY = chartHeight + 20;
    
    let path = this.getLinePath(data, valueKey);
    if (!path) return '';
    
    // Close the path to create area
    const lastX = (data.length - 1) * barWidth + padding;
    const firstX = padding;
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    
    return path;
  }

  getLineYPosition(value: number, data: any[], valueKey: string): number {
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
    return chartHeight - normalizedValue + 20;
  }

  formatDateLabel(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getLineChartViewBox(dataLength: number): string {
    const width = Math.max(600, dataLength * 100);
    return `0 0 ${width} 300`;
  }

  getLineChartXPosition(index: number, dataLength: number): number {
    const barWidth = Math.max(100, 600 / dataLength);
    const padding = Math.max(50, 300 / dataLength);
    return index * barWidth + padding;
  }

  getLineChartGridWidth(dataLength: number): number {
    return Math.max(600, dataLength * 100);
  }

  // Combined chart methods
  getCombinedChartViewBox(): string {
    const dataLength = Math.max(this.revenueTrend.length, this.bookingTrend.length);
    const width = Math.max(600, dataLength * 100);
    return `0 0 ${width} 300`;
  }

  getCombinedChartWidth(): number {
    const dataLength = Math.max(this.revenueTrend.length, this.bookingTrend.length);
    return Math.max(600, dataLength * 100);
  }

  getCombinedChartXPosition(index: number): number {
    const dataLength = Math.max(this.revenueTrend.length, this.bookingTrend.length);
    const barWidth = Math.max(100, 600 / dataLength);
    const padding = Math.max(50, 300 / dataLength);
    return index * barWidth + padding;
  }

  getCombinedDates(): string[] {
    // Get unique dates from both trends
    const dates = new Set<string>();
    this.revenueTrend.forEach(item => dates.add(item.date));
    this.bookingTrend.forEach(item => dates.add(item.date));
    return Array.from(dates).sort();
  }

  getCombinedLinePath(data: any[], valueKey: string, isRevenue: boolean): string {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const dataLength = Math.max(this.revenueTrend.length, this.bookingTrend.length);
    const barWidth = Math.max(100, 600 / dataLength);
    const padding = Math.max(50, 300 / dataLength);
    
    let path = '';
    data.forEach((item, index) => {
      const value = item[valueKey] || 0;
      const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
      const y = chartHeight - normalizedValue + 20;
      const x = index * barWidth + padding;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  }

  getCombinedLineAreaPath(data: any[], valueKey: string, isRevenue: boolean): string {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const dataLength = Math.max(this.revenueTrend.length, this.bookingTrend.length);
    const barWidth = Math.max(100, 600 / dataLength);
    const padding = Math.max(50, 300 / dataLength);
    const bottomY = chartHeight + 20;
    
    let path = this.getCombinedLinePath(data, valueKey, isRevenue);
    if (!path) return '';
    
    const lastX = (data.length - 1) * barWidth + padding;
    const firstX = padding;
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    
    return path;
  }

  getCombinedLineYPosition(value: number, data: any[], valueKey: string, isRevenue: boolean): number {
    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
    const minValue = Math.min(...data.map(item => item[valueKey] || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
    return chartHeight - normalizedValue + 20;
  }

  getRevenueYAxisLabels(): Array<{value: string, y: number}> {
    if (this.revenueTrend.length === 0) return [];
    const maxValue = Math.max(...this.revenueTrend.map(item => item.amount || 0));
    const minValue = Math.min(...this.revenueTrend.map(item => item.amount || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const labels: Array<{value: string, y: number}> = [];
    
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (range * (i / 4));
      const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
      const y = chartHeight - normalizedValue + 20;
      labels.push({
        value: this.formatCurrency(value),
        y: y + 4 // Adjust for text baseline
      });
    }
    
    return labels;
  }

  getBookingYAxisLabels(): Array<{value: string, y: number}> {
    if (this.bookingTrend.length === 0) return [];
    const maxValue = Math.max(...this.bookingTrend.map(item => item.count || 0));
    const minValue = Math.min(...this.bookingTrend.map(item => item.count || 0));
    const range = maxValue - minValue || 1;
    const chartHeight = 240;
    const labels: Array<{value: string, y: number}> = [];
    
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (range * (i / 4));
      const normalizedValue = range > 0 ? ((value - minValue) / range) * chartHeight : chartHeight / 2;
      const y = chartHeight - normalizedValue + 20;
      labels.push({
        value: Math.round(value).toString(),
        y: y + 4 // Adjust for text baseline
      });
    }
    
    return labels;
  }

}
