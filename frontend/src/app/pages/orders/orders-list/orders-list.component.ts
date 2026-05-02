import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { LabelTemplatesService } from '../../../services/label-templates.service';
import { PrintService } from '../../../services/print.service';
import { Order, OrderStatus, LabelTemplate } from '../../../models';
import { OrderListFilter } from '../../../services/orders.service';

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
  selectedStatus: OrderListFilter | '' = 'ongoing';
  selectedOrderIds = new Set<string>();
  loading = true;

  showCancelModal = false;
  orderToCancel: Order | null = null;
  cancelReason = '';
  readonly cancelReasons = [
    'Customer request',
    'Out of stock',
    'Duplicate order',
    'Payment failed',
    'Other'
  ];

  readonly ongoingTooltip = 'Shows Pending, Making, Packaging, Dispatched, and Delivered orders.';

  readonly filters: { value: OrderListFilter | ''; label: string; title?: string }[] = [
    { value: 'ongoing', label: 'Ongoing', title: this.ongoingTooltip },
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'making', label: 'Making' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  readonly statuses: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'making', label: 'Making' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  constructor(
    private ordersService: OrdersService,
    private templatesService: LabelTemplatesService,
    private printService: PrintService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.templatesService.getTemplates().subscribe(t => (this.templates = t));
  }

  loadOrders() {
    this.loading = true;
    const status = this.selectedStatus || undefined;
    this.ordersService.getOrders(status).subscribe({
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
    if (status === 'cancelled') {
      this.orderToCancel = order;
      this.cancelReason = this.cancelReasons[0];
      this.showCancelModal = true;
      return;
    }

    this.ordersService.updateStatus(order.id, status as OrderStatus).subscribe(updated => {
      const idx = this.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) this.orders[idx] = updated;
    });
  }

  confirmCancel() {
    if (!this.orderToCancel || !this.cancelReason) return;

    this.ordersService.updateStatus(this.orderToCancel.id, 'cancelled', this.cancelReason).subscribe(updated => {
      const idx = this.orders.findIndex(o => o.id === this.orderToCancel!.id);
      if (idx !== -1) this.orders[idx] = updated;
      this.closeCancelModal();
    });
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancel = null;
    this.cancelReason = '';
  }

  printTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    const selectedOrders = this.orders.filter(o => this.selectedOrderIds.has(o.id));
    const jobs = selectedOrders.flatMap(order =>
      order.items.flatMap(item =>
        Array.from({ length: item.quantity }, () => ({ order, item }))
      )
    );
    this.printService.printLabelJobs(jobs, template);
  }

  getStatusClass(status: string): string { return status; }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  getSelectedFilterTitle(): string | null {
    return this.filters.find(f => f.value === this.selectedStatus)?.title ?? null;
  }
}
