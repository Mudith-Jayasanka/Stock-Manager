import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { LabelTemplatesService } from '../../../services/label-templates.service';
import { PrintService } from '../../../services/print.service';
import { Order, OrderItem, LabelTemplate } from '../../../models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  templates: LabelTemplate[] = [];
  loading = true;
  error = '';
  openPrintMenuFor: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private templatesService: LabelTemplatesService,
    private printService: PrintService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
      this.loadTemplates();
    }
  }

  loadOrder(id: string) {
    this.loading = true;
    this.ordersService.getOrder(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Order not found.';
        this.loading = false;
      }
    });
  }

  loadTemplates() {
    this.templatesService.getTemplates().subscribe(data => this.templates = data);
  }

  get orderTotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  }

  printTemplate(templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template || !this.order) return;

    const jobs = this.order.items.flatMap(item =>
      Array.from({ length: item.quantity }, () => ({ order: this.order!, item }))
    );
    this.printService.printLabelJobs(jobs, template);
  }

  toggleRowPrintMenu(item: OrderItem) {
    this.openPrintMenuFor = this.openPrintMenuFor === item.productId ? null : item.productId;
  }

  printItemTemplate(item: OrderItem, templateId: string) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template || !this.order) return;

    this.openPrintMenuFor = null;
    this.printService.printLabelJobs([{ order: this.order, item }], template);
  }
}
