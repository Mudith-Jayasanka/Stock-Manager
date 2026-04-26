import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../models';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';
  sortBy = '';
  loading = true;

  readonly sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price', label: 'Price' },
    { value: 'profit', label: 'Profit' },
    { value: 'createdAt', label: 'Created Date' },
  ];

  constructor(private productsService: ProductsService) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading = true;
    this.productsService.getProducts(this.sortBy || undefined).subscribe({
      next: (data) => { this.products = data; this.applySearch(); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onSortChange() { this.loadProducts(); }

  onSearch() { this.applySearch(); }

  applySearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredProducts = q
      ? this.products.filter(p => p.name.toLowerCase().includes(q) || p.containerTypeName?.toLowerCase().includes(q))
      : [...this.products];
  }

  deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    this.productsService.deleteProduct(id).subscribe(() => this.loadProducts());
  }

  formatPrice(p: number): string { return `Rs. ${p.toLocaleString()}`; }
}
