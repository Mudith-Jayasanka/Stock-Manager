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
  saving = false;
  errorMessage = '';

  showEditModal = false;
  showDeleteModal = false;
  selectedCustomer: Customer | null = null;
  editForm = {
    fullName: '',
    phone: '',
    email: '',
    address: ''
  };

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

  openEdit(customer: Customer) {
    this.selectedCustomer = customer;
    this.editForm = {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    };
    this.errorMessage = '';
    this.showEditModal = true;
  }

  closeEdit() {
    if (this.saving) return;
    this.showEditModal = false;
    this.selectedCustomer = null;
    this.errorMessage = '';
  }

  saveCustomer() {
    if (!this.selectedCustomer || !this.editForm.fullName.trim() || !this.editForm.phone.trim()) return;

    this.saving = true;
    this.errorMessage = '';
    this.customersService.updateCustomer(this.selectedCustomer.id, {
      fullName: this.editForm.fullName.trim(),
      phone: this.editForm.phone.trim(),
      email: this.editForm.email.trim(),
      address: this.editForm.address.trim()
    }).subscribe({
      next: (updated) => {
        const idx = this.customers.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.customers[idx] = updated;
        this.applySearch();
        this.saving = false;
        this.closeEdit();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Could not update customer.';
        this.saving = false;
      }
    });
  }

  openDelete(customer: Customer) {
    this.selectedCustomer = customer;
    this.errorMessage = '';
    this.showDeleteModal = true;
  }

  closeDelete() {
    if (this.saving) return;
    this.showDeleteModal = false;
    this.selectedCustomer = null;
    this.errorMessage = '';
  }

  confirmDelete() {
    if (!this.selectedCustomer) return;

    this.saving = true;
    this.errorMessage = '';
    const customerId = this.selectedCustomer.id;
    this.customersService.deleteCustomer(customerId).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.id !== customerId);
        this.applySearch();
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.saving = false;
        this.closeDelete();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Could not delete customer.';
        this.saving = false;
      }
    });
  }
}
