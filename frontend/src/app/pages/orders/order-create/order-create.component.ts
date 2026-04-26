import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../../services/customers.service';
import { ProductsService } from '../../../services/products.service';
import { OrdersService } from '../../../services/orders.service';
import { Customer, Product } from '../../../models';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss',
})
export class OrderCreateComponent implements OnInit {
  Math = Math; // Expose Math to template
  
  // Customer Form
  customerPhone = '';
  customerFullName = '';
  customerEmail = '';
  customerAddress = '';
  
  isExistingCustomer = false;
  searchingCustomer = false;
  searchDebounce: any;

  // Products
  availableProducts: Product[] = [];
  selectedProductId = '';
  
  // Order Items
  orderItems: { product: Product; quantity: number }[] = [];

  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private customersService: CustomersService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productsService.getProducts().subscribe(data => {
      this.availableProducts = data;
    });
  }

  onPhoneChange() {
    clearTimeout(this.searchDebounce);
    if (this.customerPhone.length < 9) {
      this.isExistingCustomer = false;
      return;
    }

    this.searchDebounce = setTimeout(() => {
      this.searchingCustomer = true;
      this.customersService.searchCustomers(this.customerPhone).subscribe(results => {
        this.searchingCustomer = false;
        
        // Find exact match by sanitized phone
        const sanitizedInput = this.customerPhone.replace(/[\s\-().+]/g, '');
        const match = results.find(c => c.phone.replace(/[\s\-().+]/g, '') === sanitizedInput);
        
        if (match) {
          this.isExistingCustomer = true;
          this.customerFullName = match.fullName;
          this.customerEmail = match.email;
          this.customerAddress = match.address;
          this.showToast('Existing customer found!', 'success');
        } else {
          this.isExistingCustomer = false;
        }
      });
    }, 500);
  }

  addProduct() {
    if (!this.selectedProductId) return;
    const prod = this.availableProducts.find(p => p.id === this.selectedProductId);
    if (!prod) return;

    const existing = this.orderItems.find(i => i.product.id === prod.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.orderItems.push({ product: prod, quantity: 1 });
    }
    this.selectedProductId = '';
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
  }

  get orderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  get isFormValid(): boolean {
    return !!(
      this.customerPhone.trim() &&
      this.customerFullName.trim() &&
      this.customerAddress.trim() &&
      this.orderItems.length > 0
    );
  }

  saveOrder() {
    if (!this.isFormValid || this.saving) return;
    this.saving = true;

    this.ordersService.createOrder({
      customer: {
        phone: this.customerPhone.trim(),
        fullName: this.customerFullName.trim(),
        email: this.customerEmail.trim(),
        address: this.customerAddress.trim()
      },
      items: this.orderItems.map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }))
    }).subscribe({
      next: (order) => {
        this.showToast('Order created successfully!', 'success');
        setTimeout(() => this.router.navigate(['/orders', order.id]), 1000);
      },
      error: () => {
        this.saving = false;
        this.showToast('Failed to create order.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
