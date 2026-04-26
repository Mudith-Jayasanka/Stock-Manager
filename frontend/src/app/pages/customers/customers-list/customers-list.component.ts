import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../../services/customers.service';
import { Customer } from '../../../models';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss',
})
export class CustomersListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  
  searchQuery = '';
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customersService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.applySearch();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.applySearch();
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredCustomers = q
      ? this.customers.filter(c => 
          c.fullName.toLowerCase().includes(q) || 
          c.phone.toLowerCase().includes(q) || 
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q))
        )
      : [...this.customers];
      
    // Reset to first page on search
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  get pagedCustomers(): Customer[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(startIndex, startIndex + this.pageSize);
  }
  
  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredCustomers.length);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}
