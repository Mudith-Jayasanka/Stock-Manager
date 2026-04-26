import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { LabelTemplatesService } from '../../../services/label-templates.service';
import { Order, OrderStatus, LabelTemplate } from '../../../models';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  templates: LabelTemplate[] = [];
  selectedStatus: OrderStatus | '' = '';
  selectedOrderIds = new Set<string>();
  loading = true;

  readonly statuses: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'making', label: 'Making' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  constructor(
    private ordersService: OrdersService,
    private templatesService: LabelTemplatesService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.templatesService.getTemplates().subscribe(t => (this.templates = t));
  }

  loadOrders() {
    this.loading = true;
    const status = this.selectedStatus || undefined;
    this.ordersService.getOrders(status as OrderStatus).subscribe({
      next: (data) => { this.orders = data; this.selectedOrderIds.clear(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onStatusFilterChange() { this.loadOrders(); }

  toggleSelect(orderId: string) {
    if (this.selectedOrderIds.has(orderId)) this.selectedOrderIds.delete(orderId);
    else this.selectedOrderIds.add(orderId);
  }

  selectAll() {
    if (this.allSelected) this.selectedOrderIds.clear();
    else this.orders.forEach(o => this.selectedOrderIds.add(o.id));
  }

  get allSelected(): boolean {
    return this.orders.length > 0 && this.orders.every(o => this.selectedOrderIds.has(o.id));
  }

  get selectedCount(): number { return this.selectedOrderIds.size; }

  updateStatus(order: Order, status: string) {
    this.ordersService.updateStatus(order.id, status as OrderStatus).subscribe(updated => {
      const idx = this.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) this.orders[idx] = updated;
    });
  }

  printTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    const selectedOrders = this.orders.filter(o => this.selectedOrderIds.has(o.id));
    // Print service will be implemented in Phase 5
    alert(`[Print] Template: "${template.name}" for ${selectedOrders.length} order(s)\n\n(Print engine coming in Phase 5)`);
  }

  getStatusClass(status: string): string { return status; }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }
}
